import React, { ChangeEvent } from "react";
import styles from "./Radio.module.css";

interface RadioProps {
  checked?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  disabled?: boolean;
  name?: string;
  value?: string;
  className?: string;
}

const Radio: React.FC<RadioProps> = ({ checked, onChange, label, disabled, name, value, className }) => {
  return (
    <label className={`${styles.radio} ${className || ""}`}>
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        name={name}
        value={value}
        className={styles.input}
      />
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
};

export default Radio;
