import styles from './Button.module.css'

const variants = { primary: 'primary', ghost: 'ghost', danger: 'danger', outline: 'outline' }
const sizes    = { sm: 'sm', md: 'md', lg: 'lg' }

export default function Button({
  children, variant = 'primary', size = 'md',
  loading = false, icon, fullWidth = false,
  className = '', ...props
}) {
  return (
    <button
      className={[
        styles.btn,
        styles[variants[variant] ?? 'primary'],
        styles[sizes[size] ?? 'md'],
        fullWidth && styles.full,
        loading   && styles.loading,
        className,
      ].filter(Boolean).join(' ')}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading
        ? <span className={styles.spinner} aria-hidden="true" />
        : icon && <span className={styles.icon}>{icon}</span>
      }
      {children && <span>{children}</span>}
    </button>
  )
}
