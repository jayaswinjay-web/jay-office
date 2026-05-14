import { useState, useEffect } from 'react'
import { FormBuilder } from './FormBuilder'
import { FormPreview } from './FormPreview'
import { FormResponses } from './FormResponses'
import { listForms, createForm, deleteForm, updateForm, getForm } from './forms.service'
import { Plus, FileText, Eye, BarChart3, Pencil, Trash2, Copy, Search } from 'lucide-react'
import styles from './FormsPage.module.css'

interface Form {
  id: string
  title: string
  description: string | null
  status: 'draft' | 'published' | 'closed'
  questions: Array<{
    id: string
    type: string
    title: string
    required: boolean
    options?: string[]
  }>
  responseCount: number
  createdAt: Date
}

type FormView = 'list' | 'builder' | 'preview' | 'responses'

export function FormsPage() {
  const [forms, setForms] = useState<Form[]>([])
  const [activeView, setActiveView] = useState<FormView>('list')
  const [activeFormId, setActiveFormId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newFormTitle, setNewFormTitle] = useState('')

  useEffect(() => {
    loadForms()
  }, [])

  const loadForms = async () => {
    setIsLoading(true)
    try {
      const response = await listForms()
      setForms(response.forms)
    } catch (error) {
      console.error('Failed to load forms:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateForm = async () => {
    if (!newFormTitle.trim()) return
    try {
      const response = await createForm(newFormTitle)
      setForms((prev) => [response.form, ...prev])
    } catch (error) {
      console.error('Failed to create form:', error)
    }
    setNewFormTitle('')
    setShowCreateForm(false)
  }

  const handleDeleteForm = async (formId: string) => {
    try {
      await deleteForm(formId)
      setForms((prev) => prev.filter((f) => f.id !== formId))
      if (activeFormId === formId) {
        setActiveFormId(null)
        setActiveView('list')
      }
    } catch (error) {
      console.error('Failed to delete form:', error)
    }
  }

  const handleDuplicateForm = async (form: Form) => {
    try {
      const response = await createForm(`${form.title} (Copy)`)
      const newForm = response.form
      if (form.questions.length > 0 || form.description) {
        await updateForm(newForm.id, {
          questions: form.questions.map((q) => ({ ...q, id: `q-${Date.now()}-${q.id}` })),
          description: form.description,
        })
        const refreshed = await getForm(newForm.id)
        setForms((prev) => [refreshed.form, ...prev])
      } else {
        setForms((prev) => [newForm, ...prev])
      }
    } catch (error) {
      console.error('Failed to duplicate form:', error)
    }
  }

  const filteredForms = forms.filter((form) =>
    form.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const activeForm = forms.find((f) => f.id === activeFormId)

  if (activeView === 'builder' && activeForm) {
    return (
      <FormBuilder
        form={activeForm}
        onBack={() => {
          setActiveView('list')
          setActiveFormId(null)
        }}
        onSave={(updatedForm) => {
          setForms((prev) => prev.map((f) => (f.id === updatedForm.id ? updatedForm : f)))
        }}
      />
    )
  }

  if (activeView === 'preview' && activeForm) {
    return (
      <FormPreview
        form={activeForm}
        onBack={() => {
          setActiveView('list')
          setActiveFormId(null)
        }}
      />
    )
  }

  if (activeView === 'responses' && activeForm) {
    return (
      <FormResponses
        form={activeForm}
        onBack={() => {
          setActiveView('list')
          setActiveFormId(null)
        }}
      />
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Forms</h1>
        <button className={styles.createBtn} onClick={() => setShowCreateForm(true)}>
          <Plus size={18} />
          Create Form
        </button>
      </div>

      {showCreateForm && (
        <div className={styles.createFormModal}>
          <div className={styles.createFormCard}>
            <h3>Create New Form</h3>
            <input
              type="text"
              className={styles.createFormInput}
              placeholder="Enter form title"
              value={newFormTitle}
              onChange={(e) => setNewFormTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateForm()
              }}
              autoFocus
            />
            <div className={styles.createFormActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => {
                  setShowCreateForm(false)
                  setNewFormTitle('')
                }}
              >
                Cancel
              </button>
              <button
                className={styles.confirmBtn}
                onClick={handleCreateForm}
                disabled={!newFormTitle.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.searchBox}>
        <Search size={16} />
        <input
          type="text"
          placeholder="Search forms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {isLoading ? (
        <div className={styles.loading}>Loading forms...</div>
      ) : filteredForms.length === 0 ? (
        <div className={styles.empty}>
          <FileText size={48} />
          <h3>No forms yet</h3>
          <p>Create your first form to get started</p>
        </div>
      ) : (
        <div className={styles.formGrid}>
          {filteredForms.map((form) => (
            <div key={form.id} className={styles.formCard}>
              <div className={styles.formCardHeader}>
                <div className={styles.formCardTitle}>
                  <FileText size={20} />
                  <h3>{form.title}</h3>
                </div>
                <span className={`${styles.statusBadge} ${styles[form.status]}`}>
                  {form.status}
                </span>
              </div>

              {form.description && <p className={styles.formDescription}>{form.description}</p>}

              <div className={styles.formMeta}>
                <span>{form.questions.length} questions</span>
                <span>{form.responseCount} responses</span>
                <span>{new Date(form.createdAt).toLocaleDateString()}</span>
              </div>

              <div className={styles.formActions}>
                <button
                  className={styles.actionBtn}
                  onClick={() => {
                    setActiveFormId(form.id)
                    setActiveView('builder')
                  }}
                  title="Edit"
                >
                  <Pencil size={16} />
                  Edit
                </button>
                <button
                  className={styles.actionBtn}
                  onClick={() => {
                    setActiveFormId(form.id)
                    setActiveView('preview')
                  }}
                  title="Preview"
                >
                  <Eye size={16} />
                  Preview
                </button>
                {form.responseCount > 0 && (
                  <button
                    className={styles.actionBtn}
                    onClick={() => {
                      setActiveFormId(form.id)
                      setActiveView('responses')
                    }}
                    title="View Responses"
                  >
                    <BarChart3 size={16} />
                    Responses
                  </button>
                )}
                <button
                  className={styles.actionBtn}
                  onClick={() => handleDuplicateForm(form)}
                  title="Duplicate"
                >
                  <Copy size={16} />
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  onClick={() => handleDeleteForm(form.id)}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
