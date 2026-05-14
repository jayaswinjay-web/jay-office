import { useState } from "react"
import { ChevronRight, ChevronDown, Plus, FileText } from "lucide-react"
import type { Note } from "./notes.service"
import styles from './PageTree.module.css'

interface PageTreeProps {
  pages: Note[]
  activePageId?: string
  onSelect: (id: string) => void
  onCreatePage: (parentId?: string) => void
  onRename: (id: string, newTitle: string) => void
  onDelete: (id: string) => void
}

export function PageTree({ pages, activePageId, onSelect, onCreatePage, onRename, onDelete }: PageTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; pageId: string } | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next
    })
  }

  const buildTree = (parentId: string | null): Note[] => {
    return pages
      .filter((p) => p.parentId === parentId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }

  const renderPage = (page: Note, depth = 0): React.ReactNode => {
    const children = buildTree(page.id)
    const isExpanded = expandedIds.has(page.id)
    const hasChildren = children.length > 0

    return (
      <div key={page.id}>
        <div
          className={`${styles.pageItem} ${activePageId === page.id ? styles.pageItemActive : ''}`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => onSelect(page.id)}
          onContextMenu={(e) => {
            e.preventDefault()
            setContextMenu({ x: e.clientX, y: e.clientY, pageId: page.id })
          }}
        >
          {hasChildren && (
            <button
              onClick={(e) => { e.stopPropagation(); toggleExpand(page.id) }}
              className={styles.expandBtn}
            >
              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>
          )}
          {!hasChildren && <span className={styles.spacer} />}
          <FileText className={styles.pageIcon} />
          {renamingId === page.id ? (
            <input
              autoFocus
              defaultValue={page.title}
              onBlur={(e) => { setRenamingId(null); onRename(page.id, e.target.value) }}
              onKeyDown={(e) => {
                if (e.key === "Enter") { setRenamingId(null); onRename(page.id, (e.target as HTMLInputElement).value) }
              }}
              className={styles.editInput}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className={styles.pageTitle}>{page.title}</span>
          )}
          <button
            className={styles.pageActions}
            onClick={(e) => { e.stopPropagation(); onCreatePage(page.id) }}
          >
            <Plus size={12} />
          </button>
        </div>
        {isExpanded && children.map((child) => renderPage(child, depth + 1))}
      </div>
    )
  }

  return (
    <div className={styles.pageTree}>
      <div className={styles.pageTreeHeader}>
        <span className={styles.pageTreeTitle}>Pages</span>
        <button onClick={() => onCreatePage()} className={styles.addPageBtn}>
          <Plus size={16} />
        </button>
      </div>
      <div className={styles.pageTreeList}>
        {buildTree(null).map((page) => renderPage(page))}
      </div>

      {contextMenu && (
        <>
          <div className={styles.contextOverlay} onClick={() => setContextMenu(null)} />
          <div
            className={styles.contextMenu}
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              className={styles.contextMenuItem}
              onClick={() => { setRenamingId(contextMenu.pageId); setContextMenu(null) }}
            >
              Rename
            </button>
            <button
              className={styles.contextMenuItem}
              onClick={() => { onCreatePage(contextMenu.pageId); setContextMenu(null) }}
            >
              New subpage
            </button>
            <button
              className={`${styles.contextMenuItem} ${styles.contextMenuItemDanger}`}
              onClick={() => { onDelete(contextMenu.pageId); setContextMenu(null) }}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  )
}
