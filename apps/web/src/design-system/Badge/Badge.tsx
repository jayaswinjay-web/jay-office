import React, { ReactNode } from "react";
import styles from "./Badge.module.css";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = "default", className }) => {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${className || ""}`}>
      {children}
    </span>
  );
};

export default Badge;
