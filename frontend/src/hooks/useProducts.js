import { useEffect, useRef } from 'react';
import useStore from '../utils/store';
import { apiClient, API_ENDPOINTS } from '../utils/axiosConfig';

/**
 * Hook pour gérer le fetching des produits avec gestion du cache
 * @param {boolean} isResell - true pour produits resell, false pour produits hoolis
 */
export function useProducts(isResell) {
  const products = useStore(state => state.products);
  const setProducts = useStore(state => state.setProducts);

  // Ref pour éviter setState après unmount
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    const abortController = new AbortController();

    // Vérifier si les produits en cache correspondent au type demandé
    const isCacheValid = products?.length > 0 &&
      products.every(p => p.is_resell === isResell);

    console.log(`🔍 Cache validation (is_resell: ${isResell}):`, {
      productsInCache: products?.length || 0,
      isCacheValid,
      cacheProducts: products?.slice(0, 2) // Montrer les 2 premiers
    });

    if (!isCacheValid) {
      console.log(`🌐 Fetching products from API (is_resell: ${isResell})...`);

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

            console.log(`📦 Full API Response (is_resell: ${isResell}):`, response.data);
            console.log(`📦 Response structure:`, {
              hasResults: 'results' in response.data,
              hasCount: 'count' in response.data,
              hasNext: 'next' in response.data,
              hasPrevious: 'previous' in response.data,
            });

            const productsData = response.data.results || response.data;

            console.log(`📦 Products data (is_resell: ${isResell}):`, productsData);
            console.log(`📦 Number of products returned: ${productsData?.length || 0}`);
            console.log(`📦 API query params:`, {
              is_resell: isResell,
              is_available: true
            });

            if (productsData?.length > 0) {
              console.log(`📦 First product sample:`, productsData[0]);
              console.log(`📦 Collections found:`, [...new Set(productsData.map(p => p.collection?.name))].filter(Boolean));
              console.log(`📦 Availability check:`, {
                allAvailable: productsData.every(p => p.is_available === true),
                allResell: productsData.every(p => p.is_resell === isResell)
              });
            }

            if (isMountedRef.current && productsData?.length > 0) {
              setProducts(productsData);
              console.log(`✅ Products stored in cache (is_resell: ${isResell})`);
            }
          } catch (error) {
            // Ignorer les erreurs d'abort
            if (error.name === 'AbortError' || error.name === 'CanceledError') {
              console.log('Fetch annulé');
              return;
            }

            if (retries > 0 && isMountedRef.current) {
              retries--;
              await new Promise(resolve => setTimeout(resolve, 1000));
              return attemptFetch();
            }

            console.error('Erreur lors du fetch des produits:', error);
          }
        };

        attemptFetch();
      };

      fetchProducts();
    } else {
      console.log(`✅ Produits déjà en cache (is_resell: ${isResell}):`, {
        count: products.length,
        collections: [...new Set(products.map(p => p.collection?.name))].filter(Boolean)
      });
    }

    // Cleanup
    return () => {
      isMountedRef.current = false;
      abortController.abort();
    };
  }, [isResell]); // Dépend uniquement de isResell, pas de products/setProducts (fonctions stables de Zustand)

  return products;
}
