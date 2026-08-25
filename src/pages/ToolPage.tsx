import { Suspense, useEffect, useMemo, useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Crown, Lock, Zap, LogIn } from 'lucide-react'
import { Button, DialogTrigger, Modal, Dialog, Meter } from 'react-aria-components'
import { getCategory, getTool, isPremiumTool, toolsByCategory } from '../lib/tools'
import { TOOL_COMPONENTS } from '../lib/toolComponents'
import { useMeta } from '../lib/utils'
import { useAuth } from '../lib/auth'
import { useServerUsage } from '../lib/usage'
import { BreadcrumbNav, ToastRegionWrapper } from '../components/rac'
import AdSlot from '../components/AdSlot'
import ErrorBoundary from '../components/ErrorBoundary'
import { Spinner } from '../components/ui'
import { NotFound } from './StaticPages'

function AuthRequiredGate() {
  return (
    <div className="card" style={{ maxWidth: '32rem', margin: '0 auto', padding: 'var(--sp-8)', textAlign: 'center' }}>
      <div style={{
        width: '4rem', height: '4rem', borderRadius: 'var(--radius-xl)',
        background: 'linear-gradient(135deg, var(--accent-5), #7c3aed)', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
      }}>
        <LogIn size={32} />
      </div>
      <h2 style={{ marginTop: 'var(--sp-4)', fontSize: 'var(--text-2xl)', fontWeight: 800 }}>Account required</h2>
      <p style={{ marginTop: 'var(--sp-2)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
        This is a premium tool. Create a free account to use it (1 use/day) or go Pro for unlimited access.
      </p>
      <div style={{ marginTop: 'var(--sp-6)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        <Link to="/signup" style={{ textDecoration: 'none' }}><Button data-variant="primary" style={{ width: '100%' }}>Create free account</Button></Link>
        <Link to="/login" style={{ textDecoration: 'none' }}><Button style={{ width: '100%' }}>Already have an account? Log in</Button></Link>
      </div>
    </div>
  )
}

function PremiumGate({ onUse, usesLeft }: { onUse: () => void; usesLeft: number }) {
  const [showModal, setShowModal] = useState(false)
  return (
    <>
      <div className="card" style={{ maxWidth: '32rem', margin: '0 auto', padding: 'var(--sp-8)', textAlign: 'center' }}>
        <div style={{
          width: '4rem', height: '4rem', borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, #f59e0b, #ea580c)', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
        }}>
          <Lock size={32} />
        </div>
        <h2 style={{ marginTop: 'var(--sp-4)', fontSize: 'var(--text-2xl)', fontWeight: 800 }}>Premium Tool</h2>
        <p style={{ marginTop: 'var(--sp-2)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          Free accounts get <strong>1 use per day</strong>. Pro users get <strong>unlimited access</strong>.
        </p>
        {/* Usage meter */}
        <div style={{ maxWidth: '16rem', margin: 'var(--sp-4) auto' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 'var(--sp-1)' }}>
              <span>Daily uses</span>
              <span>{usesLeft} use{usesLeft !== 1 ? 's' : ''} remaining</span>
            </div>
            <Meter value={usesLeft > 0 ? 0 : 100} maxValue={100} />
          </div>
        </div>
        <div style={{ marginTop: 'var(--sp-6)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          <Button data-variant="primary" onPress={onUse} style={{ background: '#d97706', borderColor: '#d97706', width: '100%' }}>
            <Zap size={16} /> Use free (1/day)
          </Button>
          <Button data-variant="ghost" onPress={() => setShowModal(true)} style={{ width: '100%' }}>
            <Crown size={16} /> Get Pro — unlimited
          </Button>
        </div>
      </div>
      <Modal isDismissable isOpen={showModal} onOpenChange={setShowModal}>
        <Dialog>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--sp-2)' }}>Unlock Unlimited Access</h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--sp-6)' }}>
            Upgrade to Pro for unlimited premium tool access, 100 AI generations per day, and zero ads — just $6/month.
          </p>
          <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'flex-end' }}>
            <Button slot="close" data-variant="ghost">Maybe later</Button>
            <Link to="/premium" style={{ textDecoration: 'none' }}><Button slot="close" data-variant="primary">Get Pro</Button></Link>
          </div>
        </Dialog>
      </Modal>
    </>
  )
}

export default function ToolPage() {
  const { id } = useParams()
  const tool = getTool(id ?? '')
  useMeta(
    tool ? `${tool.name} — Free Online Tool | OmniTools` : 'Not found — OmniTools',
    tool ? `${tool.blurb} 100% free, no sign-up required.` : undefined,
  )

  const Component = useMemo(() => (tool ? TOOL_COMPONENTS[tool.id] : undefined), [tool])
  const premium = isPremiumTool(tool?.id ?? '')
  const { user, loading: authLoading } = useAuth()
  const { usesLeft, isPro, loading: usageLoading, check, record } = useServerUsage('premium')

  useEffect(() => {
    if (premium && user) check()
  }, [premium, user, check])

  const hasAccount = !!user
  const hasAccess = !premium || (hasAccount && (isPro || (usesLeft !== null && usesLeft > 0)))

  const handleUse = useCallback(async () => {
    await record()
  }, [record])

  if (!tool || !Component) return <NotFound />
  const category = getCategory(tool.category)!
  const related = toolsByCategory(tool.category).filter((t) => t.id !== tool.id).slice(0, 4)

  if (premium && (authLoading || usageLoading)) {
    return (
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-16)', color: 'var(--text-secondary)' }}>
        <Spinner /> Checking access…
      </div>
    )
  }

  return (
    <div>
      {/* Breadcrumbs */}
      <BreadcrumbNav items={[
        { label: 'Home', href: '/' },
        { label: category.label, href: `/c/${category.id}` },
        { label: tool.name },
      ]} />

      {/* Header */}
      <div style={{ marginTop: 'var(--sp-4)', marginBottom: 'var(--sp-6)', display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-4)' }}>
        <span style={{
          flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '3.5rem', height: '3.5rem', borderRadius: 'var(--radius-xl)',
          background: `linear-gradient(135deg, ${category.gradient})`, color: 'white',
        }}>
          <tool.icon size={28} />
        </span>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, letterSpacing: '-0.02em' }}>{tool.name}</h1>
            {premium && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-1)',
                background: '#fef3c7', color: '#92400e',
                padding: '2px 10px', borderRadius: 'var(--radius-full)',
                fontSize: 'var(--text-xs)', fontWeight: 600,
              }}>
                <Crown size={12} /> Premium
              </span>
            )}
          </div>
          <p style={{ marginTop: 'var(--sp-1)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{tool.blurb}</p>
        </div>
      </div>

      <AdSlot slot="2222222222" format="horizontal" className="mb-6 min-h-[90px]" />

      {premium && !hasAccount ? (
        <AuthRequiredGate />
      ) : premium && !hasAccess ? (
        <PremiumGate onUse={handleUse} usesLeft={usesLeft ?? 0} />
      ) : (
        <Suspense fallback={
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-16)', color: 'var(--text-secondary)' }}>
            <Spinner /> Loading tool…
          </div>
        }>
          <ErrorBoundary>
            <Component />
          </ErrorBoundary>
        </Suspense>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: `${tool.name} — OmniTools`,
            applicationCategory: 'UtilityApplication',
            operatingSystem: 'Any (web browser)',
            url: `https://omnitoolsapp.pages.dev/t/${tool.id}`,
            description: tool.blurb,
            offers: { '@type': 'Offer', price: premium ? '6' : '0', priceCurrency: 'USD' },
          }),
        }}
      />

      {/* Related tools */}
      {related.length > 0 && (
        <section style={{ marginTop: 'var(--sp-12)' }}>
          <h2 style={{ marginBottom: 'var(--sp-4)', fontSize: 'var(--text-xl)', fontWeight: 700 }}>More {category.label.toLowerCase()}</h2>
          <div style={{ display: 'grid', gap: 'var(--sp-4)', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {related.map((t) => (
              <Link key={t.id} to={`/t/${t.id}`} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
                <t.icon size={20} style={{ color: 'var(--accent-5)' }} />
                <span style={{ marginTop: 'var(--sp-2)', display: 'block', fontWeight: 600, fontSize: 'var(--text-sm)' }}>{t.name}</span>
                {isPremiumTool(t.id) && <span style={{ marginTop: 'var(--sp-1)', display: 'inline-block', background: '#fef3c7', color: '#92400e', padding: '1px 6px', borderRadius: 'var(--radius-full)', fontSize: '9px', fontWeight: 700 }}>PRO</span>}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
