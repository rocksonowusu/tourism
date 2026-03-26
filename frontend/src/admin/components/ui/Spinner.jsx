import styles from './Spinner.module.css'

export default function Spinner({ size = 'md', centered = false }) {
  const el = <span className={[styles.spinner, styles[size]].join(' ')} aria-label="Loading" />
  return centered ? <div className={styles.center}>{el}</div> : el
}
