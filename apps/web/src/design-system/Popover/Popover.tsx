import React, { useEffect, useRef, ReactNode } from "react";
import styles from "./Popover.module.css";

interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placement?: "bottom-start" | "bottom" | "bottom-end";
}

const Popover: React.FC<PopoverProps> = ({ trigger, children, open, onOpenChange, placement = "bottom" }) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        onOpenChange(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  return (
    <div className={styles.container}>
      <div ref={triggerRef} onClick={() => onOpenChange(!open)}>
        {trigger}
      </div>
      {open && (
        <div
          ref={popoverRef}
          className={`${styles.popover} ${styles[placement]}`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default Popover;
