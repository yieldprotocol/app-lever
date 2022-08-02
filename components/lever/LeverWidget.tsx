import { MutableRefObject, useEffect, useMemo, useState } from 'react';
import { BigNumber, ethers, Signer } from 'ethers';
import tw from 'tailwind-styled-components';
import Button from '../common/Button';

import { BorderWrap, Header } from '../styles';
import InputWrap from './InputWrap';

import ShortSelect from '../selectors/ShortSelect';
import LongSelect from '../selectors/LongSelect';
import LeverageSelect from '../selectors/LeverageSelect';

import { Strategy } from '../../objects/Strategy';
import { Contracts, getContract, YIELD_ST_ETH_LEVER } from '../../contracts';
import { Balances, SeriesObject } from '../../objects/Vault';
import { useLever } from './useLever';
import { FYToken } from '../../contracts/types';
import { ValueInput } from './ValueInput';
import EstPositionWidget from './EstPositionWidget';

const Inner = tw.div`m-4 text-center`;
const Grid = tw.div`grid my-5 auto-rows-auto gap-2`;
const TopRow = tw.div`flex justify-between align-middle text-center items-center`;
const ClearButton = tw.button`text-sm`;

interface Properties {
  /** Relevant token balances. */
  strategy: Strategy;
  account: Signer;
  contracts: MutableRefObject<Contracts>;
  balances: Balances;
  /** The series that are valid for the selected strategy. */
  series: SeriesObject[];
}

enum ApprovalState {
  Loading,
  ApprovalRequired,
  Transactable,
  DebtTooLow,
  NotEnoughFunds,
  UnknownError,
  Undercollateralized,
  Approving,
  Transacting,
}

