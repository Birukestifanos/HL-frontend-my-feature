import { useState, useCallback } from "react";

type ModalType = 
  | "beneficiary" 
  | "news" 
  | "emergency" 
  | "contact" 
  | "transparency" 
  | "admin"
  | "deleteConfirm"
  | null;

interface UseModalStateReturn {
  activeModal: ModalType;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  isAnyModalOpen: boolean;
}

export function useModalState(): UseModalStateReturn {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const openModal = useCallback((modal: ModalType) => {
    setActiveModal(modal);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  const isAnyModalOpen = activeModal !== null;

  return {
    activeModal,
    openModal,
    closeModal,
    isAnyModalOpen,
  };
}

interface UseCRUDModalStateReturn<T> {
  isOpen: boolean;
  mode: "create" | "edit" | "delete";
  selectedItem: T | null;
  openCreate: () => void;
  openEdit: (item: T) => void;
  openDelete: (item: T) => void;
  close: () => void;
}

export function useCRUDModalState<T>(): UseCRUDModalStateReturn<T> {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit" | "delete">("create");
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  const openCreate = useCallback(() => {
    setMode("create");
    setSelectedItem(null);
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((item: T) => {
    setMode("edit");
    setSelectedItem(item);
    setIsOpen(true);
  }, []);

  const openDelete = useCallback((item: T) => {
    setMode("delete");
    setSelectedItem(item);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setSelectedItem(null);
  }, []);

  return {
    isOpen,
    mode,
    selectedItem,
    openCreate,
    openEdit,
    openDelete,
    close,
  };
}