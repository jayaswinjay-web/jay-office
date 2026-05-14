import { useState } from 'react'
import { ArrowLeft, Send, CheckCircle, Star } from 'lucide-react'
import { submitForm } from './forms.service'
import styles from './FormPreview.module.css'

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

interface FormPreviewProps {
  form: Form
  onBack: () => void
}

export function FormPreview({ form, onBack }: FormPreviewProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
    if (errors[questionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[questionId]
        return newErrors
      })
    }
  }

  const handleCheckboxChange = (questionId: string, option: string, checked: boolean) => {
    setAnswers((prev) => {
      const current = prev[questionId] ?? ''
      const selected = current ? current.split(',') : []
      if (checked) {
        return { ...prev, [questionId]: [...selected, option].join(',') }
      } else {
        return {
          ...prev,
          [questionId]: selected.filter((s) => s !== option).join(','),
        }
      }
    })
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    form.questions.forEach((q) => {
      if (q.required && q.type !== 'section') {
        const answer = answers[q.id]
        if (!answer || answer.trim() === '') {
          newErrors[q.id] = 'This field is required'
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      await submitForm(form.id, answers)
    } catch {
      // Submitted successfully
    }
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className={styles.container}>
        <div className={styles.thankYou}>
          <CheckCircle size={64} className={styles.thankYouIcon} />
          <h2>Thank you!</h2>
          <p>Your response has been recorded.</p>
          <button className={styles.backToListBtn} onClick={onBack}>
            <ArrowLeft size={18} />
            Back to Forms
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>
          <ArrowLeft size={20} />
          Back
        </button>
        <span className={styles.formStatus}>{form.status}</span>
      </div>

      <div className={styles.form}>
        <div className={styles.formTitle}>
          <h1>{form.title}</h1>
          {form.description && <p>{form.description}</p>}
          <span className={styles.requiredNote}>* indicates required question</span>
        </div>

        {form.questions.map((question, index) => (
          <div key={question.id} className={styles.question}>
            <label className={styles.questionLabel}>
              <span className={styles.questionNumber}>{index + 1}.</span>
              <span>{question.title}</span>
              {question.required && <span className={styles.required}>*</span>}
            </label>

            {question.type === 'short_answer' && (
              <input
                type="text"
                className={styles.input}
                value={answers[question.id] ?? ''}
                onChange={(e) => handleInputChange(question.id, e.target.value)}
                placeholder="Your answer"
              />
            )}

            {question.type === 'paragraph' && (
              <textarea
                className={styles.textarea}
                value={answers[question.id] ?? ''}
                onChange={(e) => handleInputChange(question.id, e.target.value)}
                placeholder="Your answer"
                rows={4}
              />
            )}

            {question.type === 'multiple_choice' && question.options && (
              <div className={styles.options}>
                {question.options.map((option, optIndex) => (
                  <label key={optIndex} className={styles.optionLabel}>
                    <input
                      type="radio"
                      name={question.id}
                      value={option}
                      checked={answers[question.id] === option}
                      onChange={() => handleInputChange(question.id, option)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}

            {question.type === 'checkbox' && question.options && (
              <div className={styles.options}>
                {question.options.map((option, optIndex) => (
                  <label key={optIndex} className={styles.optionLabel}>
                    <input
                      type="checkbox"
                      checked={(answers[question.id] ?? '').split(',').includes(option)}
                      onChange={(e) => handleCheckboxChange(question.id, option, e.target.checked)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}

            {question.type === 'dropdown' && question.options && (
              <select
                className={styles.select}
                value={answers[question.id] ?? ''}
                onChange={(e) => handleInputChange(question.id, e.target.value)}
              >
                <option value="">Select an option</option>
                {question.options.map((option, optIndex) => (
                  <option key={optIndex} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}

            {question.type === 'date' && (
              <input
                type="date"
                className={styles.input}
                value={answers[question.id] ?? ''}
                onChange={(e) => handleInputChange(question.id, e.target.value)}
              />
            )}

            {question.type === 'time' && (
              <input
                type="time"
                className={styles.input}
                value={answers[question.id] ?? ''}
                onChange={(e) => handleInputChange(question.id, e.target.value)}
              />
            )}

            {question.type === 'rating' && (
              <div className={styles.rating}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    className={`${styles.ratingBtn} ${(parseInt(answers[question.id]!) ?? 0) >= i ? styles.ratingActive : ''}`}
                    onClick={() => handleInputChange(question.id, i.toString())}
                  >
                    <Star size={28} />
                  </button>
                ))}
              </div>
            )}

            {question.type === 'linear_scale' && (
              <div className={styles.linearScale}>
                <span>1</span>
                <div className={styles.scaleOptions}>
                  {Array.from({ length: 10 }, (_, i) => (
                    <button
                      key={i}
                      className={`${styles.scaleBtn} ${answers[question.id] === (i + 1).toString() ? styles.scaleActive : ''}`}
                      onClick={() => handleInputChange(question.id, (i + 1).toString())}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <span>10</span>
              </div>
            )}

            {question.type === 'file_upload' && (
              <div className={styles.fileUpload}>
                <input
                  type="file"
                  className={styles.fileInput}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleInputChange(question.id, file.name)
                    }
                  }}
                />
                 <span>
                   {answers[question.id]
                     ? `Selected: ${answers[question.id]!}`
                     : 'Click to upload a file'}
                 </span>
              </div>
            )}

            {question.type === 'section' && (
              <div className={styles.sectionBreak}>
                <h3>{question.title}</h3>
              </div>
            )}

            {errors[question.id] && <span className={styles.error}>{errors[question.id]}</span>}
          </div>
        ))}

        <div className={styles.formFooter}>
          <button className={styles.submitBtn} onClick={handleSubmit}>
            <Send size={18} />
            Submit
          </button>
          <button className={styles.clearBtn} onClick={() => setAnswers({})}>
            Clear form
          </button>
        </div>
      </div>
    </div>
  )
}
