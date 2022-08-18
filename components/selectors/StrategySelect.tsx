import { mainModule } from 'process';
import { FC, useContext, useState } from 'react';
import tw from 'tailwind-styled-components';
import { IAsset, ILeverStrategy, LeverContext } from '../../context/LeverContext';
import AssetLogo from '../common/AssetLogo';

const Container = tw.div`p-2 dark:bg-gray-600 bg-gray-400 rounded-lg`;

const ButtonInner = tw.div`
  h-full w-full dark:bg-gray-900/80 bg-gray-100/80 dark:text-gray-50 text-gray-900 rounded-lg
  flex p-3 gap-3 justify-center
`;

const ButtonOuter = tw.button`w-full flex p-[1px]
rounded-lg gap-3 align-middle items-center hover:opacity-80
`;

const StrategySelect = () => {
  const [leverState, leverActions] = useContext(LeverContext);

  const { selectedStrategy, strategies, shortAsset, longAsset } = leverState;

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  return (
    <Container>

      {selectedStrategy?.displayName}

      <div className="flex flex-row gap-[10]">
        <div className="h-12">
          <ButtonOuter
            onClick={() => setModalOpen(!modalOpen)}
            disabled={false}
            style={{
              background: `linear-gradient(135deg, #f7953380, #f3705580, #ef4e7b80, #a166ab80, #5073b880, #1098ad80, #07b39b80, #6fba8280)`,
            }}
          >
            <ButtonInner> Short: {shortAsset?.displaySymbol} </ButtonInner>
          </ButtonOuter>
        </div>

        <div className="h-12">
          <ButtonOuter
            onClick={() => setModalOpen(!modalOpen)}
            disabled={false}
            style={{
              background: `linear-gradient(135deg, #f7953380, #f3705580, #ef4e7b80, #a166ab80, #5073b880, #1098ad80, #07b39b80, #6fba8280)`,
            }}
          >
            <ButtonInner> Long: {longAsset?.displaySymbol}</ButtonInner>
          </ButtonOuter>
        </div>
      </div>

      {/* <div className="h-12">
        <ButtonOuter
          onClick={() => setModalOpen(!modalOpen)}
          disabled={false}
          style={{
            background: `linear-gradient(135deg, #f7953380, #f3705580, #ef4e7b80, #a166ab80, #5073b880, #1098ad80, #07b39b80, #6fba8280)`,
          }}
        >
          <ButtonInner> ♻︎ </ButtonInner>
        </ButtonOuter>
      </div> */}

      {modalOpen && (
        <>
          {Array.from(strategies.values()).map((s: ILeverStrategy) => {
            return (
              <div key={s.id} className='gap-["10px"]'>
                <ButtonOuter
                  onClick={() => { leverActions.selectStrategy(s); setModalOpen(false);} }
                  disabled={false}
                  style={{
                    background: `linear-gradient(135deg, #f7953380, #f3705580, #ef4e7b80, #a166ab80, #5073b880, #1098ad80, #07b39b80, #6fba8280)`,
                  }}
                >
                  {s.displayName}
                </ButtonOuter>
              </div>
            );
          })}
        </>
      )}
    </Container>
  );
};

export default StrategySelect;
