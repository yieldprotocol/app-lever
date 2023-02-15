import { FC, Fragment, useContext, useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import { IAsset, ILever, ILeverContextState, LeverContext } from '../../context/LeverContext';
import { BorderWrap, ClickableContainer, Section, SectionHead, TopRow } from '../styled';

import { ArrowsRightLeftIcon } from '@heroicons/react/24/solid';
import { ArrowTrendingDownIcon, ArrowTrendingUpIcon, CheckBadgeIcon, StarIcon } from '@heroicons/react/20/solid';

import {
  ExclamationCircleIcon,
  InformationCircleIcon,
  StarIcon as StarIconOutline,
  XCircleIcon,
} from '@heroicons/react/24/outline';

import { Listbox, Transition } from '@headlessui/react';
import { formatDate } from '../../utils/appUtils';
import { toast } from 'react-toastify';
import StackedLogos from '../common/StackedLogos';
import Modal, { IModal } from '../common/Modal';
import { IInputContextState, InputContext } from '../../context/InputContext';

const LeverSelectModal = (props: any) => {
  const [leverState, leverActions] = useContext(LeverContext);
  const { levers, assets } = leverState as ILeverContextState;
  const assetsList = Array.from(assets.values()).filter((a: IAsset) => a.showToken);

  const [inputState, inputActions] = useContext(InputContext);
  const { selectedLever } = inputState;
  const { selectLever } = inputActions;

  const [allLevers, setAllLevers] = useState<ILever[]>([]);

  /**
   *  Get the list of all the  levers,
   * */
  useEffect(() => {
    const leverList = Array.from(levers.values());
    setAllLevers(leverList);
  }, [levers]);

  const leverEntry = (lever: ILever) => {

    const longAsset = assets.get(lever.ilkId);
    const shortAsset = assets.get(lever.baseId);

    return (
      <ClickableContainer key={lever.id}>
        <div
          className={`flex p-4 justify-between rounded ${
            selectedLever?.id === lever.id ? 'bg-primary-600 bg-opacity-25' : 'opacity-50'
          }`}
          onClick={() => selectLever(lever)}
        >
          <div className="flex gap-8">
            <StackedLogos size={6} logos={[longAsset?.image!, shortAsset?.image!]} />

            <div className="text-start">
              <div className="font-normal">{`${longAsset?.symbol} | ${ shortAsset?.symbol} `}</div>
              <div className="text-xs font-thin">{formatDate(lever.maturityDate)}</div>
            </div>
          </div>

          {/* <div className="text-xs" >{formatDate(l.maturityDate)}</div> */}
          <div>
            <InformationCircleIcon className="w-6 h-6 text-gray-500" onClick={() => console.log('eomtignd')} />
          </div>
        </div>
      </ClickableContainer>
    );
  };

  return (
    <Modal isOpen={props.showModal} setIsOpen={props.setShowModal}>
      <Section className="space-y-8">
        <SectionHead>
          <div className="flex justify-between">
            <div> All Yield Levers </div>
            <XCircleIcon className="w-6 h-6 text-gray-500" onClick={() => props.setShowModal(false)} />
          </div>
        </SectionHead>

        <div className="space-y-1">{allLevers.map((lever: ILever) => leverEntry(lever))}</div>
      </Section>
    </Modal>
  );
};

export default LeverSelectModal;
