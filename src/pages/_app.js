import 'bootstrap/dist/css/bootstrap.min.css';
import './themes.scss';
import './index.scss';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import * as db from '@/services/db.js';

function MyApp({ Component, pageProps }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await db.initDB();
      console.log('db init done');
      
      await db.resetTasks();
      console.log('checked task reset');
      
      setReady(true);
    };
    
    init();
  }, []);

  if (!ready) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#0A0A0A',
        color: 'white',
        fontFamily: 'DM Sans, sans-serif'
      }}>
        <div>
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

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