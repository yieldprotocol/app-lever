import { FC } from 'react';
import tw from 'tailwind-styled-components';

export const Wrap = tw.div`
    w-full
    mx-2
    shadow-md 
    rounded-xl 
    dark:bg-gray-900 
    bg-gray-100
    bg-opacity-75
    dark:text-gray-50 
    dark:bg-opacity-75
    text-gray
`;

const BorderWrap: FC = ({ children }) => <Wrap>{children}</Wrap>;

export default BorderWrap;
