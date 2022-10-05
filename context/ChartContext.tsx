import React, { useContext, useEffect, useReducer } from 'react';
import { ILeverContextState, LeverContext } from './LeverContext';
import CoinGecko from 'coingecko-api';


export interface IPoolState {

}

const ChartContext = React.createContext<any>({});

const initState: any= {

};

const chartReducer = (state: IPoolState, action: any) => {
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

const ChartProvider = ({ children }: any) => {

  //2. Initiate the CoinGecko API Client
  const CoinGeckoClient = new CoinGecko();

  // https://api.coingecko.com/api/v3/coins/staked-ether/market_chart?vs_currency=eth&days=max&interval=daily
  
  /* LOCAL STATE */
  const [graphState, updateState] = useReducer(chartReducer, initState);

  /* STATE from other contexts */
  const [leverState]: [ILeverContextState] = useContext(LeverContext);
  const { selectedStrategy, longAsset, shortAsset } = leverState;

  useEffect(()=>{
    var func = async() => {
      // console.log(CoinGeckoClient.coins.fetch('bitcoin', {}));
      let data = await CoinGeckoClient.coins.fetchMarketChart('staked-ether', {vs_currency: 'eth', days: '90' });
      console.log(data ) 
    }; func();
  },[])

  /* ACTIONS TO CHANGE CONTEXT */
  const graphActions = {
    // getPoolInfo: async (strategy: ILeverStrategy): Promise<IPoolState> => await getGraphInfo(strategy),
  };

  return <ChartContext.Provider value={[ graphState, graphActions ]}>{children}</ChartContext.Provider>;
};

export { ChartContext };

export default ChartProvider;