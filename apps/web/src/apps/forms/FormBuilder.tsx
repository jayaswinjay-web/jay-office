import { useState, useCallback } from 'react'
import {
  Plus,
  Trash2,
  GripVertical,
  Save,
  ArrowLeft,
  Type,
  AlignLeft,
  List,
  CheckSquare,
  ChevronDown,
  Calendar,
  Clock,
  Star,
  Scale,
  Upload,
  Heading,
  MoveUp,
  MoveDown,
  Copy,
} from 'lucide-react'
import styles from './FormBuilder.module.css'

interface FormQuestion {
  id: string
  type: string
  title: string
  required: boolean
  options?: string[]
}

interface Form {
  id: string
  title: string
  description: string | null
  status: 'draft' | 'published' | 'closed'
  questions: FormQuestion[]
  responseCount: number
  createdAt: Date
}

interface FormBuilderProps {
  form: Form
  onBack: () => void
  onSave: (form: Form) => void
}

const QUESTION_TYPES = [
  { type: 'short_answer', label: 'Short Answer', icon: Type },
  { type: 'paragraph', label: 'Paragraph', icon: AlignLeft },
  { type: 'multiple_choice', label: 'Multiple Choice', icon: List },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { type: 'dropdown', label: 'Dropdown', icon: ChevronDown },
  { type: 'date', label: 'Date', icon: Calendar },
  { type: 'time', label: 'Time', icon: Clock },
  { type: 'rating', label: 'Rating (1-5)', icon: Star },
  { type: 'linear_scale', label: 'Linear Scale (1-10)', icon: Scale },
  { type: 'file_upload', label: 'File Upload', icon: Upload },
  { type: 'section', label: 'Section Break', icon: Heading },
]

function createDefaultQuestion(type: string): FormQuestion {
  const base: FormQuestion = {
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    title: '',
    required: false,
  }

  if (type === 'multiple_choice' || type === 'checkbox' || type === 'dropdown') {
    base.options = ['Option 1', 'Option 2', 'Option 3']
    base.title = 'Question text'
  } else if (type === 'short_answer') {
    base.title = 'Short answer question'
  } else if (type === 'paragraph') {
    base.title = 'Paragraph question'
  } else if (type === 'date') {
    base.title = 'Select a date'
  } else if (type === 'time') {
    base.title = 'Select a time'
  } else if (type === 'rating') {
    base.title = 'Rate this'
  } else if (type === 'linear_scale') {
    base.title = 'Rate from 1 to 10'
  } else if (type === 'file_upload') {
    base.title = 'Upload a file'
  } else if (type === 'section') {
    base.title = 'New Section'
  }

  return base
}

