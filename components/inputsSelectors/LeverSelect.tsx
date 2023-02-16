import { Fragment, useContext, useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import { IAsset, ILever, ILeverContextState, LeverContext } from '../../context/LeverContext';
import { BorderWrap, ClickableContainer, Section, SectionHead, Spinner, TopRow } from '../styled';

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
import LeverSelectModal from './LeverSelectModal';
import { IInputContextState, InputContext } from '../../context/InputContext';
import Loader from '../common/Loader';

enum AssetType {
  SHORT,
  LONG,
}

export const Selectable = tw.button`
flex 
space-x-4 
align 
p-2 
text-white
hover:opacity-100 
border 
border-transparent 
rounded`;

const assetOption = (asset: IAsset, recommended: boolean, assetType: AssetType) => {
  const isOption = assetType === AssetType.SHORT ? asset.isBaseAsset : asset.isLongAsset;
  if (asset)
    return (
      <Listbox.Option as={Fragment} key={asset.id} value={asset}>
        <Selectable className={` ${!isOption && 'opacity-50'} hover:border hover:border-primary-600 `}>
          <div className="w-6">{asset.image}</div>
          <div>{asset.groupingId ? asset.groupingId : asset.displaySymbol}</div>
          {recommended && <CheckBadgeIcon className="w-4 text-emerald-600" />}
        </Selectable>
      </Listbox.Option>
    );
  return <Spinner />;
};

const SelectedAssetStyled = ({ asset, assetType }: { asset: IAsset; assetType: AssetType }) => {
  if (asset)
    return (
      <Listbox.Button as="div" className="p-2" key={asset.id}>
        <Listbox.Option as={Fragment} key={asset.id} value={asset}>
          <Selectable>
            <div className="w-6">{asset.image}</div>
            <div>{asset.groupingId ? asset.groupingId : asset.displaySymbol}</div>
          </Selectable>
        </Listbox.Option>
      </Listbox.Button>
    );
  return <Spinner />;
};

const ListOptionsStyled = ({ children }: { children: any[] }) => (
  <BorderWrap>
    <Transition
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      className="absolute shadow-lg bg-slate-900 rounded-lg z-50"
    >
      <Listbox.Options className="overflow-auto max-h-80 flex flex-col bg-gray-900 w-56">{children}</Listbox.Options>
    </Transition>
  </BorderWrap>
);

const LeverSelect = () => {
  const [leverState] = useContext(LeverContext);
  const { levers, assets } = leverState as ILeverContextState;

  const [inputState, inputActions] = useContext(InputContext);
  const { selectedLever } = inputState;
  const { selectLever } = inputActions;

  const [showModal, setShowModal] = useState(false);

  const [possibleLevers, setPossibleLevers] = useState<ILever[]>([]);
  const [requestedPairs, setRequestedPair] = useState<string[]>([]);

  const [shortAssetList, setShortAssetList] = useState<IAsset[]>([]);
  const [longAssetList, setLongAssetList] = useState<IAsset[]>([]);

  const [selectedShortAsset, setSelectedShortAsset] = useState<IAsset>();
  const [selectedLongAsset, setSelectedLongAsset] = useState<IAsset>();

  /** Create a list of recommended assets */
  useEffect(() => {
    /* Filter all the assets with a unique groupingId ( or undefined groupId ) */
    const assetsSet = new Set();
    const assetGroupsList = Array.from(assets.values())
      .filter((a: IAsset) => a.showToken)
      .filter((asset: IAsset) => {
        if (asset.groupingId != undefined && assetsSet.has(asset.groupingId)) {
          return false;
        }
        assetsSet.add(asset.groupingId);
        return true;
      });

    const longAssetList_ = assetGroupsList
      .filter((a: IAsset) => a.id !== selectedShortAsset?.id)
      .filter((a: IAsset) => a.id !== selectedLongAsset?.id)
      .sort((a: IAsset, b: IAsset) => Number(b.isLongAsset) - Number(a.isLongAsset))
      .sort(
        (a: IAsset, b: IAsset) => Number(isRecommended(b, AssetType.LONG)) - Number(isRecommended(a, AssetType.LONG))
      );
    setLongAssetList(longAssetList_);

    const shortAssetList_ = assetGroupsList
      .filter((a: IAsset) => a.isBaseAsset)
      .sort((a: IAsset, b: IAsset) => Number(b.isBaseAsset) - Number(a.isBaseAsset))
      .sort(
        (a: IAsset, b: IAsset) => Number(isRecommended(b, AssetType.SHORT)) - Number(isRecommended(a, AssetType.SHORT))
      );
    setShortAssetList(shortAssetList_);

  }, [selectedShortAsset, selectedLongAsset]);



  /* When the selected lever changes, make sure the selected assets match */
  useEffect(() => {
    if (selectedLever) {
      setSelectedShortAsset(assets.get(selectedLever.baseId));
      setSelectedLongAsset(assets.get(selectedLever.ilkId));
    }
  }, [selectedLever]);

  /**
   *  Get the list of possible levers,
   *  based on the selected short/long asset pair selected,
   * and select the first one
   * */
  useEffect(() => {
    const leverList = Array.from(levers.values());
    const longGroupingId = selectedLongAsset?.groupingId;
    /* filter the levers by those that have the same base */
    const filteredLevers = leverList
      .filter((l: ILever) => l.baseId === selectedShortAsset?.id)
      /* filter by group ( or by ilkId if no group ) */
      .filter((l: ILever) =>
        longGroupingId ? l.tradePlatform === longGroupingId : l.ilkId === selectedLongAsset?.id
      )
    /* Set those levers as the possibilites */
    setPossibleLevers( filteredLevers );
  }, [selectedShortAsset, selectedLongAsset, levers]);

  /**
   * fn: handlePairRequest
   *
   */
  const handlePairRequest = () => {
    toast.info('Trading pair requested.');
    setRequestedPair([...requestedPairs, `${selectedShortAsset?.symbol}${selectedLongAsset?.symbol}`]);
  };

  /**
   * fn : Find corresponding assets available from all the levers.
   * based on the lever pairs, what are the possible (long/short) assets to choose if x is selected as the s(hort/long) asset.
   * */
  const isRecommended = (asset: IAsset, assetType: AssetType) => {
    const leverList = Array.from(levers.values());
    return assetType === AssetType.SHORT
      ? !!leverList.find((l: ILever) => l.ilkId === selectedLongAsset?.id && l.baseId === asset.id)
      : !!leverList.find((l: ILever) => l.baseId === selectedShortAsset?.id && l.ilkId === asset.id);
  };

  /**
   * ‘Select’ an asset, and set the other asset to an appropriate one.
   * @param asset
   * @param isSelectingShort
   */
  const handleSelectAsset = (asset: IAsset, assetType: AssetType) => {
    /* first set the short  asset to the selected one */
    if (assetType === AssetType.SHORT) setSelectedShortAsset(asset);
    if (assetType === AssetType.LONG) setSelectedLongAsset(asset);

    /* then set the asset to an applicatble one */
    const leverList = Array.from(levers.values());
    const firstLever = leverList.find((l: ILever) => (assetType === AssetType.SHORT ? l.baseId : l.ilkId) === asset.id);
    
    if (firstLever) {
      assetType === AssetType.SHORT && setSelectedLongAsset(assets.get(firstLever.ilkId));
      assetType === AssetType.LONG && setSelectedShortAsset(assets.get(firstLever.baseId));
    }
    
    /* Also select the first lever in the list, or set the selected lever to undefined */
    selectLever(firstLever);
  };

  return (
    <>
      <LeverSelectModal showModal={showModal} setShowModal={setShowModal} />

      <div className="space-y-4">
        <div className="flex space-x-4 ">
          <ClickableContainer>
            <TopRow className="p-1 gap-2 justify-start">
              <div className="flex text-xs text-slate-500 text-start ">Long</div>
              <ArrowTrendingUpIcon className="h-4 w-4 text-slate-500" />
            </TopRow>
            <Listbox value={selectedLongAsset} onChange={(a: IAsset) => handleSelectAsset(a, AssetType.LONG)}>
              <SelectedAssetStyled asset={selectedLongAsset!} assetType={AssetType.LONG} />
              <ListOptionsStyled>
                {longAssetList.map((a: IAsset) => assetOption(a, isRecommended(a, AssetType.LONG), AssetType.LONG))}
              </ListOptionsStyled>
            </Listbox>
          </ClickableContainer>

          {/* <div className="justify-center pt-6 z-20">
            <button
              className="bg-primary-600 rounded-full p-2 border hover:border
            hover:border-primary-400  border-transparent"
              onClick={() => {
                leverActions.selectLong(selectedShortAsset);
                leverActions.selectShort(selectedLongAsset);
              }}
            >
              <ArrowsRightLeftIcon className="h-6 w-6 text-white" />
            </button>
          </div> */}

          <ClickableContainer>
            <TopRow className="p-1 gap-2 justify-start ">
              <div className="flex   text-xs text-slate-500 text-start ">Short</div>
              <ArrowTrendingDownIcon className="h-4 w-4 text-slate-500" />
            </TopRow>
            <Listbox value={selectedShortAsset} onChange={(a: IAsset) => handleSelectAsset(a, AssetType.SHORT)}>
              <SelectedAssetStyled asset={selectedShortAsset!} assetType={AssetType.SHORT} />
              <ListOptionsStyled>
                {shortAssetList.map((a: IAsset) => assetOption(a, isRecommended(a, AssetType.SHORT), AssetType.SHORT))}
              </ListOptionsStyled>
            </Listbox>
          </ClickableContainer>
        </div>

        <div>
          {levers.size === 0 && <Spinner />}
          <div className="space-y-1">
            {possibleLevers.map((l: ILever) => (
              <ClickableContainer key={l.id}>
                <div
                  className={`flex p-4 justify-between rounded ${
                    selectedLever?.id === l.id ? 'bg-primary-600 bg-opacity-25' : 'opacity-50'
                  }`}
                  onClick={() => selectLever(l)}
                >
                  <div className="flex   gap-2">
                    <StackedLogos size={6} logos={[assets.get(l.ilkId)!.image!, assets.get(l.baseId)!.image!]} />
                  </div>
                  {/* <div className="w-6 h-6">{l.tradeImage}</div> */}
                  <div>{formatDate(l.maturityDate)}</div>
                  <div>
                    <InformationCircleIcon className="w-6 h-6 text-gray-500" />
                  </div>
                </div>
              </ClickableContainer>
            ))}

            {levers.size > 0 && possibleLevers.length === 0 && (
              <ClickableContainer>
                <div className="grid overflow-hidden grid-cols-4 grid-rows-1 p-4">
                  <div className="col-span-1  ">
                    <div className="flex ">
                      <ExclamationCircleIcon className="w-10" />
                    </div>
                  </div>
                  <div className="col-span-3 gap-2 space-y-2">
                    <div className="flex justify-end">
                      <div className="text-sm"> There are no strategies available for this pair, yet. </div>
                    </div>
                    <div className="flex justify-end ">
                      <button
                        className="flex   text-xs text-slate-500 gap-4 rounded "
                        onClick={() => handlePairRequest()}
                      >
                        Are you are interested in having us add this pair?
                        {selectedShortAsset &&
                        selectedLongAsset &&
                        requestedPairs.includes(`${selectedShortAsset.symbol}${selectedLongAsset.symbol}`) ? (
                          <StarIcon className="w-4 h-4" />
                        ) : (
                          <StarIconOutline className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </ClickableContainer>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            className="flex text-xs text-slate-500 justify-end hover:text-white"
            onClick={() => setShowModal(true)}
          >
            See all available levers
          </button>
        </div>
      </div>
    </>
  );
};

export default LeverSelect;
