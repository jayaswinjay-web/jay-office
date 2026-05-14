import { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";
import styles from "./Select.module.css";

interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = createContext<SelectContextType | null>(null);

function useSelectContext() {
  const ctx = useContext(SelectContext);
  if (!ctx) throw new Error("Select sub-component must be used inside <Select>");
  return ctx;
}

export function SelectTrigger({ children, className }: { children?: ReactNode; className?: string }) {
  const { setOpen } = useSelectContext();
  return (
    <div
      className={`${styles.select} ${className || ""}`}
      onClick={() => setOpen(true)}
      role="combobox"
      tabIndex={0}
    >
      {children}
    </div>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = useSelectContext();
  return <span>{value || placeholder || ""}</span>;
}

export function SelectContent({ children }: { children: ReactNode }) {
  const { open, setOpen } = useSelectContext();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
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
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div ref={ref} className={styles.select} style={{ position: "absolute", zIndex: 100, cursor: "pointer" }}>
      {children}
    </div>
  );
}

export function SelectItem({ value, children }: { value: string; children: ReactNode }) {
  const { onValueChange, setOpen, value: activeValue } = useSelectContext();
  const isActive = value === activeValue;
  return (
    <div
      onClick={() => {
        onValueChange(value);
        setOpen(false);
      }}
      style={{ padding: "4px 8px", fontWeight: isActive ? "bold" : "normal" }}
    >
      {children}
    </div>
  );
}

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children?: ReactNode;
  options?: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function Select({ value, onValueChange, children, options: propOptions, placeholder, className, disabled }: SelectProps) {
  const [open, setOpen] = useState(false);

  if (!children && propOptions) {
    return (
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        disabled={disabled}
        className={`${styles.select} ${className || ""}`}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {propOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    );
  }

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div style={{ position: "relative", display: "inline-block" }}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export default Select;
