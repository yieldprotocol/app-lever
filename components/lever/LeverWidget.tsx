import { useContext, useEffect, useMemo, useState } from 'react';
import { BigNumber } from 'ethers';
import tw from 'tailwind-styled-components';
import Button from '../common/Button';

import { BorderWrap, Header } from '../styles';

import ShortSelect from '../selectors/ShortSelect';
import LongSelect from '../selectors/LongSelect';
import LeverageSelect from '../selectors/LeverageSelect';

import { useLever } from './useLever';
import { ValueInput } from './ValueInput';

import { LeverContext } from '../../context/LeverContext';
import { AppState } from '../../lib/protocol/types';
import { InputContext } from '../../context/InputContext';

const Inner = tw.div`m-4 text-center`;
const Grid = tw.div`grid my-5 auto-rows-auto gap-2`;
const TopRow = tw.div`flex justify-between align-middle text-center items-center`;
const ClearButton = tw.button`text-sm`;

const LeverWidget = (contracts: any) => {
  /* Bring in lever context - instead of passing them as props */
  const [leverState, leverActions] = useContext(LeverContext);
  const [inputState, inputActions] = useContext(InputContext);

  const { account, balances, appState } = leverState;
  const { setAppState } = leverActions;
  const { input, leverage, selectedStrategy } = inputState;

  /* All leveraging functionality has been moved into this hook */
  const {
    // computeStEthCollateral,
    // slippage,
    // removeSlippage,

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
            <ValueInput
              // max={BigNumber.from('1000000000000000000')}
              // defaultValue={BigNumber.from('130000000000000000')}
              // onValueChange={(v) => setBalanceInput(v)}
              // decimals={18}
            />
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
