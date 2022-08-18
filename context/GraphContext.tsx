import React, { useContext, useReducer } from 'react';
import { ILeverContextState, LeverContext } from './LeverContext';
import CoinGecko from 'coingecko-api';


export interface IPoolState {

}

const GraphContext = React.createContext<any>({});

const initState: any= {

};

const graphReducer = (state: IPoolState, action: any) => {
  /* Reducer switch */
  switch (action.type) {
    case 'UPDATE_MARKET':
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

const GraphProvider = ({ children }: any) => {

  //2. Initiate the CoinGecko API Client
  const CoinGeckoClient = new CoinGecko();
  
  /* LOCAL STATE */
  const [graphState, updateState] = useReducer(graphReducer, initState);

  /* STATE from other contexts */
  const [leverState]: [ILeverContextState] = useContext(LeverContext);
  const { selectedStrategy, longAsset, shortAsset } = leverState;

  /* ACTIONS TO CHANGE CONTEXT */
  const graphActions = {
    // getPoolInfo: async (strategy: ILeverStrategy): Promise<IPoolState> => await getGraphInfo(strategy),
  };

  return <GraphContext.Provider value={[ graphState, graphActions ]}>{children}</GraphContext.Provider>;
};

export { GraphContext };

export default GraphProvider;