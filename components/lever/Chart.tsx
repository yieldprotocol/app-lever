import React, { useContext, useEffect, useRef, useState } from 'react';
import HighStock from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import { ChartContext } from '../../context/ChartContext';
import { BorderWrap } from '../styles';
import tw from 'tailwind-styled-components';

const Inner = tw.div`m-4 text-center`;
const TopRow = tw.div` p-8 flex justify-between align-middle text-center items-center rounded-t-lg dark:bg-gray-900 
bg-gray-100
bg-opacity-25
dark:text-gray-50 
dark:bg-opacity-25 `;

export const Chart = (props: HighchartsReact.Props) => {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
  const [chartState] = useContext(ChartContext);
  const { prices } = chartState;

  // set Chart options
  let options = {
    // rangeSelector: {
    //   selected: 1,
    // },
    chart: {
      height: 200,
      style: {
        fontFamily: { sans: ['Inter', 'sans-serif'], serif: ['Inter', 'sans-serif'] },
      },
      backgroundColor: 'rgba(0,0,0,0)',
    },
    // title: {
    //   text: 'STETH -ETH',
    // },


    //   yAxis: [
    //     {
    //       labels: {
    //         align: 'right',
    //         x: -3,
    //       },
    //       title: {
    //         text: 'OHLC',
    //       },
    //       height: '60%',
    //       lineWidth: 2,
    //       resize: {
    //         enabled: true,
    //       },
    //     },
    //     {
    //       labels: {
    //         align: 'right',
    //         x: -3,
    //       },
    //       title: {
    //         text: 'Volume',
    //       },
    //       top: '65%',
    //       height: '35%',
    //       offset: 0,
    //       lineWidth: 2,
    //     },
    //   ],

    xAxis: {
      gridLineWidth: 0,
    },
    yAxis: {
      gridLineWidth: 0,
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
      floating: true,
      y: 10,
      allButtonsEnabled: true,
      buttons: [
        {
          type: 'month',
          count: 1,
          text: '1m',
          // events: {
          //     click: function() {
          //         alert('Clicked button');
          //     }
          // }
        },
        {
          type: 'month',
          count: 3,
          text: '3m',
        },
        {
          type: 'month',
          count: 6,
          text: '6m',
        },
      ],
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
          valueDecimals: 2,
        },
        dataGrouping: { forced: true, units: [ ['day', [1]] ] },
      },
    ],

    // chart.series[0].update({ dataGrouping: { forced: true, units: [ ['week', [1]] ] } })

    // responsive: {
    //   rules: [
    //     {
    //       condition: {
    //         maxWidth: 500,
    //       },
    //       chartOptions: {
    //         chart: {
    //           height: 300,
    //         },
    //         subtitle: {
    //           text: null,
    //         },
    //         navigator: {
    //           enabled: false,
    //         },
    //       },
    //     },
    //   ],
    // },
  };

  return (
    <BorderWrap>
      {/* <TopRow>
        <div className="text-lg"> StETH ETH </div>
      </TopRow> */}
      StETH PRICE:  0.99 ETH
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
