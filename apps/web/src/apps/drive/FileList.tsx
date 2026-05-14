import {
  Folder as FolderIcon,
  Star,
  Trash2,
  MoreVertical,
  Share2,
  Upload,
} from 'lucide-react'
import { Button, DataTable, Dropdown, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/design-system'
import type { ColumnDef } from '@tanstack/react-table'
import type { File as FileType, Folder } from '@jay/types'
import styles from './FileList.module.css'

interface FileListProps {
  files: FileType[]
  folders: Folder[]
  onFolderClick: (id: string) => void
  onDelete: (id: string) => void
  onRestore: (id: string) => void
  onToggleStar: (id: string, starred: boolean) => void
  onShare: (id: string) => void
  getFileIcon: (mimeType: string) => React.ComponentType<{ className?: string }>
}

interface DriveItem {
  id: string
  name: string
  type: 'folder' | 'file'
  mimeType?: string
  size?: number
  updatedAt: string
  starred: boolean
  trashed: boolean
  folder?: Folder
  file?: FileType
}

export function FileList({
  files,
  folders,
  onFolderClick,
  onDelete,
  onRestore,
  onToggleStar,
  onShare,
  getFileIcon,
}: FileListProps) {
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const items: DriveItem[] = [
    ...folders.map((f: Folder) => ({
      id: f.id,
      name: f.name,
      type: 'folder' as const,
      updatedAt: f.updatedAt as unknown as string,
      starred: false,
      trashed: false,
      folder: f,
    })),
    ...files.map((f: FileType) => ({
      id: f.id,
      name: f.name,
      type: 'file' as const,
      mimeType: f.mimeType,
      size: f.size,
      updatedAt: f.updatedAt as unknown as string,
      starred: f.starred,
      trashed: f.trashed,
      file: f,
    })),
  ]

  const columns: ColumnDef<DriveItem>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const item = row.original
        if (item.type === 'folder') {
          return (
            <Button
              variant="ghost"
              className={styles.folderButton}
              onClick={() => onFolderClick(item.id)}
            >
              <FolderIcon className={styles.folderIcon} />
              {item.name}
            </Button>
          )
        }
        const Icon = getFileIcon(item.mimeType ?? '')
        return (
          <div className={styles.nameCell}>
            <Icon className={styles.fileIcon} />
            {item.name}
          </div>
        )
      },
    },
    {
      accessorKey: 'size',
      header: 'Size',
      cell: ({ row }) => {
        const item = row.original
        if (item.type === 'folder') return '-'
        return item.size ? formatSize(item.size) : '-'
      },
    },
    {
      accessorKey: 'updatedAt',
      header: 'Modified',
      cell: ({ row }) => new Date(row.original.updatedAt).toLocaleDateString(),
    },
    {
      id: 'starred',
      header: '',
      cell: ({ row }) => {
        const item = row.original
        if (item.type === 'folder') return null
        return (
          <button className={styles.starButton} onClick={() => onToggleStar(item.id, item.starred)}>
            <Star className={`${styles.starIcon} ${item.starred ? styles.starIconFilled : ''}`} />
          </button>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const item = row.original
        return (
          <Dropdown>
            <DropdownMenuTrigger asChild>
              <button className={styles.menuButton}>
                <MoreVertical size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {item.type === 'file' && (
                <DropdownMenuItem onClick={() => onShare(item.id)}>
                  <Share2 size={16} style={{ marginRight: '0.5rem' }} />
                  Share
                </DropdownMenuItem>
              )}
              {item.trashed ? (
                <>
                  <DropdownMenuItem onClick={() => onRestore(item.id)}>
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
                  onClick={() => onDelete(item.id)}
                  className={styles.destructiveItem}
                >
                  <Trash2 size={16} style={{ marginRight: '0.5rem' }} />
                  Move to Trash
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </Dropdown>
        )
      },
    },
  ]

  return <DataTable columns={columns} data={items} />
}
