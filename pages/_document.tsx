import Document, { Html, Head, Main, NextScript } from 'next/document';
import tw from 'tailwind-styled-components';

const Body = tw.body`bg-gray-700 dark:bg-gray-700`;
// const Body = tw.body`bg-gradient-to-tr from-slate-900 via-purple-900 to-slate-900`

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link href="https://cdnjs.cloudflare.com/ajax/libs/inter-ui/3.19.3/inter.css" rel="stylesheet" />
        </Head>
        <Body>
          <Main />
          <NextScript />
          <script src="/scripts/themeScript.js" type="text/javascript" async />
        </Body>
      </Html>
    );
  }
}

export default MyDocument;
