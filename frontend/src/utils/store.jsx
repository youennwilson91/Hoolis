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
  
  // API Configuration
  host_address: "localhost",
  port: "8000",
  
  setBgColor: (color) => set({ bgColor: color }),
  setLabel: (text) => set({ label: text }),
  setLabelColor: (color) => set({ labelColor: color }),
  setCrownVisible: (visible) => set({ crownVisible: visible }),
  setButtonsVisible: (visible) => set({ buttonsVisible: visible }),
  setIsClicked: (visible) => set({ isClicked: visible }),
  setHostAddress: (address) => set({ host_address: address }),
  setPort: (port) => set({ port: port }),

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
    
    // API Configuration
    host_address: "localhost",
    port: "8000",

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