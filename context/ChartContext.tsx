import React, { useContext, useEffect, useReducer, useState } from 'react';
import { ILeverContextState, LeverContext } from './LeverContext';
import CoinGecko from 'coingecko-api';

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

  /* LOCAL STATE */
  const [chartState, updateState] = useReducer(chartReducer, { prices: [], pricesAvailable: true });
  const [priceMap, setPriceMap] = useState<Map<string, any[]>>(new Map([]));

  /* STATE from other contexts */
  const [leverState] = useContext(LeverContext);
  const { selectedLongAsset, selectedShortAsset } = leverState as ILeverContextState;

  const getPricesPerUsd = async (chartId: string) => {
    console.log('Fetching price data for : ', chartId);
    try {
      const prices = (await CoinGeckoClient.coins.fetchMarketChart(chartId, { vs_currency: 'usd', days: '90' })).data.prices;
      const pricesPerUsd = prices.map((p) => [p[0], 1 / p[1]]);
      setPriceMap(priceMap.set(chartId, pricesPerUsd));
      return pricesPerUsd;
    } catch {
      console.log( 'Error fetching price data.' );
      updateState({ type: 'UPDATE_AVAILABILITY', payload: false });
      return [];
    }
  };

  /* calculate the price per asset based on usd */
  useEffect(() => {
    selectedShortAsset &&
    selectedLongAsset &&
      (async () => {
        /* get the prices from eithe map or fetched */
        const shortPerUsd = priceMap.get(selectedShortAsset.chartId!) || (await getPricesPerUsd(selectedShortAsset.chartId!));
        const longPerUsd = priceMap.get(selectedLongAsset.chartId!) || (await getPricesPerUsd(selectedLongAsset.chartId!));

        shortPerUsd.length && longPerUsd.length && updateState({ type: 'UPDATE_AVAILABILITY', payload: true });
        /* Calculate a short/long price */
        const shortLongPrice_ = longPerUsd.map((p, index) => [
          p[0],
          shortPerUsd[index] ? p[1] / shortPerUsd[index][1] : undefined,
        ]);
        /* remove any undefined value pairs */
        const shortLongPrice = shortLongPrice_.filter((v) => v[0] !== undefined && v[1] !== undefined);
        updateState({ type: 'UPDATE_DATA', payload: shortLongPrice });
      })();
  }, [selectedLongAsset, selectedShortAsset]);

  /* ACTIONS TO CHANGE CONTEXT */
  const chartActions = {
    // getPoolInfo: async (lever: ILever): Promise<IPoolState> => await getGraphInfo(lever),
  };

  return <ChartContext.Provider value={[chartState, chartActions]}>{children}</ChartContext.Provider>;
};

export { ChartContext };

export default ChartProvider;
