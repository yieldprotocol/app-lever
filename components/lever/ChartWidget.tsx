import React, { useContext, useEffect, useRef, useState } from 'react';
import HighStock, { seriesType } from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import { ChartContext } from '../../context/ChartContext';
import { BorderWrap, ClearButton, Inner, TopRow } from '../styled';
import { LeverContext } from '../../context/LeverContext';
import tw from 'tailwind-styled-components';

const Button = tw.button`text-xs bg-primary-800 w-5 dark:text-gray-50 text-gray-50 rounded hover:opacity-80`;

export const ChartWidget = (props: HighchartsReact.Props) => {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
  const [leverState] = useContext(LeverContext);
  const { selectedStrategy, shortAsset, longAsset } = leverState;
  const [chartState] = useContext(ChartContext);
  const { prices } = chartState;

  // set Chart options
  let options = {
    credits: { enabled: false },
    chart: {
      height: 150,
      style: {
        fontFamily: { sans: ['Inter', 'sans-serif'], serif: ['Inter', 'sans-serif'] },
      },
      backgroundColor: 'rgba(0,0,0,0)',
    },

    xAxis: {
      gridLineWidth: 0,
      dateTimeLabelFormats: {
        day: '%e %b',
        week: '%e %b',
        month: "%b '%y",
        year: '%Y',
      },
      tickLength: 0,
      lineWidth: 0,
    },
    yAxis: {
      visible: false,
    },

    tooltip: {
      split: true,
    },

    color: {
      radialGradient: { cx: 0.5, cy: 0.5, r: 0.5 },
      stops: [
        [0, '#003399'],
        [1, '#3366AA'],
      ],
    },

    navigator: { enabled: false },
    scrollbar: {
      enabled: false,
    },

    rangeSelector: {
      enabled: false,
      // allButtonsEnabled: true,
      // inputEnabled: false,
      // selected: 1,
      // buttons: [
      //   {
      //     type: 'day',
      //     count: 1,
      //     text: '1d',
      //   },
      //   {
      //     type: 'week',
      //     count: 1,
      //     text: '1w',
      //   },
      //   {
      //     type: 'month',
      //     count: 1,
      //     text: '1m',
      //   },
      //   {
      //     type: 'month',
      //     count: 3,
      //     text: '3m',
      //   },
      // ],
    },

    // linear-gradient(to right, rgb(56, 189, 248), rgb(251, 113, 133), rgb(163, 230, 53))
    plotOptions: {
      area: {
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, 'rgb(251, 113, 133)'],
            [1, 'teal'],
          ],
        },
        lineWidth: 1,
        marker: {
          enabled: false,
        },
        shadow: false,
        states: {
          hover: {
            lineWidth: 3,
          },
        },
        threshold: null,
      },
    },

    series: [
      {
        name: 'STETH / ETH PRICE',
        // data: (function () {
        //   var ohlcData: any = [];
        //   for (var i = 0; i < mockData.length; i++) {
        //     ohlcData.push([
        //       mockData[i][0], // the date
        //       mockData[i][1], // price
        //     ]);
        //   }
        //   return ohlcData;
        // })(),
        data: prices,
        type: 'area',
        threshold: null,
        tooltip: {
          valueDecimals: 4,
        },
        dataGrouping: { forced: true, units: [['day', [1]]] },
      },
    ],
  };

  const handleRangeChange = (seconds: number) => {
    const currentDate = new Date().getTime();
    /* if the seconds are less than a day - show hours in plot, else average out days */
    if (seconds <= 86400) {
      chartComponentRef?.current?.chart.xAxis[0].setDataGrouping({ units: [['hour', [1]]] });
    } else if (seconds <= 604800) {
      chartComponentRef?.current?.chart.xAxis[0].setDataGrouping({ units: [['hour', [3]]] });
    } else {
      chartComponentRef?.current?.chart.xAxis[0].setDataGrouping({ units: [['day', [1]]] });
    }

    chartComponentRef?.current?.chart.xAxis[0].setExtremes(currentDate - seconds * 1000, currentDate);
  };

  return (
    <BorderWrap>
      <TopRow>
        <div className="flex-grow">
          <div className="text-start">
            Current price:
            <div>
              1 {shortAsset?.symbol} = {prices.length ? prices[prices.length - 1][1] : '...'} {longAsset?.symbol}
            </div>
          </div>

          <div className="flex flex-row justify-between">
            <div> x% vs yesterday </div>
            <div className="flex flex-row gap-2">
              <Button onClick={() => handleRangeChange(86400)}> 1d </Button>
              <Button onClick={() => handleRangeChange(604800)}> 1w </Button>
              <Button onClick={() => handleRangeChange(2628288)}> 1m </Button>
              <Button onClick={() => handleRangeChange(7890000)}> 3m </Button>
            </div>
          </div>
        </div>
      </TopRow>

      <Inner>
        <HighchartsReact
          highcharts={HighStock}
          constructorType={'stockChart'}
          options={options}
          ref={chartComponentRef}
          {...props}
        />
      </Inner>
    </BorderWrap>
  );
};
