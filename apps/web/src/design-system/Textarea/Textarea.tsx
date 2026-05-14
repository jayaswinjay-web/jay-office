import React, { ChangeEvent } from "react";
import styles from "./Textarea.module.css";

interface TextareaProps {
  value?: string;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  name?: string;
  className?: string;
}

const Textarea: React.FC<TextareaProps> = ({ value, onChange, placeholder, disabled, rows = 3, name, className }) => {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      name={name}
      className={`${styles.textarea} ${className || ""}`}
    />
  );
};

export default Textarea;
