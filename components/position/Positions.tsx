import { ChevronDoubleRightIcon } from '@heroicons/react/24/solid';
import { useContext } from 'react';
import tw from 'tailwind-styled-components';
import { ILever, ILeverContextState, LeverContext } from '../../context/LeverContext';
import { IPosition, PositionContext, PositionStatus } from '../../context/PositionContext';
import StackedLogos from '../common/StackedLogos';
import { BorderWrap, Inner, TopRow } from '../styled';

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

  const [leverState] = useContext(LeverContext);
  const { levers, assets } = leverState as ILeverContextState;

  // const getLever = (address: string, seriesId: string): ILever | undefined => {
  //   const leverList = Array.from(levers.values());
  //   return leverList.find((l: ILever) => l.leverAddress === address && l.seriesId === seriesId);
  // };

  const PositionItem = (props: { position: IPosition }) => {
    const { position } = props;
    const isActive = position.status === PositionStatus.ACTIVE;
    const isSelected = selectedPosition?.vaultId === position.vaultId;
    
    const shortAsset = assets.get(position?.baseId);
    const longAsset = assets.get(position?.ilkId);
    const lever = Array.from(levers.values()).find(
      (l: ILever) => l.leverAddress === position.leverAddress && l.seriesId === position.seriesId
    );

    return (
      <Container>
        <div
          className={`
          relative
          rounded-lg
          p-4 
          text-start 
          flex   
          justify-between 
          ${isActive || isSelected ? 'opacity-100' : 'opacity-50'} 
          ${isSelected ? 'bg-primary-600 bg-opacity-50 opacity-100' : ''}   
        `}
        >
          <div className="flex   gap-4">
            <div className="flex   ">
              <StackedLogos size={6} logos={[longAsset?.image!, shortAsset?.image!]} />
            </div>
            <div>{position.displayName}</div>
          </div>
          {!isSelected ? (
            <div className={`text-xs rounded px-2 ${isActive ? 'bg-emerald-500 ' : 'bg-red-500'}`}>
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
          <div onClick={() => selectPosition(p)} key={p.vaultId}>
            <PositionItem position={p} />
          </div>
        ))}
      </Inner>
    </BorderWrap>
  );
};

export default Positions;
