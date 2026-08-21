import 'bootstrap/dist/css/bootstrap.min.css';
import './themes.scss';
import './index.scss';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link 
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" 
          rel="stylesheet" 
        />
      </Head>
        <Component {...pageProps} />
    </>
  );
}

export default MyApp;

// global styles / logic / structure