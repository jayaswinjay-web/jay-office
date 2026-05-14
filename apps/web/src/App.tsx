import { Component, ReactNode } from 'react'
import { Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom'
import { Layout } from './platform/Layout'
import { LandingPage } from './platform/LandingPage'
import { LoginPage } from './platform/LoginPage'
import { RegisterPage } from './platform/RegisterPage'
import { TwoFactorSetup } from './platform/TwoFactorSetup'
import { SessionManager } from './platform/SessionManager'
import { DrivePage } from './apps/drive/DrivePage'
import { DocsPage, EditorPage } from './apps/docs'
import { SheetsPage } from './apps/sheets/SheetsPage'
import { SlidesPage } from './apps/slides/SlidesPage'
import { NotesPage } from './apps/notes/NotesPage'
import { TasksPage } from './apps/tasks/TasksPage'
import { MailPage } from './apps/mail/MailPage'
import { CalPage } from './apps/cal/CalPage'
import { MeetPage } from './apps/meet/MeetPage'
import { ChatPage } from './apps/chat/ChatPage'
import { FormsPage } from './apps/forms/FormsPage'
import { SignPage } from './apps/sign/SignPage'

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 48, textAlign: 'center' }}>
          <h1>Something went wrong</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Please try refreshing the page.</p>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 16, padding: '8px 24px', cursor: 'pointer' }}
          >
            Refresh
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function MeetRoute() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  return (
    <MeetPage
      meetingId={id}
      isNewMeeting={!id}
      onBack={() => navigate('/meet')}
    />
  )
}

function DocsEditRoute() {
  const { id } = useParams<{ id: string }>()
  if (!id) return <div style={{ padding: 24 }}>Document not found</div>
  return <EditorPage docId={id} />
}

function FormsRoute() {
  useParams<{ id?: string }>()
  return <FormsPage />
}

interface AuthGuardProps {
  children: React.ReactNode
}

function AuthGuard({ children }: AuthGuardProps) {
  const token = localStorage.getItem('accessToken')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function App() {
  return (
    <ErrorBoundary>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/2fa-setup"
        element={
          <AuthGuard>
            <Layout>
              <TwoFactorSetup />
            </Layout>
          </AuthGuard>
        }
      />
      <Route
        path="/sessions"
        element={
          <AuthGuard>
            <Layout>
              <SessionManager />
            </Layout>
          </AuthGuard>
        }
      />
      <Route
        path="*"
        element={
          <AuthGuard>
            <Layout>
              <Routes>
                <Route path="/drive" element={<DrivePage />} />
                <Route path="/docs" element={<DocsPage />} />
                <Route path="/docs/:id" element={<DocsEditRoute />} />
                <Route path="/sheets" element={<SheetsPage />} />
                <Route path="/slides" element={<SlidesPage />} />
                <Route path="/notes" element={<NotesPage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/mail" element={<MailPage />} />
                <Route path="/cal" element={<CalPage />} />
                <Route path="/meet" element={<MeetRoute />} />
                <Route path="/meet/:id" element={<MeetRoute />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/forms" element={<FormsRoute />} />
                <Route path="/forms/:id" element={<FormsRoute />} />
                <Route path="/sign" element={<SignPage />} />
                <Route path="/" element={<Navigate to="/drive" replace />} />
                <Route path="*" element={<div style={{ padding: 24 }}>Coming soon</div>} />
              </Routes>
            </Layout>
          </AuthGuard>
        }
      />
    </Routes>
    </ErrorBoundary>
  )
}

export default App
