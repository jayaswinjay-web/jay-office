import { type InputHTMLAttributes, type ReactNode, forwardRef } from "react"
import styles from "./Input.module.css"

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string
  error?: string
  icon?: ReactNode
  wrapperClassName?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, wrapperClassName, ...rest }, ref) => {
    return (
      <div className={`${styles.wrapper} ${wrapperClassName || ""}`}>
        {label && <label className={styles.label}>{label}</label>}
        <div className={`${styles.container} ${error ? styles.hasError : ""}`}>
          {icon && <span className={styles.icon}>{icon}</span>}
          <input
            ref={ref}
            className={`${styles.input} ${icon ? styles.hasIcon : ""} ${className || ""}`}
            {...rest}
          />
        </div>
        {error && <span className={styles.error}>{error}</span>}
      </div>
    )
  }
)

Input.displayName = "Input"

export default Input
