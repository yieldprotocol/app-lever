import { ReactNode, useContext } from 'react';
import tw from 'tailwind-styled-components';
import { InputContext } from '../../context/InputContext';
import { Range } from 'react-range';
import { EllipsisVerticalIcon, PauseIcon } from '@heroicons/react/24/solid';

type DivProps = {
  $unFocused?: boolean;
};
const Container = tw.div<DivProps>`${(p) =>
  p.$unFocused
    ? 'opacity-60'
    : ''}  flex rounded-md justify-between p-1 w-full gap-5 align-middle hover:border border hover:border-primary-400 dark:hover:border-primary-600 dark:border-gray-800 dark:bg-gray-800 bg-gray-300 border-gray-300 dark:bg-opacity-25 bg-opacity-25`;

const Input = tw.input<any>`
h-full 
caret-gray-800
 dark:caret-gray-50
  text-2xl 
  appearance-none
   w-full
   dark:bg-black dark:bg-opacity-0 bg-opacity-0
   dark:focus:text-gray-50 
   focus:text-gray-800 
   dark:text-gray-300 
   text-gray-800 
   py-1 
   px-4 
   leading-tight 
   focus:outline-none
   rounded-lg
`;

const ThumbStyled = tw.div<any>`
  bg-primary-600
  bg-primary-600 
  p-2
 rounded-full
 border 
 hover:border
  hover:border-primary-400  border-transparent
`;

const TrackStyled = tw.div<any>`
 ${ (props) => getBackgroundColor(props.leverage, props.max)  }
 h-[10px]
 rounded-full 
`;

const getBackgroundColor = (val: number, max: number) => {
  const percent = (val / max) * 100;
  if (max) {
    if (percent < 33) return 'bg-slate-800';
    if (percent < 50) return 'bg-emerald-600';
    if (percent < 75) return 'bg-orange-600';
    return 'bg-red-600';
  }
  return 'bg-slate-800'
};

const Track = ({props, children }: {
  props: any;
  children: ReactNode;
}) => <TrackStyled leverage={props.leverage} max={props.max} >{children}</TrackStyled>;

const LeverageSelect = ({ max }: { max: number }) => {
  const [inputState, inputActions] = useContext(InputContext);
  return (
    <Container className=" align-middle">
      <div className="w-1/4 flex flex-grow min-w-[120px] ">
        <div className=" px-2 py-4"> X </div>
        <Input
          className=" before:content: "
          value={`${inputState?.leverage?.dsp!}`}
          type="number"
          onChange={(e: any) => inputActions.setLeverage(e.target.value)}
          name="leverage_text"
          min={1.1}
          max={max || 5}
        />
      </div>

      <div className="w-full p-4">
        <div className="p-2">
          <Range
            step={0.1}
            min={1.1}
            max={max || 5}
            values={[inputState.leverage?.dsp || '']}
            onChange={(value) => inputActions.setLeverage(value)}
            renderTrack={({ props, children }) => (
                <TrackStyled {...props} leverage={inputState.leverage?.dsp} max={max} >{children}</TrackStyled>  
            )}
            renderMark={({ props }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: '2px',
                  width: '2px',
                  backgroundColor: 'bg-grey-600',
                }}
              />
            )}
            renderThumb={({ props }) => (
                <ThumbStyled {...props}>
                  <EllipsisVerticalIcon className="h-6 w-6 text-gray-200" />
                </ThumbStyled>
            )}
          />
        </div>
      </div>
    </Container>
  );
};

export default LeverageSelect;
