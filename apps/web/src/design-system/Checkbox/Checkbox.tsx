import React, { ChangeEvent } from "react";
import styles from "./Checkbox.module.css";

interface CheckboxProps {
  checked?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  disabled?: boolean;
  name?: string;
  className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, label, disabled, name, className }) => {
  return (
    <label className={`${styles.checkbox} ${className || ""}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        name={name}
        className={styles.input}
      />
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
};

export default Checkbox;
