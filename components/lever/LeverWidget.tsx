import { useContext } from 'react';
import tw from 'tailwind-styled-components';
import Button from '../common/Button';

import { BorderWrap, Header } from '../styles';
import LeverageSelect from '../selectors/LeverageSelect';

import { ValueInput } from '../selectors/ValueInput';
import { LeverContext } from '../../context/LeverContext';
import StrategySelect from '../selectors/StrategySelect';

const Inner = tw.div`m-4 text-center`;
const TopRow = tw.div` p-8 flex justify-between align-middle text-center items-center rounded-t-lg dark:bg-gray-900 
bg-gray-100
bg-opacity-25
dark:text-gray-50 
dark:bg-opacity-25 `;
const ClearButton = tw.button`text-sm`;

const Section = tw.div`
w-full
my-2
p-2
rounded-lg 
dark:bg-gray-900 
bg-gray-100
bg-opacity-25
dark:text-gray-50 
dark:bg-opacity-25
`;

const SectionHead = tw.div`text-left m-2`

const LeverWidget = (props: any) => {
  /* Bring in lever context - instead of passing them as props */
  const [ leverState ] = useContext(LeverContext);
  const { account, selectedStrategy} = leverState;

  const {
    transact,
    approve,
    isSimulating,
  } = props.lever;

  return (
      <BorderWrap>
        <TopRow >
              <div className='text-lg'> Open Position </div>
            <ClearButton onClick={() => console.log('actually, this might not do anything? settings?')}>
                [settings]
            </ClearButton>
          </TopRow>
        <Inner>

          <Section>
            <SectionHead>Strategy </SectionHead>
            <StrategySelect />
          </Section>

          <Section>
            <SectionHead>Principle investment </SectionHead>
            
            <ValueInput />
            </Section>

          <Section>
          <SectionHead> Leverage:</SectionHead>
            <LeverageSelect  />
          </Section>

          <Button
            action={() => transact() }
            disabled={!account || !selectedStrategy} // add in isTransacting check
            loading={false}
            // loading={isTransacting} 
          >
            {/* {!account ? 'Connect Wallet' : isTransacting ? 'Trade Initiated...' : 'Trade'} */}
            {!account ? 'Connect Wallet' : 'Action'}
          </Button>
        </Inner>
        is simulatin? {isSimulating?.toString() }
      </BorderWrap>
  );
};

export default LeverWidget;
