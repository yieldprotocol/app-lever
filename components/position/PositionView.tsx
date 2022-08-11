import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';

const Inner = tw.div`m-4 text-center`;
const Grid = tw.div`grid my-5 auto-rows-auto gap-2`;
const TopRow = tw.div`flex justify-between align-middle text-center items-center`;
const ClearButton = tw.button`text-sm`;

const PositionView = () => {
  return (
    <div >
        Positions go here.
    </div>
  );
};

export default PositionView;