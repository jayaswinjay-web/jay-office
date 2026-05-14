import { useState, useEffect, useCallback } from 'react'
import {
  Folder as FolderIcon,
  Grid,
  List,
  Upload,
  Image,
  FileText,
  File as FileIcon,
} from 'lucide-react'
import { Button, Input, Tabs, TabsList, TabsTrigger } from '@/design-system'
import { FolderTree } from './FolderTree'
import { FileGrid } from './FileGrid'
import { FileList } from './FileList'
import { UploadDialog } from './UploadDialog'
import { ShareDialog } from './ShareDialog'
import { StorageQuota } from './StorageQuota'
import { listFiles, listFolders, deleteFile, restoreFile, updateFile } from './drive.service'
import type { File, Folder } from '@jay/types'
import styles from './DrivePage.module.css'

type ViewMode = 'grid' | 'list'

export function DrivePage() {
  const [files, setFiles] = useState<File[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [search, setSearch] = useState('')
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined)
  const [showUpload, setShowUpload] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [filesRes, foldersRes] = await Promise.all([
        listFiles({ folderId: currentFolderId, search: search || undefined }),
        listFolders(),
      ])
      setFiles(filesRes.files)
      setFolders(foldersRes.folders)
    } catch (error) {
      console.error('Failed to load drive data:', error)
    } finally {
      setLoading(false)
    }
  }, [currentFolderId, search])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleDelete = async (id: string) => {
    try {
      await deleteFile(id)
      await loadData()
    } catch (error) {
      console.error('Failed to delete file:', error)
    }
  }

  const handleRestore = async (id: string) => {
    try {
      await restoreFile(id)
      await loadData()
    } catch (error) {
      console.error('Failed to restore file:', error)
    }
  }

  const handleToggleStar = async (id: string, starred: boolean) => {
    try {
      await updateFile(id, { starred: !starred })
      await loadData()
    } catch (error) {
      console.error('Failed to toggle star:', error)
    }
  }

  const handleShare = (id: string) => {
    setSelectedFileId(id)
    setShowShare(true)
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return Image
    if (mimeType.includes('pdf')) return FileText
    return FileIcon
  }

  const currentFolder = currentFolderId ? folders.find((f: Folder) => f.id === currentFolderId) : undefined

  const filteredFiles = files.filter((f) =>
    search ? f.name.toLowerCase().includes(search.toLowerCase()) : true,
  )

  const childFolders = folders.filter((f: Folder) => f.parentId === currentFolderId)

  const hasContent = filteredFiles.length > 0 || childFolders.length > 0

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <FolderTree
          folders={folders}
          currentFolderId={currentFolderId}
          onSelect={setCurrentFolderId}
        />
        <div className={styles.sidebarFooter}>
          <StorageQuota />
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Drive</h1>
            {currentFolder && (
              <div className={styles.breadcrumb}>
                <span key={currentFolder.id} className={styles.breadcrumbItem}>
                  <FolderIcon size={16} />
                  {currentFolder.name}
                </span>
              </div>
            )}
          </div>
          <div className={styles.headerRight}>
            <Input
              placeholder="Search files..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
            <Button onClick={() => setShowUpload(true)}>
              <Upload size={16} />
              Upload
            </Button>
            <Tabs value={viewMode} onValueChange={(v: string) => setViewMode(v as ViewMode)}>
              <TabsList>
                <TabsTrigger value="grid">
                  <Grid size={16} />
                </TabsTrigger>
                <TabsTrigger value="list">
                  <List size={16} />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>
            <p className={styles.loadingText}>Loading...</p>
          </div>
        ) : !hasContent ? (
          <div className={styles.emptyState}>
            <p>No files yet. Upload your first file!</p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <FileGrid
                files={filteredFiles}
                folders={childFolders}
                onFolderClick={(id: string) => setCurrentFolderId(id)}
                onDelete={handleDelete}
                onRestore={handleRestore}
                onToggleStar={handleToggleStar}
                onShare={handleShare}
                getFileIcon={getFileIcon}
              />
            ) : (
              <FileList
                files={filteredFiles}
                folders={childFolders}
                onFolderClick={(id: string) => setCurrentFolderId(id)}
                onDelete={handleDelete}
                onRestore={handleRestore}
                onToggleStar={handleToggleStar}
                onShare={handleShare}
                getFileIcon={getFileIcon}
              />
            )}
          </>
        )}

        {showUpload && (
          <UploadDialog
            folderId={currentFolderId}
            onClose={() => setShowUpload(false)}
            onUploaded={loadData}
          />
        )}

        {showShare && selectedFileId && (
          <ShareDialog
            fileId={selectedFileId}
            onClose={() => {
              setShowShare(false)
              setSelectedFileId(null)
            }}
          />
        )}
      </main>
    </div>
  )
}
