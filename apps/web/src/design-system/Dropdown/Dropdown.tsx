import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";
import styles from "./Dropdown.module.css";

interface DropdownContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentRef: React.RefObject<HTMLDivElement>;
}

const DropdownContext = createContext<DropdownContextType | null>(null);

function useDropdownContext() {
  const ctx = useContext(DropdownContext);
  if (!ctx) throw new Error("Dropdown sub-component must be used inside <Dropdown>");
  return ctx;
}

export function DropdownMenuTrigger({ children, asChild }: { children: ReactNode; asChild?: boolean }) {
  const { setOpen } = useDropdownContext();
  if (asChild) {
    return React.cloneElement(React.Children.only(children) as React.ReactElement, {
      onClick: (e: React.MouseEvent) => {
        (children as React.ReactElement).props.onClick?.(e);
        setOpen(true);
      },
    });
  }
  return <button onClick={() => setOpen(true)}>{children}</button>;
}

export function DropdownMenuContent({ children, align }: { children: ReactNode; align?: "start" | "end" }) {
  const { open, setOpen, contentRef } = useDropdownContext();
  return open ? (
      <div
        ref={contentRef as React.Ref<HTMLDivElement>}
        className={styles.dropdown}
      style={{ float: align === "end" ? "right" : "left" }}
      onClick={() => setOpen(false)}
    >
      {children}
    </div>
  ) : null;
}

export function DropdownMenuItem({ children, onClick, className }: { children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button className={`${styles.item} ${className || ""}`} onClick={onClick}>
      {children}
    </button>
  );
}

interface DropdownProps {
  children: ReactNode;
}

export function Dropdown({ children }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <DropdownContext.Provider value={{ open, setOpen, contentRef: dropdownRef }}>
      <div className={styles.container}>{children}</div>
    </DropdownContext.Provider>
  );
}

export default Dropdown;
