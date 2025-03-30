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

  setGalleryVisible: (visible) => set({ galleryVisible: visible }),
  setArticleGalleryChosen: (article) => set({ articleGalleryChosen: article }),
  setArticleIsClicked: (isClicked) => set({ articleIsClicked: isClicked }),
  setCartVisible: (visible) => set({ cartVisible: visible }),
  setAddToCart: (callback) => set((state) => ({ 
    addToCart: callback(state.addToCart) 
  })),

  // Action pour réinitialiser l'état
  resetStore: () => set({
    bgColor: "#000000",
    label: "Maison Hoolis",
    labelColor: "#000000",
    crownVisible: true,
    buttonsVisible: true,
    isClicked: false,
    articleGalleryChosen: null,
    articleIsClicked: null,
    galleryVisible: false,
    cartVisible: false,
    addToCart: [],
  }),
    }),
    {
      name: 'store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useStore;