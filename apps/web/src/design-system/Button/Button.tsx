import { type ButtonHTMLAttributes, type ReactNode } from "react"
import styles from "./Button.module.css"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: "default" | "primary" | "ghost" | "danger" | "outline"
  size?: "sm" | "md" | "lg"
  loading?: boolean
}

const variantMap: Record<string, string> = { secondary: "outline" }
const sizeMap: Record<string, string> = { small: "sm" }

function Button({
  children,
  variant = "default",
  size = "md",
  loading = false,
  className = "",
  disabled,
  ...rest
}: ButtonProps) {
  const resolvedVariant = variantMap[variant] ?? variant
  const resolvedSize = sizeMap[size] ?? size
  const cls = [
    styles.button,
    styles[resolvedVariant] || "",
    styles[resolvedSize] || "",
    loading ? styles.loading : "",
    className,
  ].filter(Boolean).join(" ")

  return (
    <button className={cls} disabled={disabled || loading} {...rest}>
      {children}
    </button>
  )
}

export default Button
