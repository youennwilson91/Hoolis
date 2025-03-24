import { create } from 'zustand';

// Création du store pour gérer l'état de la page Landing
const useStore = create((set) => ({

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

  setGalleryVisible: (visible) => set({ galleryVisible: visible }),

  // Action pour réinitialiser l'état
  resetStore: () => set({
    bgColor: "#000000",
    label: "Maison Hoolis",
    labelColor: "#000000",
    crownVisible: true,
    buttonsVisible: true,
    isClicked: false,
  }),
}));

export default useStore;