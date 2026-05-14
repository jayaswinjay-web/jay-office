import { useState, useRef, useCallback } from 'react'
import { Upload, X, File as FileIcon } from 'lucide-react'
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/design-system'
import { uploadFile } from './drive.service'
import styles from './UploadDialog.module.css'

interface UploadDialogProps {
  folderId: string | undefined
  onClose: () => void
  onUploaded: () => void
}

export function UploadDialog({ folderId, onClose, onUploaded }: UploadDialogProps) {
  const [files, setFiles] = useState<globalThis.File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return
    setFiles((prev: globalThis.File[]) => [...prev, ...Array.from(selectedFiles)])
  }, [])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles],
  )

  const removeFile = (index: number) => {
    setFiles((prev: globalThis.File[]) =>
      prev.filter((_: globalThis.File, i: number) => i !== index),
    )
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    setUploading(true)
    setProgress(0)

    try {
      for (let i = 0; i < files.length; i++) {
        await uploadFile(files[i]!, folderId!)
        setProgress(((i + 1) / files.length) * 100)
      }
      onUploaded()
      onClose()
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className={styles.container}>
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>

        <div
          className={`${styles.dropzone} ${dragActive ? styles.dropzoneActive : styles.dropzoneIdle}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <Upload size={40} className={styles.dropzoneIcon} />
          <p className={styles.dropzoneText}>Drag & drop files here, or click to browse</p>
          <input
            ref={inputRef}
            type="file"
            multiple
            className={styles.fileInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files)}
          />
        </div>

        {files.length > 0 && (
          <div className={styles.fileList}>
            {files.map((file: globalThis.File, index: number) => (
              <div key={index} className={styles.fileItem}>
                <div className={styles.fileInfo}>
                  <FileIcon className={styles.fileIcon} />
                  <div className={styles.fileDetails}>
                    <p className={styles.fileName}>{file.name}</p>
                    <p className={styles.fileSize}>{formatSize(file.size)}</p>
                  </div>
                </div>
                <button
                  className={styles.removeButton}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation()
                    removeFile(index)
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {uploading && (
          <div className={styles.progressBar} style={{ background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden', height: '8px' }}>
            <div style={{ width: `${progress}%`, background: '#3b82f6', height: '100%', transition: 'width 0.3s' }} />
          </div>
        )}

        <div className={styles.footer}>
          <Button variant="outline" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={files.length === 0 || uploading}>
            {uploading ? 'Uploading...' : `Upload ${files.length} file(s)`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
