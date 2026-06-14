import { useEffect, useState } from 'react';
import useStore from '../utils/store';
import { apiClient, API_ENDPOINTS } from '../utils/axiosConfig';

export function useProducts(isResell) {
  const products = useStore(state => isResell ? state.resellProducts : state.hoolisProducts);
  const setProducts = useStore(state => isResell ? state.setResellProducts : state.setHoolisProducts);

  // Fix #3 : isLoading démarre à false si le cache est déjà rempli
  const [isLoading, setIsLoading] = useState(() => !(products?.length > 0));
  // Fix #2 : état d'erreur exposé aux composants consommateurs
  const [error, setError] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();
    const isCacheValid = products?.length > 0;

    if (!isCacheValid) {
      setIsLoading(true);
      setError(null);

      const fetchProducts = async () => {
        let retries = 3;

        const attemptFetch = async () => {
          try {
            const response = await apiClient.get(API_ENDPOINTS.products, {
              params: {
                is_resell: isResell,
                is_available: true,
              },
              signal: abortController.signal
            });

            const productsData = response.data.results || response.data;

            if (productsData?.length > 0) {
              setProducts(productsData);
            }

            setIsLoading(false);
          } catch (err) {
            // Fix #5 : AbortController suffit, pas besoin de isMountedRef
            if (err.name === 'AbortError' || err.name === 'CanceledError') {
              return;
            }

            if (retries > 0) {
              retries--;
              await new Promise(resolve => setTimeout(resolve, 1000));
              return attemptFetch();
            }

            // Fix #2 : erreur visible après épuisement des retries
            setError('Impossible de charger les produits');
            setIsLoading(false);
          }
        };

        attemptFetch();
      };

      fetchProducts();
    } else {
      setIsLoading(false);
    }

    return () => {
      abortController.abort();
    };
  }, [isResell]);

  return { products, isLoading, error };
}
