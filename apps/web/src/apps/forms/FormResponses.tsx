import { useState } from 'react'
import { ArrowLeft, Download, BarChart3, List, Search } from 'lucide-react'
import styles from './FormResponses.module.css'

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

interface FormResponse {
  id: string
  formId: string
  respondentName: string
  respondentEmail: string
  submittedAt: Date
  answers: Record<string, string>
}

interface FormResponsesProps {
  form: Form
  onBack: () => void
}

type ViewMode = 'summary' | 'individual'

export function FormResponses({ form, onBack }: FormResponsesProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('summary')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null)

  const responses = generateDemoResponses(form)

  const filteredResponses = responses.filter(
    (r) =>
      r.respondentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.respondentEmail.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getQuestionStats = (question: FormQuestion) => {
    const answers = responses.map((r) => r.answers[question.id]).filter(Boolean) as string[]

    if (
      question.type === 'multiple_choice' ||
      question.type === 'checkbox' ||
      question.type === 'dropdown'
    ) {
      const counts: Record<string, number> = {}
      question.options?.forEach((opt) => {
        counts[opt] = 0
      })

      answers.forEach((a) => {
        if (question.type === 'checkbox') {
          a.split(',').forEach((val) => {
            counts[val] = (counts[val] ?? 0) + 1
          })
        } else {
          counts[a] = (counts[a] ?? 0) + 1
        }
      })

      return { type: 'distribution', counts, total: answers.length }
    }

    if (question.type === 'rating' || question.type === 'linear_scale') {
      const numericAnswers = answers.map(Number).filter((n) => !isNaN(n))
      const avg =
        numericAnswers.length > 0
          ? numericAnswers.reduce((a, b) => a + b, 0) / numericAnswers.length
          : 0

      return {
        type: 'average',
        average: avg,
        total: numericAnswers.length,
        min: Math.min(...numericAnswers, 0),
        max: Math.max(...numericAnswers, 0),
      }
    }

    return {
      type: 'text',
      responses: answers,
      total: answers.length,
    }
  }

  const handleExportCSV = () => {
    const headers = ['Respondent', 'Email', 'Submitted At', ...form.questions.map((q) => q.title)]

    const rows = responses.map((r) => [
      r.respondentName,
      r.respondentEmail,
      new Date(r.submittedAt).toLocaleDateString(),
      ...form.questions.map((q) => r.answers[q.id] ?? ''),
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${form.title.replace(/\s+/g, '-')}-responses.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>
          <ArrowLeft size={20} />
          Back
        </button>
        <h1 className={styles.title}>{form.title} — Responses</h1>
        <button className={styles.exportBtn} onClick={handleExportCSV}>
          <Download size={16} />
          Export CSV
        </button>
      </div>

      <div className={styles.statsBar}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{form.responseCount}</span>
          <span className={styles.statLabel}>Total Responses</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{form.questions.length}</span>
          <span className={styles.statLabel}>Questions</span>
        </div>
      </div>

      <div className={styles.viewToggle}>
        <button
          className={`${styles.toggleBtn} ${viewMode === 'summary' ? styles.toggleActive : ''}`}
          onClick={() => setViewMode('summary')}
        >
          <BarChart3 size={16} />
          Summary
        </button>
        <button
          className={`${styles.toggleBtn} ${viewMode === 'individual' ? styles.toggleActive : ''}`}
          onClick={() => setViewMode('individual')}
        >
          <List size={16} />
          Individual
        </button>
      </div>

      <div className={styles.searchBox}>
        <Search size={16} />
        <input
          type="text"
          placeholder="Search responses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {viewMode === 'summary' ? (
        <div className={styles.summary}>
          {form.questions
            .filter((q) => q.type !== 'section')
            .map((question) => {
              const stats = getQuestionStats(question)

              return (
                <div key={question.id} className={styles.questionStats}>
                  <h3 className={styles.questionTitle}>
                    {question.title}
                    {question.required && <span className={styles.requiredBadge}>Required</span>}
                  </h3>

                   {stats.type === 'distribution' && (
                     <div className={styles.distribution}>
{Object.entries((stats as any).counts).map(([option, count]: [string, unknown]) => {
                         const percentage =
                           stats.total > 0 ? Math.round(((count as number) / stats.total) * 100) : 0
                         return (
                           <div key={option} className={styles.barRow}>
                             <span className={styles.barLabel}>{option}</span>
                             <div className={styles.barContainer}>
                               <div className={styles.bar} style={{ width: `${percentage}%` }} />
                             </div>
                             <span className={styles.barValue}>
                               {count as number} ({percentage}%)
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {stats.type === 'average' && (
                    <div className={styles.average}>
                       <span className={styles.averageValue}>{(stats as any).average.toFixed(1)}</span>
                       <div className={styles.averageBar}>
                         <div
                           className={styles.averageFill}
                           style={{
                             width: `${((stats as any).average / (question.type === 'rating' ? 5 : 10)) * 100}%`,
                           }}
                         />
                       </div>
                       <span className={styles.averageRange}>
                         Range: {(stats as any).min} - {(stats as any).max}
                       </span>
                    </div>
                  )}

                     {stats.type === 'text' && (
                     <div className={styles.textResponses}>
{((stats as any).responses.slice(0, 10) as string[]).map((resp: string, index: number) => (
                          <div key={index} className={styles.textResponse}>
                           {resp}
                         </div>
                       ))}
                       {((stats as any).responses.length > 10) && (
                         <span className={styles.moreText}>
                           +{((stats as any).responses.length - 10)} more responses
                         </span>
                       )}
                    </div>
                  )}
                </div>
              )
            })}
        </div>
      ) : (
        <div className={styles.individual}>
          {filteredResponses.map((response) => (
            <div
              key={response.id}
              className={`${styles.responseCard} ${selectedResponse?.id === response.id ? styles.selected : ''}`}
              onClick={() =>
                setSelectedResponse(selectedResponse?.id === response.id ? null : response)
              }
            >
              <div className={styles.responseHeader}>
                <div className={styles.respondentInfo}>
                  <div className={styles.respondentAvatar}>
                    {response.respondentName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className={styles.respondentName}>{response.respondentName}</span>
                    <span className={styles.respondentEmail}>{response.respondentEmail}</span>
                  </div>
                </div>
                <span className={styles.submittedDate}>
                  {new Date(response.submittedAt).toLocaleDateString()}
                </span>
              </div>

              {selectedResponse?.id === response.id && (
                <div className={styles.responseDetails}>
                  {form.questions
                    .filter((q) => q.type !== 'section')
                    .map((q) => (
                      <div key={q.id} className={styles.answerRow}>
                        <span className={styles.answerQuestion}>{q.title}</span>
                        <span className={styles.answerValue}>{response.answers[q.id] ?? '—'}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}

          {filteredResponses.length === 0 && (
            <div className={styles.empty}>
              <p>No responses found</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function generateDemoResponses(form: Form): FormResponse[] {
  const names = [
    { name: 'Alice Chen', email: 'alice@example.com' },
    { name: 'Bob Smith', email: 'bob@example.com' },
    { name: 'Carol Williams', email: 'carol@example.com' },
    { name: 'David Brown', email: 'david@example.com' },
    { name: 'Eva Martinez', email: 'eva@example.com' },
  ]

  return names.map((person, i) => {
    const answers: Record<string, string> = {}
    form.questions.forEach((q) => {
      if (q.type === 'short_answer' || q.type === 'paragraph') {
        answers[q.id] = `Response from ${person.name} to "${q.title}"`
      } else if (q.type === 'multiple_choice' && q.options) {
        answers[q.id] = q.options[i % q.options.length] ?? ''
      } else if (q.type === 'checkbox' && q.options) {
        answers[q.id] = q.options.slice(0, (i % 3) + 1).join(',')
      } else if (q.type === 'dropdown' && q.options) {
        answers[q.id] = q.options[i % q.options.length] ?? ''
      } else if (q.type === 'date') {
        answers[q.id] = '2024-03-15'
      } else if (q.type === 'time') {
        answers[q.id] = '09:00'
      } else if (q.type === 'rating') {
        answers[q.id] = ((i % 5) + 1).toString()
      } else if (q.type === 'linear_scale') {
        answers[q.id] = ((i % 10) + 1).toString()
      }
    })

    return {
      id: `resp-${form.id}-${i}`,
      formId: form.id,
      respondentName: person.name,
      respondentEmail: person.email,
      submittedAt: new Date(Date.now() - i * 86400000),
      answers,
    }
  })
}
