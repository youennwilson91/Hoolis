import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Création du store pour gérer l'état de la page Landing
const useStore = create(
  persist(
    (set) => ({

  // Landing Page
  bgColor: "#000000",
  label: "Maison Hoolis",
  labelColor: "#000000",
  crownVisible: true,
  buttonsVisible: true,
  isClicked: false,
  mainButtonHover: false,
  menuOpen: false,
  
  setBgColor: (color) => set({ bgColor: color }),
  setLabel: (text) => set({ label: text }),
  setLabelColor: (color) => set({ labelColor: color }),
  setCrownVisible: (visible) => set({ crownVisible: visible }),
  setButtonsVisible: (visible) => set({ buttonsVisible: visible }),
  setIsClicked: (visible) => set({ isClicked: visible }),
  setMainButtonHover: (visible) => set({ mainButtonHover: visible }),
  setMenuOpen: (visible) => set({ menuOpen: visible }),
  // Shop Page
  galleryVisible: false,
  collectionChosen: null,
  articleIsClicked: false,
  addToCart: [],
  cartVisible: false,
  shopImages: [],
  articleIsHovered: false,
  selectedArticleId: null,
  products: [],


  setGalleryVisible: (visible) => set({ galleryVisible: visible }),
  setCollectionChosen: (collection) => set({ collectionChosen: collection }),
  setArticleIsClicked: (isClicked) => set({ articleIsClicked: isClicked }),
  setArticleIsHovered: (isHovered) => set({ articleIsHovered: isHovered }),
  setSelectedArticleId: (id) => set({ selectedArticleId: id }),
  setCartVisible: (visible) => set({ cartVisible: visible }),
  setAddToCart: (callback) => set((state) => ({ 
    addToCart: callback(state.addToCart) 
  })),
  setProducts: (products) => set({ products: products }),
  
  // Mobile Landing Page
  mobileButtonsVisible: false,
  setMobileButtonsVisible: (visible) => set({ mobileButtonsVisible: visible }),

  // FandW Page
  isMouseActive: false,
  isBooking: false,
  watches: [],

  setIsMouseActive: (active) => set({ isMouseActive: active }),
  setIsBooking: (isBooking) => set({ isBooking: isBooking }),
  setWatches: (watches) => set({ watches: watches }),

  // Mobile state
  isMobile: false,
  setIsMobile: (isMobile) => set({ isMobile: isMobile }),

  // Action pour réinitialiser l'état
  resetStore: () => set({
    bgColor: "#000000",
    label: "Maison Hoolis",
    labelColor: "#000000",
    crownVisible: true,
    buttonsVisible: true,
    isClicked: false,
    collectionChosen: null,
    articleIsClicked: null,
    articleIsHovered: false,
    selectedArticleId: null,
    galleryVisible: false,
    cartVisible: false,
    addToCart: [],
    mainButtonHover: false,

    // Mobile Landing Page
    mobileButtonsVisible: true,
  }),

  // États pour le paiement
  paymentStatus: null,
  paymentMessage: '',
  paymentLoading: false,
  paymentProcessed: false,

  // Actions pour le paiement
  setPaymentStatus: (status) => set({ paymentStatus: status }),
  setPaymentMessage: (message) => set({ paymentMessage: message }),
  setPaymentLoading: (loading) => set({ paymentLoading: loading }),
  setPaymentProcessed: (processed) => set({ paymentProcessed: processed }),
  
  // Reset du paiement
  resetPayment: () => set({ 
    paymentStatus: null, 
    paymentMessage: '', 
    paymentLoading: false, 
    paymentProcessed: false 
  }),

  // Action complète pour traiter un paiement
  processPayment: async (sessionId) => {
    set({ paymentLoading: true, paymentProcessed: true });
    
    try {
      const { apiClient } = await import('../utils/axiosConfig');
      
      console.log('=== DÉBUT VERIFY_PAYMENT GLOBAL ===');
      console.log('Vérification du paiement...', sessionId);
      
      const response = await apiClient.post('/store/verify-payment/', {
        session_id: sessionId
      });

      console.log('Résultat de la vérification:', response.data);
      console.log('Status reçu:', response.data.status);

      if (response.data.status === 'success') {
        console.log('✅ Paiement réussi - Définition du statut success');
        set({ 
          paymentStatus: 'success',
          paymentMessage: '🎉 Paiement confirmé ! Un email de confirmation a été envoyé.'
        });
      } else if (response.data.status === 'pending') {
        console.log('⏳ Paiement en attente');
        set({ 
          paymentStatus: 'pending',
          paymentMessage: '⏳ Paiement en cours de traitement...'
        });
      } else {
        console.log('❌ Paiement échoué - Status:', response.data.status);
        set({ 
          paymentStatus: 'failed',
          paymentMessage: '❌ Échec du paiement. Veuillez réessayer.'
        });
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du paiement:', error);
      set({ 
        paymentStatus: 'error',
        paymentMessage: '❌ Erreur lors de la vérification du paiement.'
      });
    } finally {
      set({ paymentLoading: false });
      console.log('=== FIN VERIFY_PAYMENT GLOBAL ===');
      
      // Nettoyer après 5 secondes
      setTimeout(() => {
        console.log('Nettoyage global du paiement');
        set({ 
          paymentStatus: null, 
          paymentMessage: '', 
          paymentLoading: false, 
          paymentProcessed: false 
        });
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 5000);
    }
  }
    }),
    {
      name: 'store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);


export default useStore;