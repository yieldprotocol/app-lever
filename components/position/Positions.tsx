import { useContext, useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import { LeverContext } from '../../context/LeverContext';
import { PositionContext } from '../../context/PositionContext';
import { BorderWrap } from '../styles';

const Inner = tw.div`m-4 text-center`;
const TopRow = tw.div` p-8 flex justify-between align-middle text-center items-center rounded-t-lg dark:bg-gray-900 
bg-gray-100
bg-opacity-25
dark:text-gray-50 
dark:bg-opacity-25 `;
const ClearButton = tw.button`text-sm`;

const Section = tw.div`
w-full
my-2
p-2
rounded-lg 
dark:bg-gray-900 
bg-gray-100
bg-opacity-25
dark:text-gray-50 
dark:bg-opacity-25
`;

const Positions = () => {

  const [  , leverActions ] = useContext(LeverContext);
  const { selectPosition } = leverActions;

  const [ positionState ] = useContext(PositionContext);
  const { positions } = positionState;
  
  return (
    <BorderWrap>
      <TopRow>
        <div className="text-lg"> Positions </div>
        <ClearButton onClick={() => console.log('actually, this might not do anything? settings?')}>
          [filter]
        </ClearButton>
      </TopRow>

      <Inner>
        {(Array.from(positions.values())).map((v: any) => {
          return (
            <div onClick={() => selectPosition(v)} key={v.id}>
              {v.id}
            </div>
          );
        })}
      </Inner>
    </BorderWrap>
  );
};

export default Positions;
