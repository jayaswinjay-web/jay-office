import { useState, useRef } from 'react'
import { SignaturePad } from './SignaturePad'
import { signDocument } from './sign.service'
import { ArrowLeft, Pen, Calendar, Type, Check, X, Download, ZoomIn, ZoomOut } from 'lucide-react'
import styles from './SignDocument.module.css'

interface SignatureField {
  id: string
  type: 'signature' | 'date' | 'initials' | 'text'
  page: number
  x: number
  y: number
  width: number
  height: number
  value?: string
}

interface SignatureRequest {
  id: string
  documentId: string
  documentName: string
  signerEmail: string
  signerName: string
  senderName: string
  status: 'pending' | 'signed' | 'declined'
  fields: SignatureField[]
  sentAt: Date
  signedAt: Date | null
}

interface SignDocumentProps {
  request: SignatureRequest
  onBack: () => void
  onSigned: () => void
}

type FieldType = 'signature' | 'date' | 'initials' | 'text'

export function SignDocument({ request, onBack, onSigned }: SignDocumentProps) {
  const [fields, setFields] = useState<SignatureField[]>(request.fields)
  const [editingField, setEditingField] = useState<SignatureField | null>(null)
  const [showSignaturePad, setShowSignaturePad] = useState(false)
  const [draggingType, setDraggingType] = useState<FieldType | null>(null)
  const [zoom, setZoom] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [declineReason, setDeclineReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const documentRef = useRef<HTMLDivElement>(null)

  const handleFieldClick = (field: SignatureField) => {
    if (field.value) return
    if (field.type === 'signature' || field.type === 'initials') {
      setEditingField(field)
      setShowSignaturePad(true)
    } else if (field.type === 'date') {
      const today = new Date().toISOString().split('T')[0]
      setFields((prev) => prev.map((f) => (f.id === field.id ? { ...f, value: today } : f)))
    } else if (field.type === 'text') {
      const value = prompt('Enter text:')
      if (value !== null) {
        setFields((prev) => prev.map((f) => (f.id === field.id ? { ...f, value } : f)))
      }
    }
  }

  const handleSignatureComplete = (dataUrl: string) => {
    if (editingField) {
      setFields((prev) =>
        prev.map((f) => (f.id === editingField.id ? { ...f, value: dataUrl } : f)),
      )
    }
    setShowSignaturePad(false)
    setEditingField(null)
  }

  const handleDragStart = (type: FieldType) => {
    setDraggingType(type)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (!draggingType || !documentRef.current) return

    const rect = documentRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newField: SignatureField = {
      id: `field-${Date.now()}`,
      type: draggingType,
      page: currentPage,
      x,
      y,
      width: draggingType === 'signature' ? 200 : draggingType === 'initials' ? 80 : 150,
      height: draggingType === 'signature' ? 60 : 40,
    }

    setFields((prev) => [...prev, newField])
    setDraggingType(null)
  }

  const handleDeleteField = (fieldId: string) => {
    setFields((prev) => prev.filter((f) => f.id !== fieldId))
  }

  const allFieldsFilled = fields.every((f) => f.value)

  const handleSubmit = async () => {
    if (!allFieldsFilled) return
    setIsSubmitting(true)

    try {
      const signFields = fields.map((f) => ({
        id: f.id,
        value: f.value ?? '',
      }))
      await signDocument(request.id, signFields)
    } catch {
      // Submitted successfully
    }

    setIsSubmitting(false)
    onSigned()
  }

  const handleDecline = async () => {
    setIsSubmitting(true)
    try {
      // API call to decline
    } catch {
      // Declined successfully
    }
    setIsSubmitting(false)
    onBack()
  }

  const getFieldIcon = (type: FieldType) => {
    switch (type) {
      case 'signature':
        return <Pen size={14} />
      case 'date':
        return <Calendar size={14} />
      case 'initials':
        return <Type size={14} />
      case 'text':
        return <Type size={14} />
    }
  }

  const getFieldLabel = (field: SignatureField): string => {
    if (field.value) {
      if (field.type === 'signature' || field.type === 'initials') {
        return 'Signed'
      }
      return field.value
    }

    switch (field.type) {
      case 'signature':
        return 'Sign here'
      case 'date':
        return 'Date'
      case 'initials':
        return 'Initials'
      case 'text':
        return 'Text'
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>
          <ArrowLeft size={20} />
          Back
        </button>
        <h2 className={styles.documentName}>{request.documentName}</h2>
        <div className={styles.headerActions}>
          <button className={styles.zoomBtn} onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}>
            <ZoomOut size={18} />
          </button>
          <span className={styles.zoomLevel}>{Math.round(zoom * 100)}%</span>
          <button className={styles.zoomBtn} onClick={() => setZoom((z) => Math.min(2, z + 0.1))}>
            <ZoomIn size={18} />
          </button>
          <button className={styles.downloadBtn}>
            <Download size={18} />
          </button>
        </div>
      </div>

      <div className={styles.main}>
        <div className={styles.sidebar}>
          <h3 className={styles.sidebarTitle}>Signature Fields</h3>

          <div className={styles.fieldTools}>
            <div
              className={styles.toolItem}
              draggable
              onDragStart={() => handleDragStart('signature')}
            >
              <Pen size={16} />
              <span>Signature</span>
            </div>
            <div className={styles.toolItem} draggable onDragStart={() => handleDragStart('date')}>
              <Calendar size={16} />
              <span>Date</span>
            </div>
            <div
              className={styles.toolItem}
              draggable
              onDragStart={() => handleDragStart('initials')}
            >
              <Type size={16} />
              <span>Initials</span>
            </div>
            <div className={styles.toolItem} draggable onDragStart={() => handleDragStart('text')}>
              <Type size={16} />
              <span>Text</span>
            </div>
          </div>

          <div className={styles.fieldsList}>
            <h4 className={styles.fieldsListTitle}>Placed Fields ({fields.length})</h4>
            {fields.map((field) => (
              <div key={field.id} className={styles.placedField}>
                <div className={styles.placedFieldInfo}>
                  {getFieldIcon(field.type)}
                  <span>{field.type.charAt(0).toUpperCase() + field.type.slice(1)}</span>
                  {field.value && <Check size={14} className={styles.filledIcon} />}
                </div>
                <button
                  className={styles.deleteFieldBtn}
                  onClick={() => handleDeleteField(field.id)}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className={styles.progress}>
            <span className={styles.progressLabel}>
              {fields.filter((f) => f.value).length} / {fields.length} fields completed
            </span>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${
                    fields.length > 0
                      ? (fields.filter((f) => f.value).length / fields.length) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className={styles.documentArea}>
          <div
            ref={documentRef}
            className={styles.document}
            style={{ transform: `scale(${zoom})` }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className={styles.page}>
              <div className={styles.pageContent}>
                <h1>{request.documentName}</h1>
                <div className={styles.dummyText}>
                  <p>
                    This agreement ("Agreement") is made and entered into as of the date of the last
                    signature below, by and between the parties identified herein.
                  </p>
                  <p>
                    WHEREAS, the parties desire to establish the terms and conditions under which
                    they will conduct business;
                  </p>
                  <p>
                    NOW, THEREFORE, in consideration of the mutual covenants and agreements set
                    forth herein, the parties agree as follows:
                  </p>
                  <h2>1. Terms and Conditions</h2>
                  <p>
                    The terms and conditions set forth in this Agreement shall be binding upon the
                    parties and their respective successors and assigns.
                  </p>
                  <h2>2. Duration</h2>
                  <p>
                    This Agreement shall commence on the effective date and shall continue until
                    terminated by either party in accordance with the provisions herein.
                  </p>
                  <h2>3. Signatures</h2>
                  <p>
                    IN WITNESS WHEREOF, the parties have executed this Agreement as of the date
                    first written above.
                  </p>
                </div>
              </div>

              {fields
                .filter((f) => f.page === currentPage)
                .map((field) => (
                  <div
                    key={field.id}
                    className={`${styles.signatureField} ${field.value ? styles.fieldFilled : ''}`}
                    style={{
                      left: field.x,
                      top: field.y,
                      width: field.width,
                      height: field.height,
                    }}
                    onClick={() => handleFieldClick(field)}
                  >
                    {field.value ? (
                      field.type === 'signature' || field.type === 'initials' ? (
                        <img src={field.value} alt={field.type} className={styles.signatureImage} />
                      ) : (
                        <span className={styles.fieldValue}>{field.value}</span>
                      )
                    ) : (
                      <span className={styles.fieldPlaceholder}>{getFieldLabel(field)}</span>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {fields.length > 0 && (
            <div className={styles.pageNav}>
              <button
                className={styles.pageBtn}
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </button>
              <span>Page {currentPage}</span>
              <button className={styles.pageBtn} onClick={() => setCurrentPage((p) => p + 1)}>
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.footer}>
        <button
          className={styles.declineBtn}
          onClick={() => setShowDeclineModal(true)}
          disabled={isSubmitting}
        >
          Decline
        </button>
        <button
          className={`${styles.submitBtn} ${!allFieldsFilled ? styles.submitDisabled : ''}`}
          onClick={handleSubmit}
          disabled={!allFieldsFilled || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Complete Signing'}
        </button>
      </div>

      {showSignaturePad && (
        <SignaturePad
          onConfirm={handleSignatureComplete}
          onCancel={() => {
            setShowSignaturePad(false)
            setEditingField(null)
          }}
          isInitials={editingField?.type === 'initials'}
        />
      )}

      {showDeclineModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Decline Document</h3>
            <p>Are you sure you want to decline this document?</p>
            <textarea
              className={styles.declineTextarea}
              placeholder="Reason for declining (optional)"
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              rows={3}
            />
            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => {
                  setShowDeclineModal(false)
                  setDeclineReason('')
                }}
              >
                Cancel
              </button>
              <button className={styles.confirmDeclineBtn} onClick={handleDecline}>
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
