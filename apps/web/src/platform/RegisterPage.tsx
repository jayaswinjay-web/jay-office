import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button, Input } from '@/design-system'
import { register } from './auth.service'
import { GraduationCap, Globe } from 'lucide-react'
import styles from './RegisterPage.module.css'

type Plan = 'workspace' | 'campus'

export function RegisterPage() {
  const navigate = useNavigate()
  const [plan, setPlan] = useState<Plan>('workspace')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const passwordRequirements = [{ text: 'At least 8 characters', met: password.length >= 8 }]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      await register(email, password, name)
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
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
          <h1 className={styles.heading}>Create your account</h1>
          <p className={styles.subtitle}>Get started with JAY Workspace</p>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <div className={styles.planToggle}>
          <button
            className={`${styles.planOption} ${plan === 'workspace' ? styles.planOptionActive : ''}`}
            onClick={() => setPlan('workspace')}
          >
            <Globe size={14} />
            JAY Workspace
          </button>
          <button
            className={`${styles.planOption} ${plan === 'campus' ? styles.planOptionActive : ''}`}
            onClick={() => setPlan('campus')}
          >
            <GraduationCap size={14} />
            JAY Campus
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>Name</label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder={plan === 'campus' ? 'you@school.edu' : 'you@company.com'}
            />
            {plan === 'campus' && (
              <span className={styles.hint}>Use your .edu email for free access</span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              placeholder="Create a password"
            />
            <ul className={styles.requirements}>
              {passwordRequirements.map((req, i) => (
                <li key={i} className={req.met ? styles.reqMet : styles.reqUnmet}>
                  {req.met ? '\u2713' : '\u25CB'} {req.text}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.field}>
            <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading
              ? 'Creating account...'
              : plan === 'campus'
                ? 'Get JAY Campus free'
                : 'Start free trial'
            }
          </Button>
        </form>

        <div className={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" className={styles.link}>Sign in</Link>
        </div>
      </div>
    </div>
  )
}
