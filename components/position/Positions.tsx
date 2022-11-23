import { ChevronDoubleRightIcon } from '@heroicons/react/24/solid';
import { useContext } from 'react';
import tw from 'tailwind-styled-components';
import { TradePlatforms } from '../../config/levers';
import { ILever, ILeverContextState, LeverContext } from '../../context/LeverContext';
import { IPosition, PositionContext, PositionStatus } from '../../context/PositionContext';
import { BorderWrap, ClearButton, Inner, TopRow } from '../styled';

export const Container = tw.div`
rounded-md
w-full 
hover:border
border 
hover:border-green-400 
dark:hover:border-green-600 
dark:border-gray-800 
dark:bg-gray-800 bg-gray-300 border-gray-300 dark:bg-opacity-25 bg-opacity-25`;

const Positions = () => {
  const [positionState, positionActions] = useContext(PositionContext);
  const { positions, selectedPosition } = positionState;
  const { selectPosition } = positionActions;

  const [leverState] = useContext(LeverContext);
  const { levers } = leverState as ILeverContextState;

  const getLever = (address: string, seriesId: string): ILever | undefined => {
    const leverList = Array.from(levers.values());
    return leverList.find((l: ILever) => l.leverAddress === address && l.seriesId === seriesId);
  };

  const PositionItem = (props: { position: IPosition }) => {
    const { position } = props;
    const isActive = position.status === PositionStatus.ACTIVE;
    const isSelected = selectedPosition?.vaultId === position.vaultId;
    return (
      <Container>
        <div
          className={`
          relative
          rounded-lg
          p-4 
          text-start 
          flex flex-row 
          justify-between 
          ${isActive || isSelected ? 'opacity-100' : 'opacity-50'} 
          ${isSelected ? 'bg-primary-900 bg-opacity-50 opacity-100' : ''}   
        `}
        >
          <div className="flex flex-row gap-4">
            <div className="h-6"> {getLever(position.leverAddress, position.seriesId)?.tradeImage} </div>
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
