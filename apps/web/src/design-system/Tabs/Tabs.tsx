import { createContext, useContext, ReactNode } from "react";
import styles from "./Tabs.module.css";

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs sub-component must be used inside <Tabs>");
  return ctx;
}

export function TabsList({ children }: { children: ReactNode }) {
  return <div className={styles.tabs}>{children}</div>;
}

export function TabsTrigger({ value, children }: { value: string; children: ReactNode }) {
  const { value: activeValue, onValueChange } = useTabsContext();
  const isActive = value === activeValue;
  return (
    <button
      onClick={() => onValueChange(value)}
      className={`${styles.tab} ${isActive ? styles.active : ""}`}
    >
      {children}
      {isActive && <div className={styles.indicator} />}
    </button>
  );
}

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
}

export function Tabs({ value, onValueChange, children }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
}

export default Tabs;
