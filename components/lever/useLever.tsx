import { BigNumber, ethers, utils } from 'ethers';
import { zeroPad } from 'ethers/lib/utils';
import { useContext, useEffect, useMemo, useState } from 'react';
import { WETH, WSTETH } from '../../config/assets';
import { ZERO_BN } from '../../constants';
import { IInputContextState, InputContext, W3bNumber } from '../../context/InputContext';
import { LeverContext } from '../../context/LeverContext';
import { AppState } from '../../lib/protocol/types';
import { convertToW3bNumber } from '../../lib/utils';

// const GAS_PRICE = ethers.utils.parseUnits('100', 'gwei');
// const UNITS_LEVERAGE = 2;
// const DEFAULT_LEVERAGE = BigNumber.from(300);

const OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: '0.1%' },
  { value: 5, label: '0.5%' },
  { value: 10, label: '1%' },
  { value: 50, label: '5%' },
];

export const useLever = () => {
  /* Bring in context*/
  const [leverState, leverActions] = useContext(LeverContext);
  const [inputState] = useContext(InputContext);

  const { contracts, assets } = leverState;
  const { input, leverage, selectedStrategy } = inputState as IInputContextState;

  const { setAppState } = leverActions;

  const selectedShortAsset = assets.get(selectedStrategy?.baseId);

  const [slippage, setSlippage] = useState(OPTIONS[1].value);
  const changeSlippage = (value: number) => setSlippage(value * 10); // check
  const addSlippage = (num: BigNumber, slippage: number) => num.mul(1000 + slippage).div(1000);
  const removeSlippage = (num: BigNumber, slippage: number) => num.mul(1000 - slippage).div(1000);

  const toW3bNumber = (value: BigNumber): W3bNumber => {
    return convertToW3bNumber(value, selectedShortAsset?.decimals, selectedShortAsset?.displayDecimals);
  };

  const [inputAsFyToken, setInputAsFyToken] = useState<W3bNumber>();
  useEffect(() => {
    if (input) {
      setInputAsFyToken(input);
    }
  }, [input]);

  /* calculate the total to invest, ( the amount of fyTokens ) and express it as a w3bnumber */
  const [totalToInvest, setTotalToInvest] = useState<W3bNumber>(toW3bNumber(ethers.constants.Zero));
  useEffect(() => {
    if (inputAsFyToken) {
      const total_ = inputAsFyToken.big.mul(leverage.big).div(100);
      setTotalToInvest(toW3bNumber(total_)); /* set as w3bnumber ETH */
    }
  }, [inputAsFyToken, leverage]);

  /* calculate the total to invest, and express it as a w3bnumber */
  const [toBorrow, setToBorrow] = useState<W3bNumber>(toW3bNumber(ethers.constants.Zero));
  useEffect(() => {
    if (input) {
      const toBorrow_ = totalToInvest.big.sub(input.big);
      setToBorrow(toW3bNumber(toBorrow_)); /* set as w3bNumber */
    }
  }, [totalToInvest]);

  /**
   * Compute how much collateral would be generated by investing with these
   * parameters. TODO generalise for any collateral
   */
  const computeStEthCollateral = async (): Promise<BigNumber> => {

    if (selectedStrategy) {
    // const fyWeth = await getFyToken(seriesId, contracts, account);
    const fyWeth = selectedStrategy.investTokenContract;
    const fee = await fyWeth.flashFee(fyWeth.address, toBorrow);
    const netInvestAmount = input.big.add(toBorrow.big).sub(fee); // - netInvestAmount = baseAmount + borrowAmount - fee

    // - sellFyWeth: FyWEth -> WEth
    const obtainedWEth = await selectedStrategy.marketContract.sellFYTokenPreview(netInvestAmount);

    // - stableSwap exchange: WEth -> StEth
    // const stableswap = getContract(WETH_ST_ETH_STABLESWAP, contracts, account);
    const stableswap = selectedStrategy.marketContract;
    const boughtStEth = await stableswap.get_dy(0, 1, obtainedWEth);

    // - Wrap: StEth -> WStEth
    // const wStEth = getContract(WST_ETH, contracts, account);
    const wStEth = assets.get(WSTETH).assetContract;
    const wrapped = await wStEth.getWstETHByStETH(boughtStEth);

    return wrapped;
    }
    return ZERO_BN;
  };

  const getCauldronDebt = async () => {
    return await contracts.cauldron.debt(selectedStrategy?.baseId, selectedStrategy?.ilkId);
  };

  /**
   * Same functionality as the vaultlevel function in cauldron. If this returns
   * a negative number, the vault would be undercollateralized.
   */
  const vaultLevel = async (ink: BigNumber, art: BigNumber): Promise<BigNumber> => {
    const spotOracle = await contracts.cauldron.spotOracles(selectedStrategy?.baseId, selectedStrategy?.ilkId);
    const ratio = BigNumber.from(spotOracle.ratio).mul(BigNumber.from(10).pow(12));
    const inkValue = (
      await selectedStrategy?.oracleContract.peek(
        utils.concat([selectedStrategy.ilkId, zeroPad([], 32 - 6)]),
        utils.concat([selectedStrategy.baseId, zeroPad([], 32 - 6)]),
        ink
      )
    ).value;
    return inkValue.sub(art.mul(ratio).div(BigNumber.from(10).pow(18)));
  };

  /**
   *
   *
   *
   *
   */

  /** The resulting collateral after having invested. */
  const [stEthCollateral, setStEthCollateral] = useState<BigNumber | undefined>();
  useEffect(() => {
    if (selectedStrategy?.seriesId === undefined) {
      setStEthCollateral(undefined);
      return;
    }
    if (input.big.eq(0)) {
      setStEthCollateral(BigNumber.from(0));
      return;
    }
    let shouldUseResult = true;

    // void computeStEthCollateral().then((v) => {
    //   if (shouldUseResult) setStEthCollateral(v);
    // });

    return () => {
      shouldUseResult = false;
    };
  }, [input, toBorrow, selectedStrategy]);

  /**
   * The minimum collateral that must be obtained when invested. The result of
   */
  const stEthMinCollateral = useMemo(
    () => (stEthCollateral === undefined ? undefined : removeSlippage(stEthCollateral, slippage)),
    [stEthCollateral, slippage]
  );

  // useEffect(() => {
  //   if (selectedStrategy?.seriesId === undefined) return;
  //   // const balance = balances[seriesId];
  //   //if (stEthCollateral === undefined || seriesId === undefined || balance === undefined) return; // Not loaded. The effect will automatically rerun once defined.

  //   // If this effect was superceded, this will be false and the state won't be
  //   // updated by this instance.
  //   let shouldUseResult = true;
  //   setAppState(AppState.Loading);
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
  //   return () => {
  //     shouldUseResult = false;
  //   };

  // }, [
  //   selectedStrategy,
  //   toBorrow,
  //   totalToInvest,
  //   stEthCollateral,
  //   contracts,
  //   input,
  // ]);

  /**
   *
   *
   *
   *
   *
   */

  const approve = async () => {
    if (selectedStrategy?.investTokenContract) {
      setAppState(AppState.Approving);
      const gasLimit = (
        await selectedStrategy.investTokenContract.estimateGas.approve(
          selectedStrategy.leverAddress,
          totalToInvest.big
        )
      ).mul(2);
      const tx = await selectedStrategy.investTokenContract.approve(selectedStrategy.leverAddress, totalToInvest.big);
      await tx.wait();
      setAppState(AppState.Transactable);
    }
  };

  const transact = async () => {

    if (selectedStrategy?.leverContract) {

      setAppState(AppState.Transacting);
      const gasLimit = (
        await selectedStrategy.leverContract.estimateGas.invest(
          selectedStrategy.seriesId,
          input.big,
          toBorrow.big,
          '0'
        )
      ).mul(2);

      const invextTx = await selectedStrategy.leverContract.invest(
        selectedStrategy.seriesId,
        input.big,
        toBorrow.big,
        stEthMinCollateral,
        {
          value: selectedShortAsset.id === WETH ? input.big : ZERO_BN, // value is set as input if using ETH
          gasLimit,
        }
      );

      await invextTx.wait();
    }
  };

  return {
    approve,
    transact,

    totalToInvest,
    toBorrow,

    slippage,
    setSlippage,
    changeSlippage,
    addSlippage,
    removeSlippage,
  };
};
