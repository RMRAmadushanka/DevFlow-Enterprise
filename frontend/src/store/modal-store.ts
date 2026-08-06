import { create } from "zustand";

/**
 * Global UI modal registry — open/close by id.
 * Server data never lives here; only chrome state for shared overlays.
 */

interface ModalEntry {
  open: boolean;
  payload?: unknown;
}

interface ModalState {
  modals: Record<string, ModalEntry>;
  openModal: (id: string, payload?: unknown) => void;
  closeModal: (id: string) => void;
  toggleModal: (id: string) => void;
  isOpen: (id: string) => boolean;
  getPayload: <T = unknown>(id: string) => T | undefined;
  reset: () => void;
}

export const useModalStore = create<ModalState>()((set, get) => ({
  modals: {},
  openModal: (id, payload) =>
    set((state) => ({
      modals: { ...state.modals, [id]: { open: true, payload } },
    })),
  closeModal: (id) =>
    set((state) => ({
      modals: { ...state.modals, [id]: { open: false, payload: undefined } },
    })),
  toggleModal: (id) => {
    const current = get().modals[id]?.open;
    if (current) get().closeModal(id);
    else get().openModal(id);
  },
  isOpen: (id) => Boolean(get().modals[id]?.open),
  getPayload: <T,>(id: string) => get().modals[id]?.payload as T | undefined,
  reset: () => set({ modals: {} }),
}));
