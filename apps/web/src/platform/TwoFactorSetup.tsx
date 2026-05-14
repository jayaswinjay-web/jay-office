import { useState, useEffect } from 'react'
import { Button, Input } from '@/design-system'
import { setup2FA, verify2FA } from './auth.service'
import styles from './TwoFactorSetup.module.css'

export function TwoFactorSetup() {
  const [secret, setSecret] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    loadSetup()
  }, [])

  const loadSetup = async () => {
    try {
      const data = await setup2FA()
      setSecret(data.secret)
      setQrCodeUrl(data.qrCodeUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load 2FA setup')
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await verify2FA(token)
      setEnabled(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  if (enabled) {
    return <div className={styles.successBanner}>2FA has been enabled successfully.</div>
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Two-Factor Authentication</h2>
        <p className={styles.subtitle}>Scan the QR code with your authenticator app</p>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      {qrCodeUrl && (
        <div className={styles.qrWrapper}>
          <img src={qrCodeUrl} alt="2FA QR Code" className={styles.qrImage} />
        </div>
      )}

      <div className={styles.secretSection}>
        <p className={styles.secretLabel}>Or enter this secret manually:</p>
        <code className={styles.secretCode}>{secret}</code>
      </div>

      <form onSubmit={handleVerify} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="token" className={styles.label}>
            Enter 6-digit code
          </label>
          <Input
            id="token"
            type="text"
            value={token}
             onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToken(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={loading || token.length !== 6}
          className={styles.submitButton}
        >
          {loading ? 'Verifying...' : 'Verify and enable'}
        </Button>
      </form>
    </div>
  )
}