const LeverWidget = (contracts: any, account: any, strategy: any, balances: any) => {
  
  /* all levereaging functions have been moved into this hooko */
  const {
    DEFAULT_LEVERAGE,
    computeStEthCollateral,
    resolveInvestToken,
    slippage,
    removeSlippage,
    getCauldronDebt,
    vaultLevel,
  } = useLever();

  const [isTransacting, setIsTransacting] = useState(false);
  const [ leverage, setLeverage ] = useState(DEFAULT_LEVERAGE);
  const [ balanceInput, setBalanceInput ] = useState(BigNumber.from(0));

  const handleMax = () => {
    console.log('max');
  };

  const handleInputChange = (name: string, value: string) => console.log(value);
  const handleTransact = () => console.log('Transacting');

  /** The currently selected series id. */
  const [seriesId, setSeriesId] = useState<string>();
  // useEffect(() => setSeriesId(series.length === 0 ? undefined : series[0].seriesId), [series]);

  // Use `useMemo` here because every BigNumber will be different while having
  // the same value. That means that effects will be triggered continuously.
  const totalToInvest = useMemo(() => balanceInput.mul(leverage).div(100), [balanceInput, leverage]);
  const toBorrow = useMemo(() => totalToInvest.sub(balanceInput), [totalToInvest, balanceInput]);

  /** The resulting collateral after having invested. */
  const [stEthCollateral, setStEthCollateral] = useState<BigNumber | undefined>();
  useEffect(() => {
    if (seriesId === undefined) {
      setStEthCollateral(undefined);
      return;
    }
    if (balanceInput.eq(0)) {
      setStEthCollateral(BigNumber.from(0));
      return;
    }
    let shouldUseResult = true;

    void computeStEthCollateral(balanceInput, toBorrow, contracts, account, seriesId).then((v) => {
      if (shouldUseResult) setStEthCollateral(v);
    });

    return () => {
      shouldUseResult = false;
    };
  }, [account, balanceInput, contracts, toBorrow, seriesId]);

  /**
   * The minimum collateral that must be obtained when invested. The result of
   */
  const stEthMinCollateral = useMemo(
    () => (stEthCollateral === undefined ? undefined : removeSlippage(stEthCollateral, slippage)),
    [stEthCollateral, slippage]
  );

  const [investToken, setInvestToken] = useState<FYToken>();
  useEffect(() => {
    if (seriesId === undefined) setInvestToken(undefined);
    else
      void resolveInvestToken(strategy.investToken, seriesId, contracts, account).then((token: any) =>
        setInvestToken(token)
      );
  }, [strategy, seriesId, contracts, account]);

  /**
   * The approval state represents whether it is currently possible to
   * transact, whether approval is required or whether there is a reason not to
   * transact.
   */
  const [approvalState, setApprovalState] = useState<ApprovalState>(ApprovalState.Loading);
  const [approvalStateInvalidator, setApprovalStateInvalidator] = useState(0);
  useEffect(() => {
    if (seriesId === undefined) return;
    const balance = balances[seriesId];
    if (stEthCollateral === undefined || seriesId === undefined || balance === undefined) return; // Not loaded. The effect will automatically rerun once defined.

    // If this effect was superceded, this will be false and the state won't be
    // updated by this instance.
    let shouldUseResult = true;
    setApprovalState(ApprovalState.Loading);

    const checkApprovalState = async (): Promise<ApprovalState> => {
      if (investToken === undefined) return ApprovalState.Loading;

      // First check if the debt is too low
      if (totalToInvest.eq(0)) return ApprovalState.DebtTooLow;

      const debt = await getCauldronDebt(contracts, account, strategy);
      const minDebt = BigNumber.from(debt.min).mul(BigNumber.from(10).pow(debt.dec));
      if (stEthCollateral.lt(minDebt)) return ApprovalState.DebtTooLow;

      // Now check collateralization ratio
      const level = await vaultLevel(totalToInvest, toBorrow, contracts, account, strategy);
      if (level.lt(0)) return ApprovalState.Undercollateralized;

      // Check balance
      console.log(balanceInput.toString(), balance.toString());
      if (balanceInput.gt(balance)) return ApprovalState.NotEnoughFunds;

      // Now check for approval
      const approval = await investToken.allowance(account.getAddress(), strategy.lever);
      if (approval.lt(totalToInvest)) return ApprovalState.ApprovalRequired;

      // Finally, use callStatic to assert that the transaction will work
      if (strategy.lever === YIELD_ST_ETH_LEVER) {
        const lever = getContract(strategy.lever, contracts, account);
        try {
          console.log(
            lever.interface.encodeFunctionData('invest', [seriesId, balanceInput, toBorrow, BigNumber.from(0)])
          );

          // await lever.callStatic.invest(
          //   seriesId
          //   balanceInput,
          //   toBorrow,
          //   BigNumber.from(0),
          // );
        } catch (e) {
          // Checking isn't perfect, so try to parse the failure reason
          if ((e as { error: { data: { message: string } } }).error.data.message.endsWith('Undercollateralized'))
            return ApprovalState.Undercollateralized;
          return ApprovalState.UnknownError;
        }
      }
      // If no other criteria match return 'transactable
      return ApprovalState.Transactable;
    };

    void checkApprovalState().then((ap) => {
      if (shouldUseResult) setApprovalState(ap);
    });

    return () => {
      shouldUseResult = false;
    };
  }, [
    account,
    strategy,
    toBorrow,
    totalToInvest,
    stEthCollateral,
    contracts,
    approvalStateInvalidator,
    balanceInput,
    seriesId,
    balances,
    investToken,
  ]);

  const approve = async () => {
    if (investToken === undefined) return; // Loading
    setApprovalState(ApprovalState.Approving);
    const gasLimit = (await investToken.estimateGas.approve(strategy.lever, totalToInvest)).mul(2);
    const tx = await investToken.approve(strategy.lever, totalToInvest);
    await tx.wait();
    setApprovalStateInvalidator((v) => v + 1);
  };

  const transact = async () => {
    if (stEthMinCollateral === undefined || seriesId === undefined) return; // Not yet loaded!
    setApprovalState(ApprovalState.Transacting);
    if (strategy.lever === YIELD_ST_ETH_LEVER) {
      const lever = getContract(strategy.lever, contracts, account);
      const gasLimit = (await lever.estimateGas.invest(seriesId, balanceInput, toBorrow, stEthMinCollateral)).mul(2);
      const invextTx = await lever.invest(seriesId, balanceInput, toBorrow, stEthMinCollateral, { gasLimit });
      await invextTx.wait();
    }
    setApprovalStateInvalidator((v) => v + 1);
  };

  return (
    <>
    <BorderWrap>
      <Inner>
        <TopRow>
          <Header>Lever</Header>
          <ClearButton onClick={()=>console.log('actually, this might not do anything? settings?')}>Clear All</ClearButton>
        </TopRow>

        <div className="flex flex-row gap-1 my-5">
          Long-short pair:
          <div>
            long
            <LongSelect />
          </div>
          {/* <ArrowCircleDownIcon
            className="justify-self-center text-gray-400 hover:border hover:border-secondary-500 rounded-full hover:cursor-pointer z-10"
            height={27}
            width={27}
            onClick={handleToggleDirection}
          /> */}
          <div>
            short
            <ShortSelect />
          </div>
        </div>

        <div>
          Principle investment
          <ValueInput
            max={BigNumber.from('1000000000000000000')}
            defaultValue={BigNumber.from('1000000000000000000')}
            onValueChange={(v) => setBalanceInput(v)}
            decimals={18}
          />
        </div>

        <div>
          Leverage:
          <LeverageSelect />
        </div>

        <Button action={handleTransact} disabled={!account || isTransacting} loading={isTransacting}>
          {!account ? 'Connect Wallet' : isTransacting ? 'Trade Initiated...' : 'Trade'}
        </Button>
      </Inner>
    </BorderWrap>
    <EstPositionWidget />
    </>
  );
};

export default LeverWidget;
