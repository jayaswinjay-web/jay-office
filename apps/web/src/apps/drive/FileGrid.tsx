import {
  Folder as FolderIcon,
  Star,
  Trash2,
  Upload,
  MoreVertical,
  Share2,
} from 'lucide-react'
import { Button, Dropdown, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/design-system'
import type { File as FileType, Folder } from '@jay/types'
import styles from './FileGrid.module.css'

interface FileGridProps {
  files: FileType[]
  folders: Folder[]
  onFolderClick: (id: string) => void
  onDelete: (id: string) => void
  onRestore: (id: string) => void
  onToggleStar: (id: string, starred: boolean) => void
  onShare: (id: string) => void
  getFileIcon: (mimeType: string) => React.ComponentType<{ className?: string }>
}

export function FileGrid({
  files,
  folders,
  onFolderClick,
  onDelete,
  onRestore,
  onToggleStar,
  onShare,
  getFileIcon,
}: FileGridProps) {
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className={styles.grid}>
      {folders.map((folder: Folder) => (
        <div
          key={folder.id}
          className={styles.folderCard}
          onClick={() => onFolderClick(folder.id)}
        >
          <div className={styles.folderContent}>
            <FolderIcon className={styles.folderIcon} />
            <div className={styles.folderInfo}>
              <p className={styles.folderName}>{folder.name}</p>
              <p className={styles.folderType}>Folder</p>
            </div>
          </div>
        </div>
      ))}

      {files.map((file: FileType) => {
        const Icon = getFileIcon(file.mimeType)
        return (
          <div key={file.id} className={styles.fileCard}>
            <div className={styles.fileHeader}>
              <div className={styles.fileInfo}>
                <Icon className={styles.fileIcon} />
                <div className={styles.fileDetails}>
                  <p className={styles.fileName}>{file.name}</p>
                  <p className={styles.fileMeta}>
                    {formatSize(file.size)} • {new Date(file.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Dropdown>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className={styles.iconButton}>
                    <MoreVertical size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onToggleStar(file.id, file.starred)}>
                    <Star
                      className={`${styles.starIcon} ${file.starred ? styles.starIconFilled : ''}`}
                    />
                    {file.starred ? 'Unstar' : 'Star'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onShare(file.id)}>
                    <Share2 size={16} style={{ marginRight: '0.5rem' }} />
                    Share
                  </DropdownMenuItem>
                  {file.trashed ? (
                    <>
                      <DropdownMenuItem onClick={() => onRestore(file.id)}>
                        <Upload size={16} style={{ marginRight: '0.5rem' }} />
                        Restore
                      </DropdownMenuItem>
                      <DropdownMenuItem className={styles.destructiveItem}>
                        <Trash2 size={16} style={{ marginRight: '0.5rem' }} />
                        Delete Permanently
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => onDelete(file.id)}
                      className={styles.destructiveItem}
                    >
                      <Trash2 size={16} style={{ marginRight: '0.5rem' }} />
                      Move to Trash
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </Dropdown>
            </div>
          </div>
        )
      })}

      {folders.length === 0 && files.length === 0 && (
        <div className={styles.emptyState}>
          <FolderIcon size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>No files or folders yet</p>
        </div>
      )}
    </div>
  )
}
