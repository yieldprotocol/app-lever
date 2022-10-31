import { mainModule } from 'process';
import { FC, Fragment, useContext, useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import { IAsset, ILeverStrategy, LeverContext } from '../../context/LeverContext';
import AssetSelect from './AssetSelect';
import Modal from '../common/Modal';
import { BorderWrap, Inner, TopRow } from '../styled';

import { ArrowsRightLeftIcon } from '@heroicons/react/24/solid';
import { ArrowTrendingDownIcon, ArrowTrendingUpIcon } from '@heroicons/react/20/solid';

import { Listbox, Menu, Transition } from '@headlessui/react';
import { connectors } from '../../connectors';

const InfoBlock = tw.div`grid grid-cols-2 gap-2 p-4`;
const Container = tw.div`
rounded-md
w-full 
hover:border 
border 
hover:border-gray-400 
dark:hover:border-gray-600 
dark:border-gray-800 
dark:bg-gray-800 bg-gray-300 border-gray-300 dark:bg-opacity-25 bg-opacity-25`;
const Value = tw.div`text-[white] text-right`;

const assetOption = (asset: IAsset, shortSelect: boolean = true) => {
  const disabled = shortSelect ? !asset.isShortAsset : !asset.isLongAsset;

  if (asset)
    return (
      <Listbox.Option as={Fragment} key={asset.id} value={asset}>
        {!disabled ? (
          <div className={`flex flex-row gap-4 align p-2 text-white `}>
            <div className="w-6">{asset.image}</div>
            {asset.displaySymbol}
          </div>
        ) : (
          <div className={`flex flex-row gap-4 align p-2 text-white opacity-25 `}>
            <div className="w-6">{asset.image}</div>
            {asset.displaySymbol}
          </div>
        )}
      </Listbox.Option>
    );
  return <div> Loading ... </div>;
};

const SelectedAssetStyled = ({ asset, select }: { asset: IAsset; select: 'LONG' | 'SHORT' }) => {
  if (asset)
    return (
      <Listbox.Button as="div" className="p-2" key={asset.id}>
        {assetOption(asset, select === 'SHORT')}
        {/* <div className="flex flex-row pv-2 justify-start gap-4 align-baseline">
          <div className="w-8">{asset.image}</div>
          {asset.displaySymbol}
        </div> */}
      </Listbox.Button>
    );
  return <div> Loading ... </div>;
};

const ListOptionsStyled = ({ children }) => (
  <BorderWrap>
    <Transition
      // enter="transition duration-100 ease-out"
      // enterFrom="transform scale-95 opacity-0"
      // enterTo="transform scale-100 opacity-100"
      // leave="transition duration-75 ease-out"
      // leaveFrom="transform scale-100 opacity-100"
      // leaveTo="transform scale-95 opacity-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      className="absolute shadow-lg bg-slate-900 rounded-lg z-50"
    >
      <Listbox.Options className="overflow-auto max-h-80 flex flex-col">{children}</Listbox.Options>
    </Transition>
  </BorderWrap>
);

const StrategySelect = () => {
  const [leverState, leverActions] = useContext(LeverContext);
  const { selectedStrategy, strategies, shortAsset, longAsset, assets } = leverState;
  const assetsList = Array.from(assets.values());

  const [possibleStrategies, setPossibleStrategies] = useState<ILeverStrategy[]>([]);

  const [short, setShort] = useState<IAsset>(shortAsset);
  const [long, setLong] = useState<IAsset>(longAsset);
  useEffect(() => {
    setShort(shortAsset);
    setLong(longAsset);
  }, [shortAsset, longAsset]);

  useEffect(() => {
    const newStratList: ILeverStrategy[] = [];
    strategies.forEach((x: ILeverStrategy) => {
      if (x.baseId === short.id && x.ilkId === long.id) newStratList.push(x);
      setPossibleStrategies(newStratList);
      leverActions.selectStrategy(newStratList[0]);
    });
  }, [short, long]);

  return (
    <div className="space-y-4">
      <div className="flex flex-row gap-4">
        <Container>
          <TopRow className="p-1 justify-start gap-2">
            <div className="flex flex-row text-xs text-slate-500 text-start gap-2">Short</div>
            <ArrowTrendingDownIcon className="h-4 w-4 text-slate-500" />
          </TopRow>

          <Listbox value={short} onChange={(x: IAsset) => setShort(x)}>
            <SelectedAssetStyled asset={short} select="SHORT" />
            <ListOptionsStyled>
              {assetsList
                .filter((a: IAsset) => a.id !== short?.id)
                .filter((a: IAsset) => a.id !== long?.id)
                .map((a: IAsset) => assetOption(a))}
            </ListOptionsStyled>
          </Listbox>
        </Container>

        <div className="justify-center">
          <div
            className="bg-teal-700 rounded-full p-2 "
            onClick={() => {
              setLong(short);
              setShort(long);
            }}
          >
            <ArrowsRightLeftIcon className="h-6 w-6 text-white" />
          </div>
        </div>

        <Container>
          <TopRow className="p-1 justify-start gap-2">
            <div className="flex flex-row text-xs text-slate-500 text-start gap-2">Long</div>
            <ArrowTrendingUpIcon className="h-4 w-4 text-slate-500" />
          </TopRow>
          <Listbox value={long} onChange={(x: IAsset) => setLong(x)}>
            <SelectedAssetStyled asset={long} select="LONG" />
            <ListOptionsStyled>
              {assetsList
                .filter((a: IAsset) => a.id !== short?.id)
                .filter((a: IAsset) => a.id !== long?.id)
                .map((a: IAsset) => assetOption(a, false))}
            </ListOptionsStyled>
          </Listbox>
        </Container>
      </div>

      <div>
        <div className="gap-4">
          {possibleStrategies.map((s: ILeverStrategy) => {
            return (
              <Container key={s.id}>
                <div 
                  className={` ${selectedStrategy.id === s.id ? 'bg-teal-900 bg-opacity-25 p-2' : 'text-xs p-2'}`} 
                  onClick={()=> leverActions.selectStrategy(s)}
                >
                  {`${s.displayName}`}
                </div>
              </Container>
            );
          })}
          {possibleStrategies.length === 0 && <div className='p-3 text-sm'>  No strategies currently available for this pair. </div>}
        </div>
      </div>
    </div>
  );
};

export default StrategySelect;
