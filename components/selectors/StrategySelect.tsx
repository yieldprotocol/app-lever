import { mainModule } from 'process';
import { FC, useContext, useState } from 'react';
import tw from 'tailwind-styled-components';
import { IAsset, ILeverStrategy, LeverContext } from '../../context/LeverContext';
import AssetLogo from '../common/AssetLogo';
import Modal from '../common/Modal';
import { BorderWrap } from '../styles';

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

  const SelectModal = () => (
    <Modal isOpen={modalOpen} setIsOpen={(isOpen) => setModalOpen(!modalOpen)}>
      {Array.from(strategies.values()).map((strat: ILeverStrategy) => {
        return (
          <BorderWrap>
              <div>{strat.displayName}</div> 
          </BorderWrap>
       )
      })}
      <div></div>
    </Modal>
  );

  return (
    <>
      <ButtonOuter
        onClick={() => setModalOpen(!modalOpen)}
        disabled={false}
        style={{
          background: `linear-gradient(135deg, #f7953380, #f3705580, #ef4e7b80, #a166ab80, #5073b880, #1098ad80, #07b39b80, #6fba8280)`,
        }}
      >
        <ButtonInner> Short: {shortAsset?.displaySymbol} </ButtonInner>
      </ButtonOuter>

      <ButtonOuter
        onClick={() => setModalOpen(!modalOpen)}
        disabled={false}
        style={{
          background: `linear-gradient(135deg, #f7953380, #f3705580, #ef4e7b80, #a166ab80, #5073b880, #1098ad80, #07b39b80, #6fba8280)`,
        }}
      >
        <ButtonInner> Long: {longAsset?.displaySymbol}</ButtonInner>
      </ButtonOuter>

      {modalOpen && <SelectModal />}
    </>
  );
};

export default StrategySelect;
