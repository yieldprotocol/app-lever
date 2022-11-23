import { FC } from 'react';
import Main from '../components/Main';
import Footer from './Footer';
import Navigation from './Navigation';

const Layout: FC = ({ children }) => (
  <>
    <Navigation />
    <Main>{children}</Main>
    <Footer />
  </>
);

export default Layout;
