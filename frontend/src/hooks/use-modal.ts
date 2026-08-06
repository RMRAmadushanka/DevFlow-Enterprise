"use client";

import { useModalStore } from "@/store/modal-store";

/**
 * Convenience API around the global modal store for a single modal id.
 */
export function useModal<TPayload = unknown>(id: string) {
  const open = useModalStore((s) => Boolean(s.modals[id]?.open));
  const payload = useModalStore((s) => s.modals[id]?.payload) as TPayload | undefined;
  const openModal = useModalStore((s) => s.openModal);
  const closeModal = useModalStore((s) => s.closeModal);
  const toggleModal = useModalStore((s) => s.toggleModal);

  return {
    open,
    payload,
    openModal: (nextPayload?: TPayload) => openModal(id, nextPayload),
    closeModal: () => closeModal(id),
    toggleModal: () => toggleModal(id),
    onOpenChange: (next: boolean) => {
      if (next) openModal(id);
      else closeModal(id);
    },
  };
}
