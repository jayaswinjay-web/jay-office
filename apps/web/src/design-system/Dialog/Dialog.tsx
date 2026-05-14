import { createContext, useContext, useEffect, ReactNode } from "react";
import styles from "./Dialog.module.css";

interface DialogContextType {
  open: boolean;
  onClose: () => void;
}

const DialogContext = createContext<DialogContextType | null>(null);

function useDialogContext() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("Dialog sub-component must be used inside <Dialog>");
  return ctx;
}

export function DialogContent({ children, className }: { children: ReactNode; className?: string }) {
  const { open, onClose } = useDialogContext();
  if (!open) return null;
  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`${styles.dialog} ${className || ""}`}>{children}</div>
    </div>
  );
}

export function DialogHeader({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function DialogTitle({ children }: { children: ReactNode }) {
  return <h2 className={styles.title}>{children}</h2>;
}

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  return (
    <DialogContext.Provider value={{ open, onClose: () => onOpenChange(false) }}>
      {children}
    </DialogContext.Provider>
  );
}

export default Dialog;
