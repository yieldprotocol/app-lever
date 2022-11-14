import { AppProps } from 'next/dist/shared/lib/router/router';
import '../styles/globals.css';
import dynamic from 'next/dynamic';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useColorTheme } from '../hooks/useColorTheme';
import { XMarkIcon } from '@heroicons/react/24/solid';
import LeverProvider from '../context/LeverContext';
import MarketProvider from '../context/MarketContext';
import ChartProvider from '../context/ChartContext';
import InputProvider from '../context/InputContext';

const DynamicLayout = dynamic(() => import('../components/Layout'), { ssr: false });

const MyApp = ({ Component, pageProps }: AppProps) => {
  const { theme } = useColorTheme();

  return (
    <LeverProvider>
      <MarketProvider>
        <ChartProvider>
          <InputProvider>
            <ToastContainer
              position="bottom-right"
              pauseOnHover
              closeOnClick
              toastStyle={{ background: theme === 'light' ? '#e4e4e7' : '#18181b' }}
              closeButton={<XMarkIcon height="1rem" width="1rem" color={theme === 'dark' ? '#e4e4e7' : '#18181b'} />}
            />
            <DynamicLayout>
              <Component {...pageProps} />
            </DynamicLayout>
          </InputProvider>
        </ChartProvider>
      </MarketProvider>
    </LeverProvider>
  );
};

export default MyApp;
