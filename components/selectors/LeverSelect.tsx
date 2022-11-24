import { Fragment, useContext, useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import { IAsset, ILever, ILeverContextState, LeverContext } from '../../context/LeverContext';
import { BorderWrap, ClickableContainer, TopRow } from '../styled';

import { ArrowsRightLeftIcon } from '@heroicons/react/24/solid';
import { ArrowTrendingDownIcon, ArrowTrendingUpIcon, CheckBadgeIcon, StarIcon } from '@heroicons/react/20/solid';

import { ExclamationCircleIcon, InformationCircleIcon, StarIcon as StarIconOutline } from '@heroicons/react/24/outline';

import { Listbox, Transition } from '@headlessui/react';
import { formatDate } from '../../utils/appUtils';
import { toast } from 'react-toastify';

enum AssetType {
  SHORT,
  LONG,
}

export const Selectable = tw.button`
flex 
flex-row 
space-x-4 
align 
p-2 
text-white
hover:opacity-100 
border 
border-transparent 
rounded`;

const assetOption = (asset: IAsset, recommended: boolean, assetType: AssetType) => {
  const isOption = assetType === AssetType.SHORT ? asset.isShortAsset : asset.isLongAsset;
  if (asset)
    return (
      <Listbox.Option as={Fragment} key={asset.id} value={asset}>
        <Selectable className={` ${!isOption && 'opacity-50'} hover:border hover:border-primary-500 `}>
          <div className="w-6">{asset.image}</div>
          <div>{asset.displaySymbol}</div>
          {recommended && <CheckBadgeIcon className="w-4 text-primary-500" />}
        </Selectable>
      </Listbox.Option>
    );
  return <div> Loading ... </div>;
};

const SelectedAssetStyled = ({ asset, assetType }: { asset: IAsset; assetType: AssetType }) => {
  if (asset)
    return (
      <Listbox.Button as="div" className="p-2" key={asset.id}>
        <Listbox.Option as={Fragment} key={asset.id} value={asset}>
          <Selectable>
            <div className="w-6">{asset.image}</div>
            <div>{asset.displaySymbol}</div>
          </Selectable>
        </Listbox.Option>
      </Listbox.Button>
    );
  return <div> Loading ... </div>;
};

const ListOptionsStyled = ({ children }: { children: any[] }) => (
  <BorderWrap>
    <Transition
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      className="absolute shadow-lg bg-slate-900 rounded-lg z-50"
    >
      <Listbox.Options className="overflow-auto max-h-80 flex flex-col">{children}</Listbox.Options>
    </Transition>
  </BorderWrap>
);

const LeverSelect = () => {
  const [leverState, leverActions] = useContext(LeverContext);
  const { selectedLever, levers, assets, selectedShortAsset, selectedLongAsset } = leverState as ILeverContextState;
  const assetsList = Array.from(assets.values());

  const [possibleLevers, setPossibleLevers] = useState<ILever[]>([]);
  const [requestedPairs, setRequestedPair] = useState<string[]>([]);

  /* When the selected lever changes, make sure the selected assets match */
  useEffect(() => {
    if (selectedLever) {
      leverActions.selectShort(assets.get(selectedLever.baseId));
      leverActions.selectLong(assets.get(selectedLever.ilkId));
    }
  }, [selectedLever]);

  /* get the list of possible levers, based on the selected short/long asset pair selected */
  useEffect(() => {
    const list = Array.from(levers.values());
    const filteredLevers = list.filter(
      (lever_: ILever) => lever_.baseId === selectedShortAsset?.id && lever_.ilkId === selectedLongAsset?.id
    );
    setPossibleLevers(filteredLevers);
    /* select the first on the list, of the list is blank deselect the strategy */
    filteredLevers.length > 0 ? leverActions.selectLever(filteredLevers[0]) : leverActions.selectLever(undefined);
  }, [selectedShortAsset, selectedLongAsset, levers]);

  const handlePairRequest = () => {
    toast.info('Trading pair requested.');
    setRequestedPair([...requestedPairs, `${selectedShortAsset?.symbol}${selectedLongAsset?.symbol}`]);
  };

  /**
   * fn : Find corresponding assets available from all the levers.
   * based on the lever pairs, what are the possible (long/short) assets to choose if x is selected as the s(hort/long) asset.
   * */
  const isRecommended = (asset: IAsset, assetType: AssetType) => {
    const list = Array.from(levers.values());
    return assetType === AssetType.SHORT
      ? !!list.find((l: ILever) => l.ilkId === selectedLongAsset?.id && l.baseId === asset.id)
      : !!list.find((l: ILever) => l.baseId === selectedShortAsset?.id && l.ilkId === asset.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-row space-x-4 ">
        <ClickableContainer>
          <TopRow className="p-1 gap-2 justify-start">
            <div className="flex flex-row text-xs text-slate-500 text-start ">Long</div>
            <ArrowTrendingUpIcon className="h-4 w-4 text-slate-500" />
          </TopRow>
          <Listbox value={selectedLongAsset} onChange={(x: IAsset) => leverActions.selectLong(x)}>
            <SelectedAssetStyled asset={selectedLongAsset!} assetType={AssetType.LONG} />
            <ListOptionsStyled>
              {assetsList
                .filter((a: IAsset) => a.id !== selectedShortAsset?.id)
                .filter((a: IAsset) => a.id !== selectedLongAsset?.id)
                .sort((a: IAsset, b: IAsset) => Number(b.isLongAsset) - Number(a.isLongAsset))
                .sort(
                  (a: IAsset, b: IAsset) =>
                    Number(isRecommended(b, AssetType.LONG)) - Number(isRecommended(a, AssetType.LONG))
                )
                .map((a: IAsset) => assetOption(a, isRecommended(a, AssetType.LONG), AssetType.LONG))}
            </ListOptionsStyled>
          </Listbox>
        </ClickableContainer>

        <div className="justify-center pt-6 z-20">
          <button
            className="bg-primary-700 rounded-full p-2 border hover:border
            hover:border-green-400  border-transparent"
            onClick={() => {
              leverActions.selectLong(selectedShortAsset);
              leverActions.selectShort(selectedLongAsset);
            }}
          >
            <ArrowsRightLeftIcon className="h-6 w-6 text-white" />
          </button>
        </div>

        <ClickableContainer>
          <TopRow className="p-1 gap-2 justify-start ">
            <div className="flex flex-row text-xs text-slate-500 text-start ">Short</div>
            <ArrowTrendingDownIcon className="h-4 w-4 text-slate-500" />
          </TopRow>
          <Listbox value={selectedShortAsset} onChange={(x: IAsset) => leverActions.selectShort(x)}>
            <SelectedAssetStyled asset={selectedShortAsset!} assetType={AssetType.SHORT} />
            <ListOptionsStyled>
              {assetsList
                .filter((a: IAsset) => a.isShortAsset )
                .sort((a: IAsset, b: IAsset) => Number(b.isShortAsset) - Number(a.isShortAsset))
                .sort(
                  (a: IAsset, b: IAsset) =>
                    Number(isRecommended(b, AssetType.SHORT)) - Number(isRecommended(a, AssetType.SHORT))
                )
                .map((a: IAsset) => assetOption(a, isRecommended(a, AssetType.SHORT), AssetType.SHORT))}
            </ListOptionsStyled>
          </Listbox>
        </ClickableContainer>
      </div>

      <div>
        {  levers.size===0 && 
            <div> Loading ... </div>
        }

        <div className="space-y-1">
          {possibleLevers.map((l: ILever) => (
            <ClickableContainer key={l.id}>
              <div
                className={`flex flex-row p-4 justify-between ${
                  selectedLever?.id === l.id ? 'bg-primary-900 bg-opacity-25 h-14' : 'text-xs opacity-50'
                }`}
                onClick={() => leverActions.selectLever(l)}
              >
                <div className="w-6 h-6">{l.tradeImage}</div>
                <div>{`${l.displayName}`} </div>
                <div>{formatDate(l.maturityDate)}</div>
                <div>
                  <InformationCircleIcon className="w-6 h-6 text-gray-500" />
                </div>
              </div>
            </ClickableContainer>
          ))}

          {levers.size>0 && possibleLevers.length === 0 && (
            <ClickableContainer>
              <div className="grid overflow-hidden grid-cols-4 grid-rows-1 p-4">
                <div className="col-span-1  ">
                  <div className="flex flex-row justify-center">
                    <ExclamationCircleIcon className="w-10" />
                  </div>
                </div>
                <div className="col-span-3 gap-2 space-y-2">
                  <div className="flex flex-row justify-end">
                    <div className="text-sm"> There are no strategies available for this pair, yet. </div>
                  </div>
                  <div className="flex flex-row justify-end ">
                    <button
                      className="flex flex-row text-xs text-slate-500 gap-4 rounded "
                      onClick={() => handlePairRequest()}
                    >
                      Are you are interested in adding this pair?
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
    </div>
  );
};

export default LeverSelect;
