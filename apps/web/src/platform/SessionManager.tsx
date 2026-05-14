import { useState, useEffect } from 'react'
import { Button } from '@/design-system'
import { getSessions, revokeSession } from './auth.service'
import styles from './SessionManager.module.css'

export interface Session {
  id: string
  device_info: string | null
  ip_address: string | null
  created_at: string
  expires_at: string
}

export function SessionManager() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      const data = await getSessions()
      setSessions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  const handleRevoke = async (sessionId: string) => {
    try {
      await revokeSession(sessionId)
      setSessions(sessions.filter((s) => s.id !== sessionId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke session')
    }
  }

  if (loading) {
    return <div className={styles.loadingText}>Loading sessions...</div>
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Active Sessions</h2>

      {error && <div className={styles.errorBanner}>{error}</div>}

      {sessions.length === 0 ? (
        <p className={styles.emptyText}>No active sessions</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeadRow}>
                <th className={styles.tableHeadCell}>Device</th>
                <th className={styles.tableHeadCell}>IP Address</th>
                <th className={styles.tableHeadCell}>Last Active</th>
                <th className={styles.tableHeadCellAction}>Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>{session.device_info ?? 'Unknown'}</td>
                  <td className={styles.tableCell}>{session.ip_address ?? 'Unknown'}</td>
                  <td className={styles.tableCell}>
                    {new Date(session.created_at).toLocaleString()}
                  </td>
                  <td className={styles.tableCellAction}>
                    <Button
                      variant="ghost"
                      size="small"
                      className={styles.revokeButton}
                      onClick={() => handleRevoke(session.id)}
                    >
                      Revoke
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
