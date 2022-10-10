import React, { useContext, useRef} from 'react';
import HighStock from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import { ChartContext } from '../../context/ChartContext';

export const Chart = (props: HighchartsReact.Props) => {
  
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
  const [chartState] = useContext(ChartContext);
  const { prices } = chartState;

  // set Chart options
  let options = {
    credits: {enabled: false}, 
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
      dateTimeLabelFormats:
      {
        millisecond: '%H:%M:%S.%L',
        second: '%H:%M:%S',
        minute: '%H:%M',
        hour: '%H:%M',
        day: '%e %b',
        week: '%e %b',
        month: '%b \'%y',
        year: '%Y'
      },
      tickLength: 0, 
      
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
      floating: true,
      y: 10,
      allButtonsEnabled: true,
      inputEnabled: false,
      selected: 1,
      buttons: [
        {
          type: 'week',
          count: 1,
          text: '1w',
        },
        {
          type: 'month',
          count: 1,
          text: '1m',
        },
        {
          type: 'month',
          count: 3,
          text: '3m',
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
          valueDecimals: 4,
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
        <HighchartsReact
          highcharts={HighStock}
          constructorType={'stockChart'}
          options={options}
          ref={chartComponentRef}
          {...props}
        />
  );
};
