import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Lecture synchrone du cache au démarrage du module — avant tout render.
// Zustand rehydrate de façon asynchrone ; sans ça, le premier render
// utilise toujours les valeurs par défaut et provoque un flash.
const _cache = (() => {
  try {
    const s = localStorage.getItem('hoolis-store');
    return s ? (JSON.parse(s).state ?? {}) : {};
  } catch { return {}; }
})();

// ===== SLICES =====

// Slice pour l'état UI éphémère (non persisté)
const createUISlice = (set) => ({
  bgColor: "#000000",
  label: "Maison Hoolis",
  labelColor: "#000000",
  crownVisible: true,
  buttonsVisible: true,
  isClicked: false,
  mainButtonHover: false,
  menuOpen: false,
  galleryVisible: false,
  cartVisible: false,
  articleIsClicked: false,
  articleIsHovered: false,
  selectedArticleId: null,
  mobileButtonsVisible: false,
  isMouseActive: false,
  // BOOKING DISABLED
  // isBooking: false,
  isMobile: false,
  collectionChosen: null,
  bgImageDesktop:   _cache.bgImageDesktop    ?? null,
  bgImageMobile:    _cache.bgImageMobile     ?? null,
  bgFit:            _cache.bgFit             ?? 'cover',
  bgPaddingTop:     _cache.bgPaddingTop      ?? 0,
  bgPaddingBottom:  _cache.bgPaddingBottom   ?? 0,
  bgPaddingLeft:    _cache.bgPaddingLeft     ?? 0,
  bgPaddingRight:   _cache.bgPaddingRight    ?? 0,
  siteConfigReady: !!_cache.bgImageDesktop,

  setBgColor: (color) => set({ bgColor: color }),
  setBgImageDesktop: (url) => set({ bgImageDesktop: url }),
  setBgImageMobile: (url) => set({ bgImageMobile: url }),
  setBgFit: (fit) => set({ bgFit: fit }),
  setBgPaddingTop:    (v) => set({ bgPaddingTop: v }),
  setBgPaddingBottom: (v) => set({ bgPaddingBottom: v }),
  setBgPaddingLeft:   (v) => set({ bgPaddingLeft: v }),
  setBgPaddingRight:  (v) => set({ bgPaddingRight: v }),
  setSiteConfigReady: (ready) => set({ siteConfigReady: ready }),
  setLabel: (text) => set({ label: text }),
  setLabelColor: (color) => set({ labelColor: color }),
  setCrownVisible: (visible) => set({ crownVisible: visible }),
  setButtonsVisible: (visible) => set({ buttonsVisible: visible }),
  setIsClicked: (visible) => set({ isClicked: visible }),
  setMainButtonHover: (visible) => set({ mainButtonHover: visible }),
  setMenuOpen: (visible) => set({ menuOpen: visible }),
  setGalleryVisible: (visible) => set({ galleryVisible: visible }),
  setCartVisible: (visible) => set({ cartVisible: visible }),
  setArticleIsClicked: (isClicked) => set({ articleIsClicked: isClicked }),
  setArticleIsHovered: (isHovered) => set({ articleIsHovered: isHovered }),
  setSelectedArticleId: (id) => set({ selectedArticleId: id }),
  setMobileButtonsVisible: (visible) => set({ mobileButtonsVisible: visible }),
  setIsMouseActive: (active) => set({ isMouseActive: active }),
  // BOOKING DISABLED
  // setIsBooking: (isBooking) => set({ isBooking: isBooking }),
  setIsMobile: (isMobile) => set({ isMobile: isMobile }),
  setCollectionChosen: (collection) => set({ collectionChosen: collection }),
});

// Slice pour le panier (persisté)
const createCartSlice = (set) => ({
  addToCart: [],
  setAddToCart: (callback) => set((state) => ({
    addToCart: callback(state.addToCart)
  })),
  clearCart: () => set({ addToCart: [] }),
});

// Slice pour les données (non persisté, géré par React Query idéalement)
const createDataSlice = (set) => ({
  hoolisProducts: [],
  resellProducts: [],
  watches: [],
  setHoolisProducts: (products) => set({ hoolisProducts: products }),
  setResellProducts: (products) => set({ resellProducts: products }),
  setWatches: (watches) => set({ watches }),
});

// Slice pour le paiement (non persisté)
const createPaymentSlice = (set) => ({
  paymentStatus: null,
  paymentMessage: '',
  paymentLoading: false,
  paymentProcessed: false,

  setPaymentStatus: (status) => set({ paymentStatus: status }),
  setPaymentMessage: (message) => set({ paymentMessage: message }),
  setPaymentLoading: (loading) => set({ paymentLoading: loading }),
  setPaymentProcessed: (processed) => set({ paymentProcessed: processed }),

  resetPayment: () => set({
    paymentStatus: null,
    paymentMessage: '',
    paymentLoading: false,
    paymentProcessed: false
  }),
});

// ===== STORE PRINCIPAL =====

const useStore = create(
  persist(
    (set, get) => ({
      ...createUISlice(set),
      ...createCartSlice(set),
      ...createDataSlice(set),
      ...createPaymentSlice(set),

      // Action pour réinitialiser l'état UI
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
        mainButtonHover: false,
        mobileButtonsVisible: true,
      }),
    }),
    {
      name: 'hoolis-store',
      storage: createJSONStorage(() => localStorage),
      // Persister UNIQUEMENT le panier
      partialize: (state) => ({
        addToCart: state.addToCart,
        bgImageDesktop:  state.bgImageDesktop,
        bgImageMobile:   state.bgImageMobile,
        bgFit:           state.bgFit,
        bgPaddingTop:    state.bgPaddingTop,
        bgPaddingBottom: state.bgPaddingBottom,
        bgPaddingLeft:   state.bgPaddingLeft,
        bgPaddingRight:  state.bgPaddingRight,
      }),
    }
  )
);

export default useStore;