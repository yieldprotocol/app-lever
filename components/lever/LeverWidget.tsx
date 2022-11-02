import { useContext } from 'react';
import tw from 'tailwind-styled-components';
import Button from '../common/Button';

import LeverageSelect from '../selectors/LeverageSelect';

import { CogIcon } from '@heroicons/react/24/solid';

import { ValueInput } from '../selectors/ValueInput';
import { LeverContext } from '../../context/LeverContext';
import StrategySelect from '../selectors/StrategySelect';
import { LeverSimulation } from '../../hooks/useLever';
import { BorderWrap, TopRow, Inner, Section, SectionHead } from '../styled';
import { InputContext } from '../../context/InputContext';
import { isShorthandPropertyAssignment } from 'typescript';

// const Inner = tw.div`m-4 text-center`;
// const TopRow = tw.div` p-8 flex justify-between align-middle text-center items-center rounded-t-lg dark:bg-gray-900
// bg-gray-100
// bg-opacity-25
// dark:text-gray-50
// dark:bg-opacity-25 `;
const ClearButton = tw.button`text-sm`;

// const Section = tw.div`
// w-full
// my-2
// p-2
// rounded-lg
// dark:bg-gray-900
// bg-gray-100
// bg-opacity-25
// dark:text-gray-50
// dark:bg-opacity-25
// `;

// const SectionHead = tw.div`text-left m-2`

const LeverWidget = (props: any) => {
  /* Bring in lever context - instead of passing them as props */
  const [leverState] = useContext(LeverContext);
  const { account, selectedStrategy, shortAsset } = leverState;

  const [{ input }] = useContext(InputContext);

  const { invest, approve, isSimulating, maxLeverage, borrowLimitUsed, shortBorrowed }: LeverSimulation = props.lever;

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
          <SectionHead>Strategy </SectionHead>
          <StrategySelect />
        </Section>

        <Section>
          <SectionHead>
            <div className="flex flex-row justify-between">
              Principle investment
              {selectedStrategy && shortAsset && (
                <div className="text-xs text-slate-500">
                  Min: {selectedStrategy.minDebt.dsp} {shortAsset.displaySymbol}{' '}
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
            !selectedStrategy ||
            borrowLimitUsed > 100 ||
            shortBorrowed.big.gt(selectedStrategy.maxBase.big) ||
            input?.big.lt(selectedStrategy.minDebt.big)
          } // add in isTransacting check
          // loading={false}
          loading={isSimulating}
        >
          {/* {!account ? 'Connect Wallet' : isTransacting ? 'Trade Initiated...' : 'Trade'} */}
          {!account ? 'Connect Wallet' : 'Trade'}
        </Button>
      </div>
    </BorderWrap>
  );
};

export default LeverWidget;
