import 'bootstrap/dist/css/bootstrap.min.css';
import './themes.scss';
import './index.scss';
import Head from 'next/head';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // * reload once on first load to make sure everything works
    if (typeof window !== 'undefined') {
      const hasLoaded = sessionStorage.getItem('app_loaded');
      
      if (!hasLoaded) {
        sessionStorage.setItem('app_loaded', 'true');
        window.location.reload();
      }
    }
  }, []);
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