import {useEffect, useState} from 'react';

type windowSize = {width: number; height: number};
export function useWindowSize(): windowSize {
  const isClient = typeof window === 'object';

  function getSize(): windowSize {
    return {
      width: isClient ? window.innerWidth : undefined,
      height: isClient ? window.innerHeight : undefined,
    };
  }

  const [windowSize, setWindowSize] = useState(getSize);

  useEffect(() => {
    if (!isClient) {
      return;
    }

    function handleResize(): void {
      setWindowSize(getSize());
    }

    window.addEventListener('resize', handleResize);
    return (): any => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return windowSize;
}
