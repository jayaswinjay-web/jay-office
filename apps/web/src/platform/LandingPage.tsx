import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FolderOpen, FileText, Table, Presentation, StickyNote,
  Kanban, Mail, Video, CalendarDays, ListChecks, FileSignature,
  MessageSquare, Sparkles, Check, GraduationCap,
  Globe, Building2,
} from 'lucide-react'
import styles from './LandingPage.module.css'

type Plan = 'workspace' | 'campus'

const features = [
  { icon: FolderOpen, name: 'Drive', desc: 'Store, access, and share files securely in the cloud.' },
  { icon: FileText, name: 'Docs', desc: 'Create and collaborate on documents in real time.' },
  { icon: Table, name: 'Sheets', desc: 'Analyze data with powerful spreadsheets and formulas.' },
  { icon: Presentation, name: 'Slides', desc: 'Build stunning presentations with ease.' },
  { icon: StickyNote, name: 'Notes', desc: 'Capture ideas quickly with rich notes.' },
  { icon: Kanban, name: 'Tasks', desc: 'Manage projects with boards and lists.' },
  { icon: Mail, name: 'Mail', desc: 'Professional email with smart organization.' },
  { icon: Video, name: 'Meet', desc: 'Video meetings with screen sharing and recording.' },
  { icon: CalendarDays, name: 'Calendar', desc: 'Schedule and manage your events.' },
  { icon: ListChecks, name: 'Forms', desc: 'Create surveys and collect responses.' },
  { icon: FileSignature, name: 'Sign', desc: 'Send and sign documents digitally.' },
  { icon: MessageSquare, name: 'Chat', desc: 'Messaging and collaboration for teams.' },
]

const workspaceFeatures = [
  'Unlimited docs, sheets, and slides',
  '30 GB cloud storage per user',
  'Team messaging and video meetings',
  'Admin controls and security policies',
  'Email hosting with custom domain',
  '24/7 priority support',
]

const campusFeatures = [
  'Full access to all 12 apps',
  '10 GB cloud storage',
  'Collaborate with classmates',
  'Free for verified students',
  'No ads, no data mining',
  'Community support',
]

