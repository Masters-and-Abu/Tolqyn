import { useEffect } from 'react';

import Main from '../components/Main';

declare global {
  interface Window {
    AOS: any;
  }
}

export default function Index() {
  useEffect(() => {
    window.AOS.init({
      duration: 2000,
      disable: 'mobile',
    });
  });

  return (
    <>
      <Main />
    </>
  );
}
