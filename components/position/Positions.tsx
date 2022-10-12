import { useContext, useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import { LeverContext } from '../../context/LeverContext';
import { PositionContext } from '../../context/PositionContext';
import { BorderWrap, ClearButton, Inner, TopRow } from '../styled';

const Positions = () => {
  const [, leverActions] = useContext(LeverContext);
  const { selectPosition } = leverActions;

  const [positionState] = useContext(PositionContext);
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
        {Array.from(positions.values()).map((v: any) => (
          <div onClick={() => selectPosition(v)} key={v.id}>
            {v.id}
          </div>
        ))}
      </Inner>
    </BorderWrap>
  );
};

export default Positions;
