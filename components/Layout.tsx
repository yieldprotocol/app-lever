import { FC } from 'react';
import Main from '../components/Main';
import Navigation from './Navigation';
import TenderlyView from './testing/TenderlyView';

const Layout: FC = ({ children }) => (
  <>
    <Navigation />
    <Main>
      {children}
    </Main>
  </>
);

export default Layout;
