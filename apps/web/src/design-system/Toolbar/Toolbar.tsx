import React, { ReactNode } from "react";
import styles from "./Toolbar.module.css";

interface ToolbarProps {
  children: ReactNode;
  className?: string;
}

const Toolbar: React.FC<ToolbarProps> = ({ children, className }) => {
  return (
    <div className={`${styles.toolbar} ${className || ""}`}>
      {children}
    </div>
  );
};

export default Toolbar;
