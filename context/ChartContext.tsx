import React, { useContext, useEffect, useReducer } from 'react';
import { ILeverContextState, LeverContext } from './LeverContext';
import CoinGecko from 'coingecko-api';


export interface IChartState {
  prices: any[];
  total_volumes: any[];

}

const ChartContext = React.createContext<any>({});

const initState: any= {
  prices: [],
  total_volumes: [],
};

const chartReducer = (state: IChartState, action: any) => {
  /* Reducer switch */
  switch (action.type) {
    case 'UPDATE_DATA':
      return {
        ...state,
        prices: action.payload.prices,
        total_volumes: action.payload.total_volumes,
      };
    default:
      return state;
  }
};

const ChartProvider = ({ children }: any) => {

  //1. Initiate the CoinGecko API Client
  const CoinGeckoClient = new CoinGecko();

  // https://api.coingecko.com/api/v3/coins/staked-ether/market_chart?vs_currency=eth&days=max&interval=daily
  
  /* LOCAL STATE */
  const [chartState, updateState] = useReducer(chartReducer, initState);

  /* STATE from other contexts */
  // const [leverState]: [ILeverContextState] = useContext(LeverContext);
  // const { selectedStrategy, longAsset, shortAsset } = leverState;

  useEffect(()=>{
    var func = async() => {
      // console.log(CoinGeckoClient.coins.fetch('bitcoin', {}));
      let data = await CoinGeckoClient.coins.fetchMarketChart('staked-ether', {vs_currency: 'eth', days: '90' });
      console.log(data.data)
      updateState( {type: 'UPDATE_DATA', payload: data.data })
    }; func();
  },[])

  /* ACTIONS TO CHANGE CONTEXT */
  const chartActions = {
    // getPoolInfo: async (strategy: ILeverStrategy): Promise<IPoolState> => await getGraphInfo(strategy),
  };

  return <ChartContext.Provider value={[ chartState, chartActions ]}>{children}</ChartContext.Provider>;
};

export { ChartContext };

export default ChartProvider;