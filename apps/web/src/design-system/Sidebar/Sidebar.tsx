import React, { ReactNode } from "react";
import styles from "./Sidebar.module.css";

interface SidebarItem {
  icon: ReactNode;
  label: string;
  active?: boolean;
  badge?: string;
  onClick: () => void;
}

interface SidebarProps {
  items: SidebarItem[];
  collapsed: boolean;
  onToggle: () => void;
  footer?: ReactNode;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ items, collapsed, onToggle, footer, className }) => {
  return (
    <div className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""} ${className || ""}`}>
      <nav className={styles.nav}>
        {items.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className={`${styles.item} ${item.active ? styles.active : ""}`}
          >
            <span className={styles.icon}>{item.icon}</span>
            {!collapsed && <span className={styles.label}>{item.label}</span>}
            {!collapsed && item.badge && <span className={styles.badge}>{item.badge}</span>}
          </button>
        ))}
      </nav>
      <div className={styles.footer}>
        {footer}
        <button className={styles.toggle} onClick={onToggle}>
          {collapsed ? "→" : "←"}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
