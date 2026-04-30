import { useEffect, useState } from 'react';

export function useAssetPresence(url) {
  const [isAvailable, setIsAvailable] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const checkAsset = async () => {
      try {
        let response = await fetch(url, { method: 'HEAD' }).catch(() => null);

        if (!response?.ok) {
          response = await fetch(url, { method: 'GET' });
        }

        if (isMounted) {
          setIsAvailable(Boolean(response?.ok));
        }
      } catch (error) {
        if (isMounted) {
          setIsAvailable(false);
        }
      }
    };

    checkAsset();

    return () => {
      isMounted = false;
    };
  }, [url]);

  return isAvailable;
}
