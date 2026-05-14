import { Folder, ChevronRight, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { Folder as FolderType } from '@jay/types'
import styles from './FolderTree.module.css'

interface FolderTreeProps {
  folders: FolderType[]
  currentFolderId: string | undefined
  onSelect: (id: string | undefined) => void
  parentId?: string | null
  depth?: number
}

export function FolderTree({
  folders,
  currentFolderId,
  onSelect,
  parentId = null,
  depth = 0,
}: FolderTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const children = folders.filter((f: FolderType) => f.parentId === parentId)

  if (children.length === 0 && depth === 0) {
    return <p className={styles.emptyText}>No folders yet</p>
  }

  return (
    <div className={styles.treeContainer}>
      {depth === 0 && (
        <button
          className={`${styles.folderButton} ${currentFolderId === undefined ? styles.folderButtonActive : ''}`}
          onClick={() => onSelect(undefined)}
        >
          <Folder size={16} />
          My Drive
        </button>
      )}
      {children.map((folder: FolderType) => {
        const hasChildren = folders.some((f: FolderType) => f.parentId === folder.id)
        const isExpanded = expandedIds.has(folder.id)
        const isSelected = currentFolderId === folder.id

        return (
          <div key={folder.id}>
            <button
              className={`${styles.folderButton} ${isSelected ? styles.folderButtonActive : ''}`}
              style={{ paddingLeft: `${depth * 16 + 12}px` }}
              onClick={() => {
                if (hasChildren) {
                  setExpandedIds((prev: Set<string>) => {
                    const next = new Set(prev)
                    if (next.has(folder.id)) next.delete(folder.id)
                    else next.add(folder.id)
                    return next
                  })
                }
                onSelect(folder.id)
              }}
            >
              {hasChildren && (
                <span className={styles.chevron}>
                  {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </span>
              )}
              <Folder size={16} className={styles.folderIcon} />
              <span className={styles.folderName}>{folder.name}</span>
            </button>
            {isExpanded && hasChildren && (
              <FolderTree
                folders={folders}
                currentFolderId={currentFolderId}
                onSelect={onSelect}
                parentId={folder.id}
                depth={depth + 1}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
