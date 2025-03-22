import { create } from 'zustand';

// Création du store pour gérer l'état de la page Landing
const useStore = create((set) => ({
  // État initial
  bgColor: "#000000",
  label: "Maison Hoolis",
  labelColor: "#000000",
  crownVisible: true,
  buttonsVisible: true,
  
  // Actions pour modifier l'état
  setBgColor: (color) => set({ bgColor: color }),
  setLabel: (text) => set({ label: text }),
  setLabelColor: (color) => set({ labelColor: color }),
  setCrownVisible: (visible) => set({ crownVisible: visible }),
  setButtonsVisible: (visible) => set({ buttonsVisible: visible }),

  // Action pour réinitialiser l'état
  resetStore: () => set({
    bgColor: "#000000",
    label: "Maison Hoolis",
    labelColor: "#000000",
    crownVisible: true,
    buttonsVisible: true,
  }),
}));

export default useStore;