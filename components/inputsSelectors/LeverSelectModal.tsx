import { Fragment, useContext, useEffect, useState } from 'react';
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
import Modal from '../common/Modal';
import  { IInputContextState, InputContext } from '../../context/InputContext';


const LeverSelectModal = () => {
  const [leverState, leverActions] = useContext(LeverContext);
  const {  levers, assets } = leverState as ILeverContextState;
  const assetsList = Array.from(assets.values()).filter((a: IAsset) => a.showToken);


  const [inputState, inputActions] = useContext(InputContext);
  const { selectedLever } = inputState as IInputContextState;

  const [allLevers, setAllLevers] = useState<ILever[]>([]);
  const [showAllLevers, setShowAllLevers] = useState(false);


  return (
    <Modal isOpen={showAllLevers} setIsOpen={() => setShowAllLevers(!showAllLevers)}>
    <Section className={selectedLever ? 'opacity-100' : 'opacity-25'}>
      <SectionHead>
        <div className="flex justify-between">
          <div> All Yield Levers </div>
          <XCircleIcon className="w-6 h-6 text-gray-500" onClick={() => setShowAllLevers(false)} />
        </div>
      </SectionHead>
      <div className="space-y-1">
        {allLevers.map((l: ILever) => (
          <ClickableContainer key={l.id}>
            <div
              className={`flex p-4 justify-between rounded ${
                selectedLever?.id === l.id ? 'bg-primary-600 bg-opacity-25' : 'opacity-50'
              }`}
              onClick={() => leverActions.selectLever(l)}
            >
              <div className="flex   gap-2">
                <StackedLogos size={6} logos={[assets.get(l.ilkId)!.image!, assets.get(l.baseId)!.image!]} />
              </div>
              {/* <div className="w-6 h-6">{l.tradeImage}</div> */}
              <div>{formatDate(l.maturityDate)}</div>
              <div>
                <InformationCircleIcon className="w-6 h-6 text-gray-500" onClick={() => console.log('eomtignd')} />
              </div>
            </div>
          </ClickableContainer>
        ))}
      </div>
    </Section>
  </Modal>
  );
};

export default LeverSelectModal;

