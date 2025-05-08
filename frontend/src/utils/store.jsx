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
  
  
  setBgColor: (color) => set({ bgColor: color }),
  setLabel: (text) => set({ label: text }),
  setLabelColor: (color) => set({ labelColor: color }),
  setCrownVisible: (visible) => set({ crownVisible: visible }),
  setButtonsVisible: (visible) => set({ buttonsVisible: visible }),
  setIsClicked: (visible) => set({ isClicked: visible }),

  // Shop Page
  galleryVisible: false,
  addToCart: [],
  cartVisible: false,
  shopImages: [],
  articleIsHovered: false,
  selectedArticleId: null,
  products: [],
  isMouseActive: false,

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
  setIsMouseActive: (active) => set({ isMouseActive: active }),
  
  // Mobile Landing Page
  mobileButtonsVisible: true,
  setMobileButtonsVisible: (visible) => set({ mobileButtonsVisible: visible }),

  // FandW Page
  isBooking: false,
  setIsBooking: (isBooking) => set({ isBooking: isBooking }),

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

    // Mobile Landing Page
    mobileButtonsVisible: true,
  }),
    }),
    {
      name: 'store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);


export default useStore;