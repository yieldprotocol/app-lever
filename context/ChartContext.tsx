import React, { useContext, useEffect, useReducer, useState } from 'react';
import { ILeverContextState, LeverContext } from './LeverContext';
import CoinGecko from 'coingecko-api';
import { ApolloClient, gql, InMemoryCache } from '@apollo/client';
import { IInputContextState, InputContext } from './InputContext';

export interface IChartState {
  prices: any[];
  pricesAvailable: boolean;
}

const ChartContext = React.createContext<any>({});

const chartReducer = (state: IChartState, action: any) => {
  /* Reducer switch */
  switch (action.type) {
    case 'UPDATE_DATA':
      return {
        ...state,
        prices: action.payload,
        // total_volumes: action.payload.total_volumes,
      };
      case 'UPDATE_AVAILABILITY':
        return {
          ...state,
          pricesAvailable: action.payload,
          // total_volumes: action.payload.total_volumes,
        };
    default:
      return state;
  }
};

const ChartProvider = ({ children }: any) => {
  //1. Initiate the CoinGecko API Client
  const CoinGeckoClient = new CoinGecko();

  //2. inititate an appollo client for notional
  const client = new ApolloClient({
    uri: 'https://api.thegraph.com/subgraphs/name/notional-finance/mainnet-v2',
    cache: new InMemoryCache(),
  });

  /* LOCAL STATE */
  const [chartState, updateState] = useReducer(chartReducer, { prices: [], pricesAvailable: true });
  const [priceMap, setPriceMap] = useState<Map<string, any[]>>(new Map([]));

  const [longChartId, setLongChartId] = useState<string>();
  const [shortChartId, setShortChartId] = useState<string>();

  /* STATE from other contexts */
  const [ leverState ] = useContext(LeverContext);
  const { assetRoots } =  leverState;
  
  const [inputState] = useContext(InputContext);
  const { selectedLever } = inputState as IInputContextState;

  useEffect(()=>{
    if (selectedLever?.baseId && selectedLever?.ilkId) {
      const shortAsset = assetRoots.get(selectedLever.baseId);
      const longAsset = assetRoots.get(selectedLever.ilkId);
      setLongChartId(longAsset?.chartId);
      setShortChartId(shortAsset?.chartId);
    }
  },[selectedLever, assetRoots])

  const getPricesPerUsd = async (chartId: string) => {

    if (chartId === 'FCASH') {
      console.log('Fetching fCASH price data for: ', chartId);
      updateState({ type: 'UPDATE_AVAILABILITY', payload: false });
      const response_ = await client.query({
        query: gql`
        query getHistRate{
          assetExchangeRateHistoricalDatas(first:1000, where: {currency: "3"}, orderDirection: desc) {
            timestamp
            value
          }
        }
      `});
      const response = response_.data.assetExchangeRateHistoricalDatas.map((p:any) => [p.timestamp, p.value]);
      return response;
    }

    console.log('Fetching price data for : ', chartId);

    try {
      const prices = (await CoinGeckoClient.coins.fetchMarketChart(chartId, { vs_currency: 'usd', days: '90' })).data.prices;
      const pricesPerUsd = prices.map((p) => [p[0], 1 / p[1]]);
      setPriceMap(priceMap.set(chartId, pricesPerUsd));
      return pricesPerUsd.flat();

    } catch {
      
      console.log( 'Error fetching price data.' );
      updateState({ type: 'UPDATE_AVAILABILITY', payload: false });
      return [];
    }
  };

  /* calculate the price per asset based on usd */
  useEffect(() => {
    longChartId &&
    shortChartId &&
      (async () => {
        /* get the prices from eithe map or fetched */
        const shortPerUsd = priceMap.get(shortChartId) || (await getPricesPerUsd(shortChartId));
        const longPerUsd = priceMap.get(longChartId) || (await getPricesPerUsd(longChartId));
        shortPerUsd.length && longPerUsd.length && updateState({ type: 'UPDATE_AVAILABILITY', payload: true });

        console.log(longPerUsd[12] )

        console.log(shortPerUsd[12] )

        /* Calculate a short/long price */
        const shortPerLong = longPerUsd.map((p:any, index:number) => [
          p[0],
          shortPerUsd[index] ? p[1] / shortPerUsd[index][1] : undefined,
        ]);

        console.log( shortPerLong [12] );

        /* remove any undefined value pairs */
        const shortLongPrice = shortPerLong.filter((v:any) => v[0] !== undefined && v[1] !== undefined);
        updateState({ type: 'UPDATE_DATA', payload: shortLongPrice });
     
      })();

  }, [longChartId, shortChartId]);

  /* ACTIONS TO CHANGE CONTEXT */
  const chartActions = {
    // getPoolInfo: async (lever: ILever): Promise<IPoolState> => await getGraphInfo(lever),
  };

  return <ChartContext.Provider value={[chartState, chartActions]}>{children}</ChartContext.Provider>;
};

export { ChartContext };

export default ChartProvider;
