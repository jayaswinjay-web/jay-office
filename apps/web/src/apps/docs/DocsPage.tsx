import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { DataTable, Button, Input } from '@/design-system'
import { api } from '@/platform/api'
import type { Document } from '@jay/types'
import styles from './DocsPage.module.css'

type Doc = Document

interface DocsResponse {
  docs: Doc[]
}

type SortField = 'title' | 'createdAt' | 'updatedAt'
type SortOrder = 'asc' | 'desc'

export function DocsPage() {
  const navigate = useNavigate()
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('updatedAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const fetchDocs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get<DocsResponse>('/docs')
      setDocs(res.docs)
    } catch (error) {
      console.error('Failed to fetch docs:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDocs()
  }, [fetchDocs])

  const handleCreate = async () => {
    try {
      const res = await api.post<{ doc: Doc }>('/docs', { title: 'Untitled Document' })
      setDocs((prev) => [res.doc, ...prev])
    } catch (error) {
      console.error('Failed to create doc:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/docs/${id}`)
      setDocs((prev) => prev.filter((doc) => doc.id !== id))
    } catch (error) {
      console.error('Failed to delete doc:', error)
    }
  }

  const filteredDocs = docs
    .filter((doc) => doc.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      const modifier = sortOrder === 'asc' ? 1 : -1
      if (aVal instanceof Date && bVal instanceof Date) {
        return modifier * (aVal.getTime() - bVal.getTime())
      }
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return modifier * aVal.localeCompare(bVal)
      }
      return 0
    })

  const columns = [
    {
      key: 'title',
      header: 'Title',
      render: (doc: Doc) => (
        <span
          className={styles.docLink}
          onClick={() => navigate(`/docs/${doc.id}`)}
          style={{ cursor: 'pointer', color: 'var(--color-primary, #0066cc)' }}
        >
          {doc.title}
        </span>
      ),
    },
    {
      key: 'version',
      header: 'Version',
      render: (doc: Doc) => `v${doc.version}`,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (doc: Doc) => new Date(doc.createdAt).toLocaleDateString(),
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      render: (doc: Doc) => new Date(doc.updatedAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (doc: Doc) => (
        <Button
          variant="danger"
          size="sm"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
            handleDelete(doc.id)
          }}
        >
          Delete
        </Button>
      ),
    },
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Documents</h1>
        <Button onClick={handleCreate}>Create New</Button>
      </div>

      <div className={styles.controls}>
        <Input
          placeholder="Search documents..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <select
          value={sortField}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setSortField(e.target.value as SortField)
          }
          className={styles.selectInput}
        >
          <option value="title">Title</option>
          <option value="createdAt">Created</option>
          <option value="updatedAt">Updated</option>
        </select>
        <Button
          variant="secondary"
          onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </Button>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : filteredDocs.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No documents yet. Create your first document!</p>
        </div>
      ) : (
        <DataTable data={filteredDocs} columns={columns} />
      )}
    </div>
  )
}
