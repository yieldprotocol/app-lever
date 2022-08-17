import { useContext, useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import { sellBase, sellFYToken, ZERO_BN } from '@yield-protocol/ui-math';
import { contractFactories, WSTETH } from '../../config/contractRegister';
import { IInputContextState, InputContext, W3bNumber } from '../../context/InputContext';

import { IPoolState, MarketContext } from '../../context/MarketContext';
import { convertToW3bNumber, getTimeToMaturity } from '../../lib/utils';
import { LeverContext } from '../../context/LeverContext';
import { WETH_ST_ETH_STABLESWAP, WST_ETH } from '../../contracts';
import { leverSimulation } from '../../components/lever/EstPositionWidget';

export const useStEthSim = (
    inputAsFyToken: W3bNumber,
    totalToInvest:W3bNumber,
    toBorrow: W3bNumber
) : leverSimulation => {

  const [leverState] = useContext(LeverContext);
  const [marketState]: [IPoolState] = useContext(MarketContext);
  const { selectedStrategy, provider } = leverState;

  const [ investPosition, setInvestPosition] = useState<W3bNumber>();
  const [ investValue, setInvestValue] = useState<W3bNumber>(); 
  const [ shortInvested, setShortInvested] = useState<W3bNumber>();
  const [ shortBorrowed, setShortBorrowed] = useState<W3bNumber>();
  const [ debtPosition, setDebtPosition] = useState<W3bNumber>();
  const [ debtValue, setDebtValue] = useState<W3bNumber>();

  const [ flashFee, setFlashFee] = useState<W3bNumber>();

  const [ swapFee, setSwapFee] = useState<W3bNumber>();

  useEffect(()=>{
    // setCollateralGenerated(inputAsFyToken ); 
    computeStEthCollateral();
  },[ toBorrow ])

    /**
     * Compute how much collateral would be generated by investing with these
     * parameters.
     */
     const computeStEthCollateral = async (): Promise<void> => {

        if (selectedStrategy) {        
          // - netInvestAmount = baseAmount + borrowAmount - fee
          // const fyWeth = await getFyToken(seriesId, contracts, account);
          const fyContract= selectedStrategy.investTokenContract;
          const fee = await fyContract.flashFee(fyContract.address, toBorrow.big.toString());
          setFlashFee( convertToW3bNumber( fee.toString() ,18,6 ) )

          const netInvestAmount = inputAsFyToken.big.add(toBorrow.big).sub(fee); // - netInvestAmount = baseAmount + borrowAmount - fee

          setShortBorrowed( toBorrow );

          /* calculate the resulting debt */ 
          const debt_= sellBase (
            marketState.sharesReserves,
            marketState.fyTokenReserves,
            toBorrow.big,
            getTimeToMaturity(marketState.maturity),
            marketState.ts,
            marketState.g1,
            marketState.decimals
          )      
          setDebtPosition( convertToW3bNumber( debt_,18,6 ))

          // - sellFyWeth: FyWEth -> WEth
          // const obtainedWEth = await selectedStrategy.marketContract.sellFYTokenPreview(netInvestAmount);
          const wethObtained = sellFYToken(
            marketState.sharesReserves,
            marketState.fyTokenReserves,
            netInvestAmount,
            getTimeToMaturity(marketState.maturity),
            marketState.ts,
            marketState.g1,
            marketState.decimals
          );

          setShortInvested( convertToW3bNumber( wethObtained,18,6 ) );

          // stableSwap exchange: WEth -> StEth
          const stableSwap = contractFactories[WETH_ST_ETH_STABLESWAP].connect(WETH_ST_ETH_STABLESWAP, provider);
          const boughtStEth = await stableSwap.get_dy(0, 1, wethObtained );
    
          // - Wrap: StEth -> WStEth
          const wStEthContract = contractFactories[WST_ETH].connect(WST_ETH, provider)
          const investPosition_ = await wStEthContract.getWstETHByStETH(boughtStEth);
          setInvestPosition( convertToW3bNumber( investPosition_,18,6 )  );

          // TODO check if there is a fee/cost for unwrapping */

          /* Calculate the value of the investPosition in short terms : via swap */
          const investValue_ = await stableSwap.get_dy(1, 0, boughtStEth )
          setInvestValue( convertToW3bNumber( investValue_,18,6 ) )

        }
      };

      return { investPosition, investValue, debtPosition, shortInvested, shortBorrowed, debtValue, flashFee };
}
