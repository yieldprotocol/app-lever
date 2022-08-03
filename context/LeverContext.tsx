import { TIMEOUT } from 'dns';
import React, { useEffect, useReducer } from 'react';
import { getFyToken } from '../config/contractRegister';
import { STRATEGIES } from '../config/strategies'
import useConnector from '../hooks/useConnector';
import { InvestTokenType } from '../objects/Strategy';


interface ILeverContextState {
  contracts: any;
  assets: any;
  strategies: any;
  selectedStrategy: any;
  account: any;
}

const LeverContext = React.createContext<any>({});

const initState: ILeverContextState = {
  contracts: [],
  assets: [],
  strategies: new Map(),
  selectedStrategy: undefined,
  account: 'asd',
};

const leverReducer = (state: ILeverContextState, action: any) => {
  /* Reducer switch */
  switch (action.type) {
    case 'UPDATE_STRATEGY':
      return {
        ...state,
        strategies: new Map(state.strategies.set(action.payload.id, action.payload)),
      };
      case 'SELECT_STRATEGY':
        return {
          ...state,
          selectedStrategy: action.payload,
        };
    default:
      return state;
  }
};

const LeverProvider = ({ children }: any) => {

  /* LOCAL STATE */
  const [leverState, updateState] = useReducer(leverReducer, initState);
 const { chainId, account, provider, ensName } = useConnector(); 


  /* connect up contracts here - updates on accoutn change */
  useEffect(() => {

    provider && 
    // connect up relevant contracts
    Array.from(STRATEGIES.values()).map(async (x) => {
      const signer = account ? provider.getSigner('account') : provider;
      
      const investTokenContract = () => {
        switch (x.InvestTokenType) {
          case InvestTokenType.FyToken:
          return getFyToken(x.series, contracts, signer)
        }
      }

      const connected = {
        ...x,
        somethign: 'else',
        investToken: investTokenContract(),
      }

      updateState({type:'UPDATE_STRATEGY', payload: connected })

    })
    // updateState( {});
  }, [ account, provider]); // account & provider


  useEffect(() => { 
    console.log(leverState);
  },[leverState])

  /* CHANGE CONTEXT ACTIONS */
  const leverActions = {
    selectStrategy: (strategy: string) => console.log('selecting new strategy here:', strategy),
  };

  return <LeverContext.Provider value={[leverState, leverActions]}>{children}</LeverContext.Provider>;
};

export { LeverContext };
export default LeverProvider;
