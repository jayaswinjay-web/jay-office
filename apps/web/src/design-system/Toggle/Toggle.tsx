import React from "react";
import styles from "./Toggle.module.css";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

const Toggle: React.FC<ToggleProps> = ({ checked, onChange, disabled, label, className }) => {
  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <label className={`${styles.toggle} ${className || ""}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleClick}
        className={styles.button}
      />
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
};

export default Toggle;
