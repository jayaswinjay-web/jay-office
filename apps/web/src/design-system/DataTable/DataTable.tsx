import React, { useState, useMemo, ReactNode } from "react";
import styles from "./DataTable.module.css";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

interface Column<T = Record<string, ReactNode>> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T = Record<string, ReactNode>> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  className?: string;
}

const DataTable: React.FC<DataTableProps> = ({ columns, data, onRowClick, className }) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;
    const { key, direction } = sortConfig;
     return [...data].sort((a, b) => {
       const aVal = a[key] ?? '';
       const bVal = b[key] ?? '';
       if (aVal < bVal) return direction === "asc" ? -1 : 1;
       if (aVal > bVal) return direction === "asc" ? 1 : -1;
       return 0;
     });
  }, [data, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return prev.direction === "asc" ? { key, direction: "desc" } : null;
      }
      return { key, direction: "asc" };
    });
  };

  const getSortIcon = (column: Column) => {
    if (!column.sortable) return null;
    if (sortConfig?.key !== column.key) return <ChevronsUpDown size={16} />;
    return sortConfig.direction === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  return (
    <table className={`${styles.table} ${className || ""}`}>
      <thead className={styles.thead}>
        <tr>
          {columns.map((column) => (
            <th
              key={column.key}
              className={`${styles.th} ${column.sortable ? styles.sortable : ""}`}
              onClick={() => column.sortable && handleSort(column.key)}
            >
              <span className={styles.headerContent}>
                {column.header}
                {getSortIcon(column)}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody className={styles.tbody}>
        {sortedData.map((row, index) => (
          <tr
            key={index}
            className={`${styles.tr} ${index % 2 === 0 ? styles.even : styles.odd} ${onRowClick ? styles.clickable : ""}`}
            onClick={() => onRowClick?.(row)}
          >
            {columns.map((column) => (
              <td key={column.key} className={styles.td}>
                {column.render ? column.render(row) : row[column.key as keyof typeof row]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DataTable;
