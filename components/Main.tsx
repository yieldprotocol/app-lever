import { FC } from 'react';
import tw from 'tailwind-styled-components';

const Container = tw.div<any>`m-20 text-center align-middle items-center min-h-[900px]`;

const Main: FC = ({ children }) => { return <Container>{children}</Container> };

export default Main;
