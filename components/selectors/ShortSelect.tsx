import { FC, useState } from 'react';
import tw from 'tailwind-styled-components';

const ButtonInner = tw.div`
  h-full w-full dark:bg-gray-900/80 bg-gray-100/80 dark:text-gray-50 text-gray-900 rounded-lg
  flex p-3 gap-3 justify-center
`;

const ButtonOuter = tw.button`w-full flex p-[1px]
rounded-lg gap-3 align-middle items-center hover:opacity-80
`;

const ShortSelect = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  return (
    <div className="h-12">
        <ButtonOuter
          onClick={() => setModalOpen(true)}
          disabled={false}
          style={{
            background: `linear-gradient(135deg, #f7953380, #f3705580, #ef4e7b80, #a166ab80, #5073b880, #1098ad80, #07b39b80, #6fba8280)`,
          }}
        >
          <ButtonInner> wETH </ButtonInner>
        </ButtonOuter>
    </div>
  );
};

export default ShortSelect;