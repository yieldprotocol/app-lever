import { mainModule } from 'process';
import { FC, useContext, useState } from 'react';
import tw from 'tailwind-styled-components';
import { IAsset, ILeverStrategy, LeverContext } from '../../context/LeverContext';
import AssetLogo from '../common/AssetLogo';
import Modal from '../common/Modal';
import { BorderWrap } from '../styled';

const InfoBlock = tw.div`grid grid-cols-2 gap-2 p-4`;
const Label = tw.div`text-[grey] text-left`;
const Value = tw.div`text-[white] text-right`;

const StrategySelect = () => {
  const [leverState, leverActions] = useContext(LeverContext);

  const { selectedStrategy, strategies, shortAsset, longAsset } = leverState;

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const SelectModal = () => (
    <Modal isOpen={modalOpen} setIsOpen={(isOpen) => setModalOpen(!modalOpen)}>
      {Array.from(strategies.values()).map((strat: ILeverStrategy) => (
        <BorderWrap>
          <div
            onClick={() => {
              leverActions.selectStrategy(strat);
              setModalOpen(false);
            }}
          >
            {strat.displayName}
          </div>
        </BorderWrap>
      ))}
      <div></div>
    </Modal>
  );

  return (
    <>
      <div
        onClick={() => setModalOpen(!modalOpen)}
        className="rounded-lg"
        style={{
          background: `linear-gradient(135deg, #f7953380, #f3705580, #ef4e7b80, #a166ab80, #5073b880, #1098ad80, #07b39b80, #6fba8280)`,
        }}
      >
        <InfoBlock>
          <Label>Maturity</Label>
          <Value> {selectedStrategy?.displayName} </Value>

          <Label>Short</Label>
          <Value> {shortAsset?.displaySymbol} </Value>

          <Label>Long </Label>
          <Value>{longAsset?.displaySymbol} </Value>

          <Label> </Label>
          <Value> </Value>
        </InfoBlock>
      </div>

      {modalOpen && <SelectModal />}
    </>
  );
};

export default StrategySelect;
