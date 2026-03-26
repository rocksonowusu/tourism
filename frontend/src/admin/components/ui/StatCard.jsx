import styles from './StatCard.module.css'

/**
 * StatCard
 * @param {string}    label      — metric label
 * @param {number}    value      — metric value
 * @param {ReactNode} icon       — SVG icon element (e.g. <IconCalendar />)
 * @param {{ up: bool, label: string }} trend — optional trend indicator
 * @param {'gold'|'green'|'blue'|'red'} color
 * @param {boolean}   loading
 */
export default function StatCard({ label, value, icon, trend, color = 'gold', loading = false }) {
  return (
    <div className={[styles.card, styles[color]].join(' ')}>
      <div className={styles.top}>
        <div className={styles.meta}>
          <span className={styles.label}>{label}</span>
          {loading
            ? <span className={styles.valueSkeleton} />
            : <span className={styles.value}>{value ?? '—'}</span>
          }
        </div>
        {icon && <div className={styles.iconWrap}>{icon}</div>}
      </div>
      {trend && (
        <div className={styles.trend}>
          <span className={trend.up ? styles.trendUp : styles.trendDown}>
            {trend.up ? '↑' : '↓'} {trend.label}
          </span>
        </div>
      )}
    </div>
  )
}