export function FormBuilder({ form, onBack, onSave }: FormBuilderProps) {
  const [title, setTitle] = useState(form.title)
  const [description, setDescription] = useState(form.description ?? '')
  const [questions, setQuestions] = useState<FormQuestion[]>(form.questions)
  const [status, setStatus] = useState<'draft' | 'published' | 'closed'>(form.status)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [showTypePicker, setShowTypePicker] = useState(false)

  const addQuestion = useCallback((type: string) => {
    const newQuestion = createDefaultQuestion(type)
    setQuestions((prev) => [...prev, newQuestion])
    setShowTypePicker(false)
  }, [])

  const updateQuestion = useCallback((index: number, updates: Partial<FormQuestion>) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...updates } : q)))
  }, [])

  const deleteQuestion = useCallback((index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const duplicateQuestion = useCallback((index: number) => {
    setQuestions((prev) => {
      const question = prev[index]
      if (!question) return prev
      const duplicate = {
        ...question,
        id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: `${question.title} (Copy)`,
      }
      const newQuestions = [...prev]
      newQuestions.splice(index + 1, 0, duplicate)
      return newQuestions
    })
  }, [])

  const moveQuestion = useCallback((index: number, direction: 'up' | 'down') => {
    setQuestions((prev) => {
      const newQuestions = [...prev]
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= newQuestions.length) return prev
      const temp = newQuestions[index]!
      newQuestions[index] = newQuestions[targetIndex]!
      newQuestions[targetIndex] = temp
      return newQuestions
    })
  }, [])

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index)
  }, [])

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault()
      if (draggedIndex === null || draggedIndex === index) return

      setQuestions((prev) => {
        const newQuestions = [...prev]
        const draggedItem = newQuestions[draggedIndex]
        if (!draggedItem) return prev
        newQuestions.splice(draggedIndex, 1)
        newQuestions.splice(index, 0, draggedItem)
        setDraggedIndex(index)
        return newQuestions
      })
    },
    [draggedIndex],
  )

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null)
  }, [])

  const addOption = useCallback((questionIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== questionIndex) return q
        const options = q.options ?? []
        return {
          ...q,
          options: [...options, `Option ${options.length + 1}`],
        }
      }),
    )
  }, [])

  const updateOption = useCallback((questionIndex: number, optionIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== questionIndex) return q
        const options = [...(q.options ?? [])]
        options[optionIndex] = value
        return { ...q, options }
      }),
    )
  }, [])

  const deleteOption = useCallback((questionIndex: number, optionIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== questionIndex) return q
        const options = [...(q.options ?? [])]
        options.splice(optionIndex, 1)
        return { ...q, options }
      }),
    )
  }, [])

  const handleSave = () => {
    const updatedForm: Form = {
      ...form,
      title,
      description: description || null,
      status,
      questions,
    }
    onSave(updatedForm)
    onBack()
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>
          <ArrowLeft size={20} />
          Back
        </button>
        <div className={styles.headerActions}>
          <select
            className={styles.statusSelect}
            value={status}
            onChange={(e) => setStatus(e.target.value as 'draft' | 'published' | 'closed')}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="closed">Closed</option>
          </select>
          <button className={styles.saveBtn} onClick={handleSave}>
            <Save size={16} />
            Save
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.formHeader}>
          <input
            type="text"
            className={styles.titleInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Form title"
          />
          <textarea
            className={styles.descriptionInput}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Form description (optional)"
            rows={2}
          />
        </div>

        <div className={styles.questionsList}>
          {questions.map((question, index) => {
            const TypeIcon = QUESTION_TYPES.find((t) => t.type === question.type)?.icon ?? Type

            return (
              <div
                key={question.id}
                className={styles.questionCard}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
              >
                <div className={styles.questionHeader}>
                  <span className={styles.dragHandle}>
                    <GripVertical size={16} />
                  </span>
                  <span className={styles.questionType}>
                    <TypeIcon size={16} />
                    {QUESTION_TYPES.find((t) => t.type === question.type)?.label}
                  </span>
                  <div className={styles.questionActions}>
                    <button
                      className={styles.questionActionBtn}
                      onClick={() => moveQuestion(index, 'up')}
                      disabled={index === 0}
                      title="Move up"
                    >
                      <MoveUp size={14} />
                    </button>
                    <button
                      className={styles.questionActionBtn}
                      onClick={() => moveQuestion(index, 'down')}
                      disabled={index === questions.length - 1}
                      title="Move down"
                    >
                      <MoveDown size={14} />
                    </button>
                    <button
                      className={styles.questionActionBtn}
                      onClick={() => duplicateQuestion(index)}
                      title="Duplicate"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      className={`${styles.questionActionBtn} ${styles.deleteQuestionBtn}`}
                      onClick={() => deleteQuestion(index)}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className={styles.questionBody}>
                  <input
                    type="text"
                    className={styles.questionTitleInput}
                    value={question.title}
                    onChange={(e) => updateQuestion(index, { title: e.target.value })}
                    placeholder="Question text"
                  />

                  {(question.type === 'multiple_choice' ||
                    question.type === 'checkbox' ||
                    question.type === 'dropdown') &&
                    question.options && (
                      <div className={styles.optionsList}>
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className={styles.optionRow}>
                            <span className={styles.optionIndicator}>
                              {question.type === 'multiple_choice' && (
                                <input type="radio" disabled />
                              )}
                              {question.type === 'checkbox' && <input type="checkbox" disabled />}
                              {question.type === 'dropdown' && (
                                <span className={styles.optionNumber}>{optIndex + 1}</span>
                              )}
                            </span>
                            <input
                              type="text"
                              className={styles.optionInput}
                              value={option}
                              onChange={(e) => updateOption(index, optIndex, e.target.value)}
                            />
                            <button
                              className={styles.deleteOptionBtn}
                              onClick={() => deleteOption(index, optIndex)}
                              disabled={question.options!.length <= 1}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                        <button className={styles.addOptionBtn} onClick={() => addOption(index)}>
                          Add option
                        </button>
                      </div>
                    )}

                  {question.type === 'rating' && (
                    <div className={styles.preview}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span key={i} className={styles.star}>
                          {'\u2606'}
                        </span>
                      ))}
                    </div>
                  )}

                  {question.type === 'linear_scale' && (
                    <div className={styles.preview}>
                      <span>1</span>
                      <div className={styles.scaleBar}>
                        {Array.from({ length: 10 }, (_, i) => (
                          <span key={i} className={styles.scaleDot} />
                        ))}
                      </div>
                      <span>10</span>
                    </div>
                  )}

                  {question.type === 'date' && (
                    <div className={styles.preview}>
                      <span className={styles.datePreview}>YYYY-MM-DD</span>
                    </div>
                  )}

                  {question.type === 'time' && (
                    <div className={styles.preview}>
                      <span className={styles.timePreview}>HH:MM</span>
                    </div>
                  )}

                  {question.type === 'file_upload' && (
                    <div className={styles.preview}>
                      <span className={styles.filePreview}>Click to upload or drag and drop</span>
                    </div>
                  )}
                </div>

                <div className={styles.questionFooter}>
                  <label className={styles.requiredToggle}>
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(e) => updateQuestion(index, { required: e.target.checked })}
                    />
                    Required
                  </label>
                </div>
              </div>
            )
          })}
        </div>

        <div className={styles.addQuestionSection}>
          <div className={styles.addQuestionDropdown}>
            {showTypePicker && (
              <div className={styles.typePicker}>
                {QUESTION_TYPES.map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    className={styles.typeOption}
                    onClick={() => addQuestion(type)}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            className={styles.addQuestionBtn}
            onClick={() => setShowTypePicker(!showTypePicker)}
          >
            <Plus size={18} />
            Add Question
          </button>
        </div>
      </div>
    </div>
  )
}
