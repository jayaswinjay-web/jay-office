import { useState, useEffect } from 'react'
import { SignDocument } from './SignDocument'
import {
  listSignRequests,
  createSignRequest,
  type SignatureRequest as ServiceSignatureRequest,
} from './sign.service'
import { Search, FileText, Send, CheckCircle, XCircle, Clock, Eye } from 'lucide-react'
import styles from './SignPage.module.css'

interface SignatureRequest extends ServiceSignatureRequest {
  documentName: string
  senderName: string
}

type Tab = 'to-sign' | 'sent'

export function SignPage() {
  const [requests, setRequests] = useState<SignatureRequest[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('to-sign')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null)
  const [showSendModal, setShowSendModal] = useState(false)
  const [sendFormData, setSendFormData] = useState({
    documentName: '',
    signerEmail: '',
    signerName: '',
  })

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    setIsLoading(true)
    try {
      const response = await listSignRequests()
      setRequests(response.requests as SignatureRequest[])
    } catch (error) {
      console.error('Failed to load sign requests:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendDocument = async () => {
    if (
      !sendFormData.documentName.trim() ||
      !sendFormData.signerEmail.trim() ||
      !sendFormData.signerName.trim()
    )
      return

    try {
      const response = await createSignRequest({
        documentId: `doc-${Date.now()}`,
        documentName: sendFormData.documentName,
        signers: [
          {
            email: sendFormData.signerEmail,
            name: sendFormData.signerName,
          },
        ],
      })
      setRequests((prev) => [response.request as SignatureRequest, ...prev])
    } catch (error) {
      console.error('Failed to send document:', error)
    }

    setSendFormData({ documentName: '', signerEmail: '', signerName: '' })
    setShowSendModal(false)
  }

  const filteredRequests = requests.filter((req) => {
    const matchesTab =
      activeTab === 'to-sign' ? req.signerEmail === 'you@example.com' : req.senderName === 'You'
    const matchesSearch =
      req.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.signerName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  if (activeRequestId) {
    const activeRequest = requests.find((r) => r.id === activeRequestId)
    if (activeRequest) {
      return (
        <SignDocument
          request={activeRequest}
          onBack={() => setActiveRequestId(null)}
          onSigned={() => {
            setRequests((prev) =>
              prev.map((r) =>
                r.id === activeRequestId
                  ? { ...r, status: 'signed' as const, signedAt: new Date() }
                  : r,
              ),
            )
            setActiveRequestId(null)
          }}
        />
      )
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>E-Signature</h1>
        <button className={styles.sendBtn} onClick={() => setShowSendModal(true)}>
          <Send size={18} />
          Send Document
        </button>
      </div>

      {showSendModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Send Document for Signature</h2>
            <div className={styles.formGroup}>
              <label className={styles.label}>Document Name</label>
              <input
                type="text"
                className={styles.input}
                value={sendFormData.documentName}
                onChange={(e) =>
                  setSendFormData((prev) => ({
                    ...prev,
                    documentName: e.target.value,
                  }))
                }
                placeholder="e.g., Employment Agreement"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Signer Name</label>
              <input
                type="text"
                className={styles.input}
                value={sendFormData.signerName}
                onChange={(e) =>
                  setSendFormData((prev) => ({
                    ...prev,
                    signerName: e.target.value,
                  }))
                }
                placeholder="Full name"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Signer Email</label>
              <input
                type="email"
                className={styles.input}
                value={sendFormData.signerEmail}
                onChange={(e) =>
                  setSendFormData((prev) => ({
                    ...prev,
                    signerEmail: e.target.value,
                  }))
                }
                placeholder="email@example.com"
              />
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => {
                  setShowSendModal(false)
                  setSendFormData({
                    documentName: '',
                    signerEmail: '',
                    signerName: '',
                  })
                }}
              >
                Cancel
              </button>
              <button
                className={styles.confirmBtn}
                onClick={handleSendDocument}
                disabled={
                  !sendFormData.documentName.trim() ||
                  !sendFormData.signerEmail.trim() ||
                  !sendFormData.signerName.trim()
                }
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'to-sign' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('to-sign')}
        >
          To Sign
          <span className={styles.tabCount}>
            {
              requests.filter((r) => r.signerEmail === 'you@example.com' && r.status === 'pending')
                .length
            }
          </span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'sent' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          Sent
          <span className={styles.tabCount}>
            {requests.filter((r) => r.senderName === 'You').length}
          </span>
        </button>
      </div>

      <div className={styles.searchBox}>
        <Search size={16} />
        <input
          type="text"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {isLoading ? (
        <div className={styles.loading}>Loading documents...</div>
      ) : filteredRequests.length === 0 ? (
        <div className={styles.empty}>
          <FileText size={48} />
          <h3>No documents</h3>
          <p>
            {activeTab === 'to-sign'
              ? 'No documents waiting for your signature'
              : "You haven't sent any documents yet"}
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {filteredRequests.map((request) => (
            <div key={request.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <FileText size={20} />
                  <h3>{request.documentName}</h3>
                </div>
                <span className={`${styles.statusBadge} ${styles[request.status]}`}>
                  {request.status === 'pending' && (
                    <>
                      <Clock size={12} />
                      Pending
                    </>
                  )}
                  {request.status === 'signed' && (
                    <>
                      <CheckCircle size={12} />
                      Signed
                    </>
                  )}
                  {request.status === 'declined' && (
                    <>
                      <XCircle size={12} />
                      Declined
                    </>
                  )}
                </span>
              </div>

              <div className={styles.cardMeta}>
                <span>
                  {activeTab === 'to-sign' ? 'From: ' : 'To: '}
                  {activeTab === 'to-sign' ? request.senderName : request.signerName}
                </span>
                <span>Sent {new Date(request.sentAt).toLocaleDateString()}</span>
                {request.signedAt && (
                  <span>Signed {new Date(request.signedAt).toLocaleDateString()}</span>
                )}
              </div>

              <div className={styles.cardActions}>
                {request.status === 'pending' && (
                  <button className={styles.signBtn} onClick={() => setActiveRequestId(request.id)}>
                    <Eye size={16} />
                    {activeTab === 'to-sign' ? 'Sign Document' : 'View'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
