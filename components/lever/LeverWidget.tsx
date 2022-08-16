import { useContext } from 'react';
import tw from 'tailwind-styled-components';
import Button from '../common/Button';

import { BorderWrap, Header } from '../styles';

import ShortSelect from '../selectors/ShortSelect';
import LongSelect from '../selectors/LongSelect';
import LeverageSelect from '../selectors/LeverageSelect';

import { useLever } from '../../hooks/useLever';
import { ValueInput } from './ValueInput';

import { LeverContext } from '../../context/LeverContext';
import { InputContext } from '../../context/InputContext';

const Inner = tw.div`m-4 text-center`;
const Grid = tw.div`grid my-5 auto-rows-auto gap-2`;
const TopRow = tw.div`flex justify-between align-middle text-center items-center`;
const ClearButton = tw.button`text-sm`;

const LeverWidget = (contracts: any) => {
  /* Bring in lever context - instead of passing them as props */
  const [leverState ] = useContext(LeverContext);
  const { account, selectedStrategy} = leverState;

  /* All leveraging functionality has been moved into this hook */
  const {
    transact,
    approve,
  } = useLever();


  return (
      <BorderWrap>
        <Inner>
          <TopRow>
            <Header>Lever</Header>
            <ClearButton onClick={() => console.log('actually, this might not do anything? settings?')}>
              Clear All
            </ClearButton>
          </TopRow>

          <div className="flex flex-row gap-1 my-5">
            <div>
              long
              <LongSelect />
            </div>
            <div>
              short
              <ShortSelect />
            </div>
          </div>
          <div>
            Principle investment
            <ValueInput />
          </div>
          <div>
            Leverage:
            <LeverageSelect  />
          </div>

          <Button
            action={() => transact()}
            disabled={!account || !selectedStrategy} // add in isTransacting check
            loading={false}
            // loading={isTransacting} 
          >
            {/* {!account ? 'Connect Wallet' : isTransacting ? 'Trade Initiated...' : 'Trade'} */}
            {!account ? 'Connect Wallet' : 'Action'}
          </Button>
        </Inner>
      </BorderWrap>
  );
};

export default LeverWidget;
