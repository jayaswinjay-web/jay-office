import { type ButtonHTMLAttributes, type InputHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from "react"

export { default as Button } from "./Button/Button"
export { default as Input } from "./Input/Input"
export { default as Textarea } from "./Textarea/Textarea"
export { default as Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./Select/Select"
export { default as Checkbox } from "./Checkbox/Checkbox"
export { default as Radio } from "./Radio/Radio"
export { default as Toggle } from "./Toggle/Toggle"
export { default as Modal } from "./Modal/Modal"
export { default as Dialog, DialogContent, DialogHeader, DialogTitle } from "./Dialog/Dialog"
export { default as Popover } from "./Popover/Popover"
export { default as Sidebar } from "./Sidebar/Sidebar"
export { default as Toolbar } from "./Toolbar/Toolbar"
export { default as Dropdown, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./Dropdown/Dropdown"
export { default as Toast } from "./Toast/Toast"
export { default as Avatar } from "./Avatar/Avatar"
export { default as Badge } from "./Badge/Badge"
export { default as Tabs, TabsList, TabsTrigger } from "./Tabs/Tabs"
export { default as DataTable } from "./DataTable/DataTable"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: "default" | "primary" | "ghost" | "danger"
  size?: "small" | "default" | "large"
  loading?: boolean
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export interface SelectProps {
  value: string
  options: Array<{ label: string; value: string }>
  placeholder?: string
  className?: string
  disabled?: boolean
}

export interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
}

export interface RadioProps {
  value: string
  selected: string
  onChange: (value: string) => void
  label: string
  disabled?: boolean
}

export interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export interface ModalProps {
  children: ReactNode
  open: boolean
  onClose: () => void
  title: string
}

export interface DialogProps {
  children: ReactNode
  open: boolean
  onClose: () => void
  title?: string
}

export interface PopoverProps {
  children: ReactNode
  trigger: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export interface SidebarProps {
  children: ReactNode
  collapsed?: boolean
}

export interface ToolbarProps {
  children: ReactNode
}

export interface DropdownProps {
  trigger: ReactNode
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export interface ToastProps {
  message: string
  type?: "info" | "success" | "error" | "warning"
  onClose: () => void
}

export interface AvatarProps {
  src?: string
  alt: string
  size?: "small" | "medium" | "large"
}

export interface BadgeProps {
  children: ReactNode
  variant?: "default" | "success" | "warning" | "error"
}

export interface TabsProps {
  tabs: Array<{ label: string; value: string }>
  activeTab: string
  onTabChange: (value: string) => void
  children: ReactNode
}

export interface DataTableProps<T> {
  data: T[]
  columns: Array<{ header: string; accessor: keyof T | ((row: T) => ReactNode) }>
  onRowClick?: (row: T) => void
}
