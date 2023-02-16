import React, { useContext, useEffect, useReducer, useState } from 'react';
import { IAsset, ILeverContextState, LeverContext } from './LeverContext';
import CoinGecko from 'coingecko-api';
import { ApolloClient, gql, InMemoryCache } from '@apollo/client';
import { IInputContextState, InputContext } from './InputContext';
import { TradePlatforms } from '../lib/types';
import { ethers } from 'ethers';
import { getNotionalAssetCode } from '../leverSimulators/notionalSim';

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

  // const [longChartId, setLongChartId] = useState<string>();
  // const [shortChartId, setShortChartId] = useState<string>();
  const [longAsset, setLongAsset] = useState<IAsset>();
  const [shortAsset, setShortAsset] = useState<IAsset>();

  /* STATE from other contexts */
  const [leverState] = useContext(LeverContext);
  const { assetRoots } = leverState;

  const [inputState] = useContext(InputContext);
  const { selectedLever } = inputState as IInputContextState;

  useEffect(() => {
    if (selectedLever?.baseId && selectedLever?.ilkId) {
      const shortAsset = assetRoots.get(selectedLever.baseId);
      const longAsset = assetRoots.get(selectedLever.ilkId);
      setLongAsset(longAsset);
      setShortAsset(shortAsset);
    }
  }, [selectedLever, assetRoots]);

  const getAssetPairPrice = async (shortAsset: IAsset, longAsset: IAsset): Promise<Number[][]> => {
    /* Notional case */
    if (longAsset.chartId === TradePlatforms.NOTIONAL) {
      const notionalAsset = getNotionalAssetCode(shortAsset.symbol).toString();
      const response_ = await client.query({
        query: gql`
          query getHistRate($id: String = "${notionalAsset.toString()}") {
            assetExchangeRateHistoricalDatas(first: 724, orderBy: timestamp, where: { currency: $id }, orderDirection: desc) {
              timestamp
              value
            }
          }
        `,
      });
      const response = response_.data.assetExchangeRateHistoricalDatas;
      const rates = response.map((p: any) => {
        return [p.timestamp * 1000, 1 + parseFloat(ethers.utils.formatUnits(p.value, shortAsset.decimals + 12))];
      });

      if (rates.length) {
        updateState({ type: 'UPDATE_AVAILABILITY', payload: true });
        updateState({ type: 'UPDATE_DATA', payload: rates });
      }
      console.log(rates);
      return rates;
    }

    /**
     *
     * Coingecko case
     *
     * */

    const shortResponse = await CoinGeckoClient.coins.fetchMarketChart(shortAsset?.chartId!, {
      vs_currency: 'usd',
      days: '30',
    });
    const longResponse = await CoinGeckoClient.coins.fetchMarketChart(longAsset?.chartId!, {
      vs_currency: 'usd',
      days: '30',
    });

    const shortPerUsd = priceMap.get(shortAsset?.chartId!) || shortResponse.data.prices.map((p) => [p[0], 1 / p[1]]);
    const longPerUsd = priceMap.get(longAsset?.chartId!) || longResponse.data.prices.map((p) => [p[0], 1 / p[1]]);

    /* Some rudimentary caching while component is mounted */
    setPriceMap(priceMap.set(shortAsset?.chartId!, shortPerUsd));
    setPriceMap(priceMap.set(longAsset?.chartId!, longPerUsd));

    /* Calculate a short/long price */
    const shortPerLong = longPerUsd.map((p: any, index: number) => [
      p[0],
      shortPerUsd[index] ? p[1] / shortPerUsd[index][1] : undefined,
    ]);

    const rates = shortPerLong.filter((v: any) => v[0] !== undefined && v[1] !== undefined);
    if (rates.length) {
      updateState({ type: 'UPDATE_AVAILABILITY', payload: true });
      updateState({ type: 'UPDATE_DATA', payload: rates });
    }
    console.log(rates);
    return rates;
  };

  /* calculate the price per asset based on usd */
  useEffect(() => {
    longAsset && shortAsset && getAssetPairPrice(shortAsset, longAsset);
  }, [longAsset, shortAsset]);

  /* ACTIONS TO CHANGE CONTEXT */
  const chartActions = {
    // getPoolInfo: async (lever: ILever): Promise<IPoolState> => await getGraphInfo(lever),
  };

  return <ChartContext.Provider value={[chartState, chartActions]}>{children}</ChartContext.Provider>;
};

export { ChartContext };

export default ChartProvider;
