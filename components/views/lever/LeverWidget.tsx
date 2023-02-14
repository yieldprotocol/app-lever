import { useContext } from 'react';
import tw from 'tailwind-styled-components';
import Button from '../../common/Button';

import LeverageSelect from '../../inputsSelectors/LeverageSelect';

import { CogIcon } from '@heroicons/react/24/solid';

import { ValueInput } from '../../inputsSelectors/ValueInput';
import { ILeverContextState, LeverContext } from '../../../context/LeverContext';
import LeverSelect from '../../inputsSelectors/LeverSelect';
import { ILeverSimulation } from '../../../hooks/useLever';
import { BorderWrap, TopRow, Inner, Section, SectionHead } from '../../styled';
import { InputContext } from '../../../context/InputContext';
import { useAccount } from 'wagmi';

const ClearButton = tw.button`text-sm`;

const LeverWidget = (props: any) => {
  /* Bring in lever context - instead of passing them as props */
  const [leverState] = useContext(LeverContext);
  const { assets } = leverState as ILeverContextState;
 /* bring in input actions */
  const [inputState,inputActions] = useContext(InputContext);
  const { selectedLever } = inputState
  
  const shortAsset = assets.get(selectedLever?.baseId!);
  const { address: account } = useAccount();

  const { invest, isSimulating, maxLeverage }: ILeverSimulation = props.lever;

  return (
    <BorderWrap className="h-full pb-4">
      <TopRow>
        <div className="text-lg"> Open a New Position </div>
        <ClearButton onClick={() => console.log('actually, this might not do anything? settings?')}>
          <CogIcon className="h-6 w-6 text-primary-600" />
        </ClearButton>
      </TopRow>
      <Inner>
        <Section>
          <SectionHead>              
             <div className="flex justify-between">
              <div> Lever Strategy </div>
              {/* <button className="text-xs text-slate-500" onClick={()=> console.log( 'sdfsd') }>
                  See all available levers
                </button> */}
            </div>
            </SectionHead>
          <LeverSelect />
        </Section>

        <Section className={ selectedLever ? 'opacity-100' : 'opacity-25'} >
          <SectionHead>
            <div className="flex justify-between">
              <div> Investment </div>
              {selectedLever && shortAsset && (
                <button className="text-xs text-slate-500" onClick={()=> inputActions.setInput(selectedLever.minDebt.dsp) }>
                  Min: {selectedLever.minDebt.dsp} {shortAsset.displaySymbol}{' '}
                </button>
              )}
            </div>
          </SectionHead>
          <ValueInput />
        </Section>

        <Section className={ selectedLever ? 'opacity-100' : 'opacity-25'}>
          <SectionHead> Leverage </SectionHead>
          <LeverageSelect max={maxLeverage} />
        </Section>
      </Inner>

      <div className="p-8 text-center">
        <Button
          action={() => invest()}
          disabled={
            !account ||
            !selectedLever 
          } // add in isTransacting check
          loading={isSimulating}
        >
          {!account ? 'Connect Wallet' : 'Trade'}
        </Button>
      </div>
    </BorderWrap>
  );
};

export default LeverWidget;
