import { useContext, useEffect, useMemo, useState } from 'react';
import { BigNumber } from 'ethers';
import tw from 'tailwind-styled-components';
import Button from '../common/Button';

import { BorderWrap, Header } from '../styles';

import ShortSelect from '../selectors/ShortSelect';
import LongSelect from '../selectors/LongSelect';
import LeverageSelect from '../selectors/LeverageSelect';

import { useLever } from './useLever';
import { ValueInput } from './ValueInput';
import EstPositionWidget from './EstPositionWidget';
import { LeverContext } from '../../context/LeverContext';
import { AppState } from '../../lib/protocol/types';

const Inner = tw.div`m-4 text-center`;
const Grid = tw.div`grid my-5 auto-rows-auto gap-2`;
const TopRow = tw.div`flex justify-between align-middle text-center items-center`;
const ClearButton = tw.button`text-sm`;

const LeverWidget = (contracts: any) => {
  /* Bring in lever context - instead of passing them as props */
  const [leverState, leverActions] = useContext(LeverContext);
  const { account, selectedStrategy, balances, appState } = leverState;
  const { setAppState } = leverActions;

  /* all levereaging functions have been moved into this hooko */
  const {
    DEFAULT_LEVERAGE,
    computeStEthCollateral,
    // resolveInvestToken,
    slippage,
    removeSlippage,
    getCauldronDebt,
    vaultLevel,
  } = useLever();

  const [isTransacting, setIsTransacting] = useState(false);
  const [leverage, setLeverage] = useState(DEFAULT_LEVERAGE);
  const [balanceInput, setBalanceInput] = useState(BigNumber.from(0));

  const handleMax = () => {
    console.log('max');
  };

  const handleInputChange = (name: string, value: string) => console.log(value);
  const handleTransact = () => {};

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

    void computeStEthCollateral(balanceInput, toBorrow).then((v) => {
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

  // const [investToken, setInvestToken] = useState<FYToken>();
  // useEffect(() => {
  //   if (seriesId === undefined) setInvestToken(undefined);
  //   else
  //     void resolveInvestToken(selectedStrategy.investToken, seriesId, contracts, account).then((token: any) =>
  //       setInvestToken(token)
  //     );
  // }, [selectedStrategy, seriesId, contracts, account]);

  useEffect(() => {
    if (seriesId === undefined) return;

    const balance = balances[seriesId];
    if (stEthCollateral === undefined || seriesId === undefined || balance === undefined) return; // Not loaded. The effect will automatically rerun once defined.

    // If this effect was superceded, this will be false and the state won't be
    // updated by this instance.
    let shouldUseResult = true;

    setAppState(AppState.Loading);

    // const checkApprovalState = async (): Promise<AppState> => {
    //   if (selectedStrategy.investToken === undefined) return AppState.Loading;

    //   // First check if the debt is too low
    //   if (totalToInvest.eq(0)) return AppState.DebtTooLow;

    //   const debt = await getCauldronDebt();
    //   const minDebt = BigNumber.from(debt.min).mul(BigNumber.from(10).pow(debt.dec));
    //   if (stEthCollateral.lt(minDebt)) return AppState.DebtTooLow;

    //   // Now check collateralization ratio
    //   const level = await vaultLevel(totalToInvest, toBorrow);
    //   if (level.lt(0)) return AppState.Undercollateralized;

    //   // Check balance
    //   console.log(balanceInput.toString(), balance.toString());
    //   if (balanceInput.gt(balance)) return AppState.NotEnoughFunds;

    //   // Now check for approval
    //   const approval = await selectedStrategy.investToken.allowance(account.getAddress(), selectedStrategy.lever);
    //   if (approval.lt(totalToInvest)) return AppState.ApprovalRequired;

    //   // Finally, use callStatic to assert that the transaction will work
    //   if (selectedStrategy.lever === YIELD_ST_ETH_LEVER) {
    //     const lever = getContract(selectedStrategy.lever, contracts, account);
    //     try {
    //       console.log(
    //         lever.interface.encodeFunctionData('invest', [seriesId, balanceInput, toBorrow, BigNumber.from(0)])
    //       );

    //       // await lever.callStatic.invest(
    //       //   seriesId
    //       //   balanceInput,
    //       //   toBorrow,
    //       //   BigNumber.from(0),
    //       // );
    //     } catch (e) {
    //       // Checking isn't perfect, so try to parse the failure reason
    //       if ((e as { error: { data: { message: string } } }).error.data.message.endsWith('Undercollateralized'))
    //         return AppState.Undercollateralized;
    //       return AppState.UnknownError;
    //     }
    //   }
    //   // If no other criteria match return 'transactable
    //   return AppState.Transactable;
    // };

    // void checkApprovalState().then((ap) => {
    //   if (shouldUseResult) setAppState(ap);
    // });

    return () => {
      shouldUseResult = false;
    };
  }, [
    account,
    selectedStrategy,
    toBorrow,
    totalToInvest,
    stEthCollateral,
    contracts,
    balanceInput,
    seriesId,
    balances,
  ]);

  const approve = async () => {
    if (selectedStrategy) {
      setAppState(AppState.Approving);
      const gasLimit = (
        await selectedStrategy.investToken.estimateGas.approve(selectedStrategy.lever, totalToInvest)
      ).mul(2);
      const tx = await selectedStrategy.investToken.approve(selectedStrategy.lever, totalToInvest);
      await tx.wait();
      setAppState(AppState.Transactable);
    }
  };

  const transact = async () => {
    if (selectedStrategy) {
      setAppState(AppState.Transacting);
      const gasLimit = (
        await selectedStrategy.strategyContract.estimateGas.invest(seriesId, balanceInput, toBorrow, stEthMinCollateral)
      ).mul(2);
      const invextTx = await selectedStrategy.invest(seriesId, balanceInput, toBorrow, stEthMinCollateral, {
        gasLimit,
      });
      await invextTx.wait();
    }
  };

  return (
    <>
      <BorderWrap>
        <Inner>
          <TopRow>
            <Header>Lever</Header>
            <ClearButton onClick={() => console.log('actually, this might not do anything? settings?')}>
              Clear All
            </ClearButton>
          </TopRow>

          <div className="flex flex-row gap-1 my-5">
            Long-short pair:
            <div>
              long
              <LongSelect />
            </div>
            <div>
              short
              <ShortSelect />
            </div>
          </div>

          <div>
            Principle investment
            <ValueInput
              max={BigNumber.from('1000000000000000000')}
              defaultValue={BigNumber.from('130000000000000000')}
              onValueChange={(v) => setBalanceInput(v)}
              decimals={18}
            />
          </div>

          <div>
            Leverage:
            <LeverageSelect  />
          </div>

          <Button
            action={() => transact()}
            disabled={!account || isTransacting || !selectedStrategy}
            loading={isTransacting}
          >
            {!account ? 'Connect Wallet' : isTransacting ? 'Trade Initiated...' : 'Trade'}
          </Button>
        </Inner>
      </BorderWrap>
      <EstPositionWidget />
    </>
  );
};

export default LeverWidget;
