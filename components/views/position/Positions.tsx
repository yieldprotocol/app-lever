import { ChevronDoubleRightIcon } from '@heroicons/react/24/solid';
import { useContext } from 'react';
import tw from 'tailwind-styled-components';
import { InputContext } from '../../../context/InputContext';
import { ILever, ILeverContextState, LeverContext } from '../../../context/LeverContext';
import { IPosition, PositionContext, PositionStatus } from '../../../context/PositionContext';
import StackedLogos from '../../common/StackedLogos';
import { BorderWrap, Inner, TopRow } from '../../styled';

export const Container = tw.button`
rounded-md
w-full 
hover:border
border 
hover:border-primary-400 
dark:hover:border-primary-600 
dark:border-gray-800 
dark:bg-gray-800 bg-gray-300 border-gray-300 dark:bg-opacity-25 bg-opacity-25`;

const Positions = () => {
  const [positionState, positionActions] = useContext(PositionContext);
  const { positions, selectedPosition } = positionState;
  const { selectPosition } = positionActions;

  const [inputActions] = useContext(InputContext);
  const [leverState, leverActions] = useContext(LeverContext);
  const { levers, assets } = leverState as ILeverContextState;

  const handleSelectPosition = (position: IPosition) => {
    selectPosition( position );
    const associatedLever = levers.get(position.leverId);
    inputActions.selectLever(associatedLever);
  }

  const PositionItem = (props: { position: IPosition }) => {
    const { position } = props;
    const isActive = position.status === PositionStatus.ACTIVE;
    const isSelected = selectedPosition?.vaultId === position.vaultId;
    
    const shortAsset = assets.get(position?.baseId);
    const longAsset = assets.get(position?.ilkId);
    // const lever = Array.from(levers.values()).find(
    //   (l: ILever) => l.leverAddress === position.leverAddress && l.seriesId === position.seriesId
    // );

    return (
      <Container>
        <div
          className={`
          relative
          rounded-lg
          p-4 
          text-start 
          flex  
          items-center 
          justify-between 
          ${isActive || isSelected ? 'opacity-100' : 'opacity-50'} 
          ${isSelected ? 'bg-primary-600 bg-opacity-50 opacity-100' : ''}   
        `}
        >
          <div className="flex gap-4">
            <div className="flex   ">
              <StackedLogos size={6} logos={[longAsset?.image!, shortAsset?.image!]} />
            </div>
            <div>{position.displayName}</div>
          </div>
          {!isSelected ? (
            <div className={`text-xs rounded-full p-2 ${isActive ? 'bg-emerald-500 ' : 'bg-red-500'}`}>
              {position.status}
            </div>
          ) : (
            <div className=" w-6 ">
              <ChevronDoubleRightIcon />
            </div>
          )}
        </div>
      </Container>
    );
  };

  return (
    <BorderWrap>
      <TopRow>
        <div className="text-lg">My Levered Positions </div>
        {/* <ClearButton onClick={() => console.log('actually, this might not do anything? settings?')}>
          [filter]
        </ClearButton> */}
      </TopRow>
      <Inner className="pb-4 space-y-2">
        {Array.from(positions.values()).map((p: any) => (
          <div onClick={() => handleSelectPosition(p)} key={p.vaultId}>
            <PositionItem position={p} />
          </div>
        ))}
      </Inner>
    </BorderWrap>
  );
};

export default Positions;
