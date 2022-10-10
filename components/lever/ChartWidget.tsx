import React, { useContext, useEffect, useRef, useState } from 'react';
import HighStock from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import ChartProvider, { ChartContext } from '../../context/ChartContext';
import { BorderWrap } from '../styles';
import tw from 'tailwind-styled-components';
import { Chart } from './Chart';
import { LeverContext } from '../../context/LeverContext';

const Inner = tw.div`m-4 text-center`;
const TopRow = tw.div`p-4 flex justify-between align-middle text-center items-center rounded-t-lg dark:bg-gray-900 
bg-gray-100
bg-opacity-25
dark:text-gray-50 
dark:bg-opacity-25 
`;

export const ChartWidget = (props: HighchartsReact.Props) => {
  const [leverState] = useContext(LeverContext);
  const { selectedStrategy, shortAsset, longAsset } = leverState;

  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
  const [chartState] = useContext(ChartContext);
  const { prices } = chartState;

  return (
    <BorderWrap>
      <TopRow>
        <div className = 'flex-grow' >

          <div className="text-start">
            Current price:
            <div>
              1 {shortAsset?.symbol} = {prices.length ? prices[prices.length - 1][1] : '...'} {longAsset?.symbol}
            </div>
          </div>

          <div className="flex flex-row justify-between">
            <div> x%  vs yesterday </div>
            <div>1w 3m 6m</div>
          </div>
        </div>
      </TopRow>

      <Inner>
        <Chart />
      </Inner>
    </BorderWrap>
  );
};