export function LandingPage() {
  const navigate = useNavigate()
  const [selectedPlan, setSelectedPlan] = useState<Plan>('workspace')

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      navigate('/drive', { replace: true })
    }
  }, [navigate])

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <div className={styles.navLeft}>
          <span className={styles.navLogo}>JAY Workspace</span>
          <div className={styles.navLinks}>
            <button className={styles.navLink} onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })}>
              Plans
            </button>
            <button className={styles.navLink} onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              Features
            </button>
            <button className={styles.navLink} onClick={() => document.getElementById('campus')?.scrollIntoView({ behavior: 'smooth' })}>
              JAY Campus
            </button>
          </div>
        </div>
        <div className={styles.navActions}>
          <button className={styles.heroCtaSecondary} onClick={() => navigate('/login')}>
            Sign in
          </button>
          <button className={styles.heroCtaPrimary} onClick={() => navigate('/register')}>
            Get started
          </button>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <Sparkles size={14} />
          The intelligent workspace for teams and students
        </div>
        <h1 className={styles.heroTitle}>
          <span className={styles.heroHighlight}>JAY Workspace</span>
          {' '}&amp;{' '}
          <span className={styles.heroHighlight}>JAY Campus</span>
        </h1>
        <p className={styles.heroSubtitle}>
          One platform. Two experiences. Whether you're building a business or
          pursuing an education, JAY gives you the tools to create, collaborate, and succeed.
        </p>
        <div className={styles.heroCta}>
          <button className={styles.heroCtaPrimary} onClick={() => navigate('/register')}>
            Start free trial
          </button>
          <button className={styles.heroCtaSecondary} onClick={() => navigate('/login')}>
            Sign in
          </button>
        </div>
      </section>

      <section id="plans" className={styles.plans}>
        <div className={styles.plansHeader}>
          <h2 className={styles.plansTitle}>Choose your workspace</h2>
          <p className={styles.plansSubtitle}>
            Built for professionals. Designed for students.
          </p>
        </div>

        <div className={styles.productToggle}>
          <button
            className={`${styles.productOption} ${selectedPlan === 'workspace' ? styles.productOptionActive : ''}`}
            onClick={() => setSelectedPlan('workspace')}
          >
            <Globe size={14} style={{ marginRight: 6, display: 'inline' }} />
            JAY Workspace
          </button>
          <button
            className={`${styles.productOption} ${selectedPlan === 'campus' ? styles.productOptionActive : ''}`}
            onClick={() => setSelectedPlan('campus')}
          >
            <GraduationCap size={14} style={{ marginRight: 6, display: 'inline' }} />
            JAY Campus
          </button>
        </div>

        <div className={styles.planGrid}>
          <div className={`${styles.planCard} ${selectedPlan === 'workspace' ? styles.planCardFeatured : ''}`}>
            {selectedPlan === 'workspace' && <div className={styles.planBadge}>Recommended</div>}
            <div className={styles.planEmoji}>
              <Building2 size={28} style={{ color: 'var(--color-brand)' }} />
            </div>
            <h3 className={styles.planName}>JAY Workspace</h3>
            <p className={styles.planTagline}>For businesses, teams, and professionals</p>
            <div className={styles.planPrice}>$12</div>
            <p className={styles.planPricePeriod}>per user / month, billed annually</p>
            <ul className={styles.planFeatures}>
              {workspaceFeatures.map((f) => (
                <li key={f} className={styles.planFeature}>
                  <Check size={14} className={styles.planFeatureIcon} />
                  {f}
                </li>
              ))}
            </ul>
            <button
              className={`${styles.planCta} ${selectedPlan === 'workspace' ? styles.planCtaPrimary : styles.planCtaSecondary}`}
              onClick={() => navigate('/register')}
            >
              {selectedPlan === 'workspace' ? 'Start free trial' : 'Choose Workspace'}
            </button>
          </div>

          <div className={`${styles.planCard} ${selectedPlan === 'campus' ? styles.planCardFeatured : ''}`}>
            {selectedPlan === 'campus' && <div className={styles.planBadge}>Popular</div>}
            <div className={styles.planEmoji}>
              <GraduationCap size={28} style={{ color: '#2e7d32' }} />
            </div>
            <h3 className={styles.planName}>JAY Campus</h3>
            <p className={styles.planTagline}>For students, teachers, and schools</p>
            <div className={styles.planPrice}>Free</div>
            <p className={styles.planPricePeriod}>for verified students &amp; educators</p>
            <ul className={styles.planFeatures}>
              {campusFeatures.map((f) => (
                <li key={f} className={styles.planFeature}>
                  <Check size={14} className={styles.planFeatureIcon} />
                  {f}
                </li>
              ))}
            </ul>
            <button
              className={`${styles.planCta} ${selectedPlan === 'campus' ? styles.planCtaPrimary : styles.planCtaSecondary}`}
              onClick={() => navigate('/register')}
            >
              {selectedPlan === 'campus' ? 'Get JAY Campus free' : 'Choose Campus'}
            </button>
          </div>
        </div>
      </section>

      <section id="features" className={styles.features}>
        <div className={styles.featuresHeader}>
          <h2 className={styles.featuresTitle}>One suite, endless possibilities</h2>
          <p className={styles.featuresSubtitle}>
            All 12 apps are available in both Workspace and Campus plans.
          </p>
        </div>
        <div className={styles.grid}>
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.name} className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <Icon size={20} />
                </div>
                <h3 className={styles.featureName}>{f.name}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section id="campus" className={styles.studentPerks}>
        <div className={styles.studentInner}>
          <div className={styles.studentContent}>
            <div className={styles.studentBadge}>
              <GraduationCap size={14} />
              JAY Campus
            </div>
            <h2 className={styles.studentTitle}>Built for students, by people who care</h2>
            <p className={styles.studentDesc}>
              JAY Campus is a completely free workspace for verified students and
              educators. Get the full power of JAY Workspace — docs, sheets,
              slides, mail, meet, and more — with storage and collaboration
              tailored for academic life.
            </p>
            <ul className={styles.studentPerksList}>
              <li className={styles.studentPerkItem}>
                <Check size={14} className={styles.studentPerkIcon} />
                Free with a valid .edu email
              </li>
              <li className={styles.studentPerkItem}>
                <Check size={14} className={styles.studentPerkIcon} />
                Collaborate with classmates in real time
              </li>
              <li className={styles.studentPerkItem}>
                <Check size={14} className={styles.studentPerkIcon} />
                Access from any device, anywhere
              </li>
              <li className={styles.studentPerkItem}>
                <Check size={14} className={styles.studentPerkIcon} />
                No credit card required, ever
              </li>
            </ul>
            <button className={styles.heroCtaPrimary} onClick={() => navigate('/register')}>
              Get JAY Campus free
            </button>
          </div>
          <div className={styles.studentVisual}>
            <GraduationCap size={80} style={{ color: '#2e7d32' }} />
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        &copy; {new Date().getFullYear()} JAY Workspace. All rights reserved. &middot; JAY Campus is a free offering for students and educators.
      </footer>
    </div>
  )
}
