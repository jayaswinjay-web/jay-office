import { HardDrive } from 'lucide-react'
import styles from './StorageQuota.module.css'

interface StorageQuotaProps {
  className?: string
  used?: number
  total?: number
}

export function StorageQuota({
  className,
  used = 2.4 * 1024 * 1024 * 1024,
  total = 15 * 1024 * 1024 * 1024,
}: StorageQuotaProps) {
  const percentage = Math.min((used / total) * 100, 100)

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  return (
    <div className={`${styles.quotaCard} ${className ?? ''}`}>
      <div className={styles.quotaHeader}>
        <HardDrive className={styles.quotaIcon} />
        <span className={styles.quotaLabel}>Storage</span>
      </div>
      <div className={styles.progressWrapper}>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${percentage}%` }} />
        </div>
      </div>
      <div className={styles.quotaDetails}>
        <span>{formatSize(used)} used</span>
        <span>{formatSize(total)} total</span>
      </div>
      <p className={styles.quotaNote}>
        {percentage.toFixed(1)}% of {formatSize(total)} used
      </p>
    </div>
  )
}
