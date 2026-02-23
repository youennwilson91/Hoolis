import { useEffect, useRef, useState } from 'react';
import useStore from '../utils/store';
import { apiClient, API_ENDPOINTS } from '../utils/axiosConfig';

/**
 * Hook pour gérer le fetching des produits avec gestion du cache
 * @param {boolean} isResell - true pour produits resell, false pour produits hoolis
 * @returns {{ products: Array, isLoading: boolean }}
 */
export function useProducts(isResell) {
  // Utiliser le cache approprié selon isResell
  const products = useStore(state => isResell ? state.resellProducts : state.hoolisProducts);
  const setProducts = useStore(state => isResell ? state.setResellProducts : state.setHoolisProducts);

  // État de chargement local - true par défaut
  const [isLoading, setIsLoading] = useState(true);

  // Ref pour éviter setState après unmount
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    const abortController = new AbortController();

    // Vérifier si les produits en cache correspondent au type demandé
    const isCacheValid = products?.length > 0;

    if (import.meta.env.DEV) {
      console.log(`🔍 Cache validation (is_resell: ${isResell}):`, {
        cacheType: isResell ? 'resellProducts' : 'hoolisProducts',
        productsInCache: products?.length || 0,
        isCacheValid
      });
    }

    if (!isCacheValid) {
      if (import.meta.env.DEV) {
        console.log(`🌐 Fetching products from API (is_resell: ${isResell})...`);
      }
      setIsLoading(true);

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

            if (import.meta.env.DEV) {
              console.log(`📦 Full API Response (is_resell: ${isResell}):`, response.data);
              console.log(`📦 Response structure:`, {
                hasResults: 'results' in response.data,
                hasCount: 'count' in response.data,
                hasNext: 'next' in response.data,
                hasPrevious: 'previous' in response.data,
              });
            }

            const productsData = response.data.results || response.data;

            if (import.meta.env.DEV) {
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
                  allAvailable: productsData.every(p => p.is_available === true)
                });
              }
            }

            if (isMountedRef.current && productsData?.length > 0) {
              setProducts(productsData);
              if (import.meta.env.DEV) {
                console.log(`✅ Products stored in cache (is_resell: ${isResell})`);
              }
            }

            if (isMountedRef.current) {
              setIsLoading(false);
            }
          } catch (error) {
            // Ignorer les erreurs d'abort
            if (error.name === 'AbortError' || error.name === 'CanceledError') {
              if (import.meta.env.DEV) {
                console.log('Fetch annulé');
              }
              if (isMountedRef.current) {
                setIsLoading(false);
              }
              return;
            }

            if (retries > 0 && isMountedRef.current) {
              retries--;
              await new Promise(resolve => setTimeout(resolve, 1000));
              return attemptFetch();
            }

            if (import.meta.env.DEV) {
              console.error('Erreur lors du fetch des produits:', error);
            }
            if (isMountedRef.current) {
              setIsLoading(false);
            }
          }
        };

        attemptFetch();
      };

      fetchProducts();
    } else {
      if (import.meta.env.DEV) {
        console.log(`✅ Produits déjà en cache (${isResell ? 'resellProducts' : 'hoolisProducts'}):`, {
          count: products.length,
          collections: [...new Set(products.map(p => p.collection?.name))].filter(Boolean)
        });
      }
      // Cache valide, pas besoin de loader
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }

    // Cleanup
    return () => {
      isMountedRef.current = false;
      abortController.abort();
    };
  }, [isResell]); // Dépend uniquement de isResell, pas de products/setProducts (fonctions stables de Zustand)

  return { products, isLoading };
}
