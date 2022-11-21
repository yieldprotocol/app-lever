import React, { useContext, useEffect, useRef, useState } from 'react';
import HighStock from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import { ChartContext } from '../../context/ChartContext';
import { BorderWrap, Spinner, TopRow } from '../styled';
import { LeverContext } from '../../context/LeverContext';
import tw from 'tailwind-styled-components';
import { InputContext } from '../../context/InputContext';

export const TopRow_ = tw.div`p-0 align-middle text-center items-center rounded-t-lg dark:bg-gray-900 
bg-gray-100
bg-opacity-25
dark:text-gray-50 
dark:bg-opacity-25 
`;

const Button = tw.button`text-xs bg-primary-800 w-5 dark:text-gray-50 text-gray-50 rounded hover:opacity-80`;

export const ChartWidget = (props: HighchartsReact.Props) => {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
  const [leverState] = useContext(LeverContext);
  const { selectedLever, selectedLongAsset, selectedShortAsset } = leverState;
  const [chartState] = useContext(ChartContext);
  const { prices, pricesAvailable } = chartState;

  const [inputState] = useContext(InputContext);
  const { input } = inputState;

  const [condensedView, setCondensedView] = useState<boolean>(false);
  const [forceChart, setForceChart] = useState<boolean>(false);

  useEffect(() => {
    setCondensedView(!forceChart && selectedLever && input?.dsp > 0);
  }, [input, selectedLever, forceChart]);

  // set Chart options
  let options = {
    credits: { enabled: false },
    chart: {
      height: condensedView ? 100 : 250,
      width: condensedView ? 200 : undefined,
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
            [0, 'teal'],
            [1, '#ffffff00'],
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
        name: `${selectedLongAsset?.displaySymbol} / ${selectedShortAsset?.displaySymbol}`,
        data: prices,
        type: 'area',
        threshold: null,
        tooltip: {
          valueDecimals: 4,
        },
        dataGrouping: { forced: true, units: [['day', [1]]] },
      },
      {
        name: `Trend`,
        regression: true,
        data: prices,
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
      chartComponentRef?.current?.chart.xAxis[0].setDataGrouping({ units: [['day', [1]]] });
    } else if (seconds <= 604800) {
      chartComponentRef?.current?.chart.xAxis[0].setDataGrouping({ units: [['day', [3]]] });
    } else {
      chartComponentRef?.current?.chart.xAxis[0].setDataGrouping({ units: [['day', [1]]] });
    }
    chartComponentRef?.current?.chart.xAxis[0].setExtremes(currentDate - seconds * 1000, currentDate);
  };

  return (
    <BorderWrap className="mb-4">
      {pricesAvailable && (
        <div className={`grid overflow-hidden ${condensedView ? 'grid-rows-1 gap-0' : 'grid-cols-2 gap-2'} `}>
          <div className={`col-span-2`}>
            <TopRow>
              <div className="flex-grow">
                <div className="text-start py-4">
                  <div className="flex flex-row gap-2">
                    <div className="w-6">{selectedShortAsset?.image}</div>
                    <div className="flex flex-row pl-2"> 1 {selectedShortAsset?.displaySymbol} </div>
                  </div>
                  <div className="flex flex-row gap-2 ">
                    <div className="w-8 h-8">{selectedLongAsset?.image}</div>
                    <div className="text-2xl">
                      {prices.length ? Math.round(parseFloat(prices[prices.length - 1][1]) * 1000) / 1000 : '...'}
                    </div>
                    <div className="text-2xl">{selectedLongAsset?.displaySymbol}</div>
                  </div>
                </div>

                {!condensedView && (
                  <div className="flex flex-row justify-between">
                    <div className="text-xs text-slate-500"> x% vs yesterday </div>
                    <div className="flex flex-row gap-2">
                      {/* <Button onClick={() => handleRangeChange(86400)}> 1d </Button> */}
                      <Button onClick={() => handleRangeChange(604800)}> 1w </Button>
                      <Button onClick={() => handleRangeChange(2628288)}> 1m </Button>
                      <Button onClick={() => handleRangeChange(7890000)}> 3m </Button>
                    </div>
                  </div>
                )}
              </div>
            </TopRow>
          </div>

          {/* <div className={`col-span-2 ${condensedView ? 'col-start-3' : 'col-start-1'} `}> */}
          <div
            className={` col-span-2 ${
              condensedView
                ? 'dark:bg-gray-900 bg-gray-100 bg-opacity-25 dark:text-gray-50  dark:bg-opacity-25 col-start-3 pt-4'
                : 'col-start-1'
            } `}
          >
            {prices.length ? (
              <HighchartsReact
                highcharts={HighStock}
                constructorType={'stockChart'}
                options={options}
                ref={chartComponentRef}
                {...props}
              />
            ) : (
              <div className="p-4">
                <Spinner />
              </div>
            )}

            {/* <ArrowsPointingOutIcon className='text-size-sm' />  */}
            {/* <button onClick={()=>setForceChart(!forceChart)}> toggle chart</button> */}
          </div>
          {/* </div> */}
        </div>
      )}
      {!pricesAvailable && <div className="text-xs text-slate-500 p-8"> Price chart not currently available. </div>}
    </BorderWrap>
  );
};
