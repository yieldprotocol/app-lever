import { useContext } from 'react';
import { PositionContext } from '../../context/PositionContext';
import { BorderWrap, ClearButton, Inner, TopRow } from '../styled';

const Positions = () => {

  const [ positionState, positionActions ] = useContext(PositionContext);
  const { positions,  } = positionState;
  const { selectPosition } = positionActions;

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
