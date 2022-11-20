import { useContext } from 'react';
import tw from 'tailwind-styled-components';
import Button from '../common/Button';

import LeverageSelect from '../selectors/LeverageSelect';

import { CogIcon } from '@heroicons/react/24/solid';

import { ValueInput } from '../selectors/ValueInput';
import { LeverContext } from '../../context/LeverContext';
import LeverSelect from '../selectors/LeverSelect';
import { ILeverSimulation } from '../../hooks/useLever';
import { BorderWrap, TopRow, Inner, Section, SectionHead } from '../styled';
import { InputContext } from '../../context/InputContext';
import { useAccount } from 'wagmi';

const ClearButton = tw.button`text-sm`;

const LeverWidget = (props: any) => {
  /* Bring in lever context - instead of passing them as props */
  const [leverState] = useContext(LeverContext);
  const { selectedLever, shortAsset } = leverState;

  const [{ input }] = useContext(InputContext);
  const { address: account } = useAccount();

  const { invest, isSimulating, maxLeverage, borrowLimitUsed, shortBorrowed }: ILeverSimulation = props.lever;

  return (
    <BorderWrap className="h-full">
      <TopRow>
        <div className="text-lg"> Open a Position: </div>
        <ClearButton onClick={() => console.log('actually, this might not do anything? settings?')}>
          <CogIcon className="h-6 w-6 text-primary-700" />
        </ClearButton>
      </TopRow>
      <Inner>
        <Section>
          <SectionHead>Lever Strategy </SectionHead>
          <LeverSelect />
        </Section>

        <Section>
          <SectionHead>
            <div className="flex flex-row justify-between">
              Principle investment
              {selectedLever && shortAsset && (
                <div className="text-xs text-slate-500">
                  Min: {selectedLever.minDebt.dsp} {shortAsset.displaySymbol}{' '}
                </div>
              )}
            </div>
          </SectionHead>
          <ValueInput />
        </Section>

        <Section>
          <SectionHead> Leverage:</SectionHead>
          <LeverageSelect max={maxLeverage} />
        </Section>
      </Inner>

      <div className="p-8 text-center">
        <Button
          action={() => invest()}
          disabled={
            !account ||
            !selectedLever ||
            borrowLimitUsed > 100 ||
            shortBorrowed.big.gt(selectedLever.maxBase.big) ||
            input?.big.lt(selectedLever.minDebt.big)
          } // add in isTransacting check
          // loading={false}
          loading={isSimulating}
        >
          {!account ? 'Connect Wallet' : 'Trade'}
        </Button>
      </div>
    </BorderWrap>
  );
};

export default LeverWidget;
