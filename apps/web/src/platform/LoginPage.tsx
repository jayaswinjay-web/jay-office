import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Button, Input } from '@/design-system'
import { login } from './auth.service'
import { useAuthStore } from './AuthStore'
import styles from './LoginPage.module.css'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const authLogin = useAuthStore((state) => state.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const success = location.state?.registered ? 'Account created! Check your email to verify, then sign in below.' : ''
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await login(email, password)
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      authLogin(response.user, response.accessToken)
      navigate('/drive', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoText}>JAY Workspace</span>
        </div>

        <div className={styles.header}>
          <h1 className={styles.heading}>Sign in</h1>
          <p className={styles.subtitle}>Use your JAY Workspace account</p>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}
        {success && <div className={styles.successBanner}>{success}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className={styles.footer}>
          <Link to="/register" className={styles.link}>Create account</Link>
        </div>
      </div>
    </div>
  )
}
