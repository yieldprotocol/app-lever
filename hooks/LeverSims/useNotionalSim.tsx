import { useContext, useMemo, useState } from 'react';
import { sellBase, sellFYToken, ZERO_BN } from '@yield-protocol/ui-math';
import { contractFactories } from '../../config/contractRegister';
import {  InputContext, W3bNumber } from '../../context/InputContext';

import { IPoolState, MarketContext } from '../../context/MarketContext';
import { convertToW3bNumber } from '../../lib/utils';
import { LeverContext } from '../../context/LeverContext';
import { WST_ETH } from '../../contracts_';
import { ZERO_W3N } from '../../constants';
import { LeverSimulation, simOutput } from '../useLever';

export const useNotionalSim = ( ): any => {
  const [ leverState ] = useContext(LeverContext);
  const [ marketState ]: [IPoolState] = useContext(MarketContext);
  const { selectedStrategy, provider } = leverState;

  const [ inputState ] = useContext(InputContext);

  const [isSimulating, setIsSimulating] = useState<boolean>(false);


  /**
   * Compute how much collateral would be generated by investing with these
   * parameters.
   */
  const simulateInvest =  async (): Promise<any> => {

    setIsSimulating(true);

    console.log( 'Using Notional lever');
    
    // sim logic
    const simulation = {
      investPosition: ZERO_W3N,
      investValue: ZERO_W3N,
      shortBorrowed: ZERO_W3N,
      shortInvested: inputState?.input,
      flashFee: ZERO_W3N,
      debtPosition: ZERO_W3N,
      debtValue: ZERO_W3N,
    }

    setIsSimulating(false);
    return simulation;
  };

  return { simulateInvest, isSimulating, notification:[], extraBucket:[] }

};
