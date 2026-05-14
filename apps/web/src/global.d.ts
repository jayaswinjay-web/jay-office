declare module '*.module.css' {
  const classes: Readonly<Record<string, string>>
  export default classes
}

declare module '@/design-system' {
  export const Button: React.FC<Record<string, unknown>>
  export const Input: React.FC<Record<string, unknown>>
  export const Textarea: React.FC<Record<string, unknown>>
  export const Select: React.FC<Record<string, unknown>>
  export const SelectContent: React.FC<Record<string, unknown>>
  export const SelectItem: React.FC<Record<string, unknown>>
  export const SelectTrigger: React.FC<Record<string, unknown>>
  export const SelectValue: React.FC<Record<string, unknown>>
  export const Checkbox: React.FC<Record<string, unknown>>
  export const Radio: React.FC<Record<string, unknown>>
  export const Toggle: React.FC<Record<string, unknown>>
  export const Modal: React.FC<Record<string, unknown>>
  export const Dialog: React.FC<Record<string, unknown>>
  export const DialogContent: React.FC<Record<string, unknown>>
  export const DialogHeader: React.FC<Record<string, unknown>>
  export const DialogTitle: React.FC<Record<string, unknown>>
  export const Popover: React.FC<Record<string, unknown>>
  export const Sidebar: React.FC<Record<string, unknown>>
  export const Toolbar: React.FC<Record<string, unknown>>
  export const Dropdown: React.FC<Record<string, unknown>>
  export const DropdownMenuContent: React.FC<Record<string, unknown>>
  export const DropdownMenuItem: React.FC<Record<string, unknown>>
  export const DropdownMenuTrigger: React.FC<Record<string, unknown>>
  export const Toast: React.FC<Record<string, unknown>>
  export const Avatar: React.FC<Record<string, unknown>>
  export const Badge: React.FC<Record<string, unknown>>
  export const Tabs: React.FC<Record<string, unknown>>
  export const TabsList: React.FC<Record<string, unknown>>
  export const TabsTrigger: React.FC<Record<string, unknown>>
  export const DataTable: React.FC<Record<string, unknown>>
  export type ButtonProps = Record<string, unknown>
  export type InputProps = Record<string, unknown>
  export type TextareaProps = Record<string, unknown>
  export type SelectProps = Record<string, unknown>
  export type CheckboxProps = Record<string, unknown>
  export type RadioProps = Record<string, unknown>
  export type ToggleProps = Record<string, unknown>
  export type ModalProps = Record<string, unknown>
  export type DialogProps = Record<string, unknown>
  export type PopoverProps = Record<string, unknown>
  export type SidebarProps = Record<string, unknown>
  export type ToolbarProps = Record<string, unknown>
  export type DropdownProps = Record<string, unknown>
  export type ToastProps = Record<string, unknown>
  export type AvatarProps = Record<string, unknown>
  export type BadgeProps = Record<string, unknown>
  export type TabsProps = Record<string, unknown>
  export type DataTableProps = Record<string, unknown>
}
