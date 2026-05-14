import styles from './Outline.module.css'

interface OutlineItem {
  level: number
  text: string
  pos: number
}

interface OutlineProps {
  items: OutlineItem[]
  onItemClick: (pos: number) => void
}

export function Outline({ items, onItemClick }: OutlineProps) {
  if (items.length === 0) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>Outline</h3>
        <p className={styles.emptyText}>No headings yet</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Outline</h3>
      <ul className={styles.list}>
        {items.map((item, index) => (
          <li
            key={`${item.pos}-${index}`}
            className={styles.item}
            style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
            onClick={() => onItemClick(item.pos)}
          >
            <span className={styles.itemText}>{item.text || `Heading ${item.level}`}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
