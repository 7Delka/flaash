import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'

// ─────────────────────────────────────────────────────────────────────────────
// WEB3FORMS — los correos llegan a office@corpbsm.com
// ─────────────────────────────────────────────────────────────────────────────
const WEB3FORMS_KEY = 'e393f6f0-6569-4a54-b559-b59733a7d93c'
const CONTACT_EMAIL = 'office@corpbsm.com'

const WA_PHONES = [
  { label: '+54 9 11-5798-8854', num: '5491157988854' },
  { label: '+52 55 3185 6985', num: '525531856985' },
]

function waHref(num: string, lang: 'en' | 'es') {
  const msg = lang === 'es'
    ? encodeURIComponent('Hola, me gustaría consultar sobre Flaash.')
    : encodeURIComponent('Hello, I would like to inquire about Flaash.')
  return `https://wa.me/${num}?text=${msg}`
}

const WA_ICON = (
  <svg viewBox="0 0 24 24" fill="#25D366" className="w-4 h-4 flex-shrink-0">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

const GMAIL_ICON = (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" fill="#EA4335" />
  </svg>
)

/* ─── Input styles (dark) ─── */
const inputBase: React.CSSProperties = {
  width: '100%',
  background: '#FFFFFF',
  border: '1px solid rgba(212,175,55,0.3)',
  borderRadius: 10,
  padding: '10px 14px',
  color: '#0C0C0C',
  fontSize: '0.875rem',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s',
}

const applyGold = (el: HTMLElement) => {
  el.style.webkitTextFillColor = '#D4AF37'
  el.style.color = '#D4AF37'
}
const removeGold = (el: HTMLElement, fallback = 'rgba(12,12,12,0.65)') => {
  el.style.webkitTextFillColor = fallback
  el.style.color = fallback
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  window.dispatchEvent(new CustomEvent('flaash-reset-hero'))
}

function ContactForm() {
  const { t, lang } = useLanguage()
  const c = t.contact
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', subject: '', message: '' })
  const [files, setFiles] = useState<FileList | null>(null)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files)
  }

  const removeFiles = () => {
    setFiles(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const data = new FormData()
      data.append('access_key', WEB3FORMS_KEY)
      data.append('name', `${form.firstName} ${form.lastName}`)
      data.append('email', form.email)
      data.append('subject', form.subject || (lang === 'es' ? 'Consulta desde Flaash Website' : 'Inquiry from Flaash Website'))
      data.append('message', form.message)
      data.append('from_name', 'Flaash Website')
      data.append('replyto', form.email)
      if (files) {
        Array.from(files).forEach(file => data.append('attachment[]', file))
      }

      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: data,
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message || 'Error')

      setSent(true)
      setForm({ firstName: '', lastName: '', email: '', subject: '', message: '' })
      removeFiles()
      setTimeout(() => setSent(false), 4000)
    } catch {
      setError(lang === 'es'
        ? `⚠ No se pudo enviar. Escribinos directamente a ${CONTACT_EMAIL}`
        : `⚠ Could not send. Please email us directly at ${CONTACT_EMAIL}`)
    }
  }

  /* ─── Label style (plain gold color) ─── */
  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.6rem',
    fontWeight: 700,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    marginBottom: 6,
    color: 'rgba(212,175,55,0.6)',
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: '#FFFFFF',
        border: '1px solid rgba(212,175,55,0.22)',
        borderRadius: 24,
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}
    >
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>{c.firstName}</label>
          <input required type="text" placeholder={c.firstNamePlaceholder} value={form.firstName} onChange={set('firstName')} style={inputBase}
            onFocus={e => (e.target.style.borderColor = 'rgba(200,160,40,0.7)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(212,175,55,0.3)')} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>{c.lastName}</label>
          <input required type="text" placeholder={c.lastNamePlaceholder} value={form.lastName} onChange={set('lastName')} style={inputBase}
            onFocus={e => (e.target.style.borderColor = 'rgba(200,160,40,0.7)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(212,175,55,0.3)')} />
        </div>
      </div>

      <div>
        <label style={labelStyle}>{c.email}</label>
        <input required type="email" placeholder={c.emailPlaceholder} value={form.email} onChange={set('email')} style={inputBase}
          onFocus={e => (e.target.style.borderColor = 'rgba(200,160,40,0.5)')}
          onBlur={e => (e.target.style.borderColor = 'rgba(212,175,55,0.3)')} />
      </div>

      <div>
        <label style={labelStyle}>{c.subject}</label>
        <input required type="text" placeholder={c.subjectPlaceholder} value={form.subject} onChange={set('subject')} style={inputBase}
          onFocus={e => (e.target.style.borderColor = 'rgba(200,160,40,0.5)')}
          onBlur={e => (e.target.style.borderColor = 'rgba(212,175,55,0.3)')} />
      </div>

      {/* File upload */}
      <div>
        <label style={labelStyle}>{c.photos}</label>
        <label
          style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
            background: '#FAFAF8', border: '1px dashed rgba(200,160,40,0.35)',
            borderRadius: 10, padding: '10px 14px', cursor: 'pointer', transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(200,160,40,0.6)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(200,160,40,0.3)')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="rgba(200,160,40,0.6)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18, flexShrink: 0 }}>
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <span style={{ fontSize: '0.8rem', color: files && files.length > 0 ? '#C8A028' : 'rgba(12,12,12,0.4)', flex: 1 }}>
            {files && files.length > 0
              ? `${files.length} ${files.length === 1 ? (lang === 'es' ? 'archivo' : 'file') : (lang === 'es' ? 'archivos' : 'files')} ${lang === 'es' ? 'seleccionados' : 'selected'}`
              : c.photosHint}
          </span>
          {files && files.length > 0 && (
            <button type="button" onClick={e => { e.preventDefault(); removeFiles() }}
              style={{ background: 'none', border: 'none', color: 'rgba(245,240,232,0.35)', cursor: 'pointer', padding: 2, lineHeight: 1 }}>
              <svg viewBox="0 0 16 16" fill="currentColor" style={{ width: 14, height: 14 }}>
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
              </svg>
            </button>
          )}
          <input ref={fileInputRef} type="file" name="photos"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
            multiple onChange={handleFiles} style={{ display: 'none' }} />
        </label>
        {files && files.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {Array.from(files).map((file, i) => (
              <div key={i} style={{ width: 52, height: 52, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(212,175,55,0.2)', flexShrink: 0 }}>
                <img src={URL.createObjectURL(file)} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label style={labelStyle}>{c.message}</label>
        <textarea required rows={4} placeholder={c.messagePlaceholder} value={form.message} onChange={set('message')}
          style={{ ...inputBase, resize: 'vertical', minHeight: 110 }}
          onFocus={e => (e.target.style.borderColor = 'rgba(200,160,40,0.5)')}
          onBlur={e => (e.target.style.borderColor = 'rgba(212,175,55,0.3)')} />
      </div>

      {error && (
        <p style={{ fontSize: '0.78rem', color: 'rgba(255,100,100,0.85)', margin: 0, lineHeight: 1.5 }}>{error}</p>
      )}

      <button
        type="submit"
        className="w-full font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer hover:opacity-90 active:scale-[0.98]"
        style={{ padding: '12px 24px', borderRadius: 10, fontSize: '0.75rem', background: 'linear-gradient(105deg, #7A4800 0%, #C8860A 18%, #E8B020 32%, #F5CC40 50%, #E8B020 68%, #C8860A 82%, #7A4800 100%)', color: '#0C0C0C', marginTop: 4 }}
      >
        {sent ? c.sent : c.send}
      </button>
    </motion.form>
  )
}

export default function ContactFooter() {
  const { t, lang } = useLanguage()
  const c = t.contact

  return (
    <footer
      id="contacto"
      className="relative w-full"
      style={{ background: '#17171A', borderTop: '1px solid rgba(212,175,55,0.25)', zIndex: 30 }}
    >
      {/* ── CONTACT SECTION ── */}
      <div className="max-w-5xl mx-auto px-6 sm:px-10 pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Left — info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-8"
          >
            <div>
              <span className="block font-black uppercase tracking-[0.3em] mb-3"
                style={{ fontSize: '0.6rem', color: 'rgba(212,175,55,0.5)' }}>
                {c.badge}
              </span>
              <h2 className="gold-chrome-text-full font-black uppercase leading-none tracking-tight mb-4"
                style={{ fontSize: 'clamp(2.4rem, 5vw, 56px)' }}>
                {c.heading}
              </h2>
              <div style={{ width: 36, height: 1, background: 'linear-gradient(to right, #A06800, transparent)', marginBottom: '1.2rem' }} />
              <p className="font-light leading-relaxed" style={{ fontSize: '0.9rem', color: 'rgba(245,240,232,0.6)', maxWidth: '38ch' }}>
                {c.description}
              </p>
            </div>

            <div className="flex flex-col gap-5">
              {/* WhatsApp */}
              <div>
                <span className="block font-black uppercase tracking-[0.25em] mb-3"
                  style={{ fontSize: '0.55rem', color: 'rgba(212,175,55,0.45)' }}>
                  {c.whatsappLabel}
                </span>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
                  {WA_PHONES.map((n) => (
                    <a key={n.num} href={waHref(n.num, lang)} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-sm font-medium transition-all duration-200 hover:scale-[1.02] w-fit"
                      style={{ color: 'rgba(245,240,232,0.7)', fontVariantNumeric: 'lining-nums tabular-nums' }}
                      onMouseEnter={e => applyGold(e.currentTarget)}
                      onMouseLeave={e => removeGold(e.currentTarget, 'rgba(245,240,232,0.7)')}>
                      {WA_ICON}
                      {n.label}
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <span className="block font-black uppercase tracking-[0.25em] mb-2"
                  style={{ fontSize: '0.55rem', color: 'rgba(212,175,55,0.45)' }}>
                  {c.emailLabel}
                </span>
                <a href={`mailto:${CONTACT_EMAIL}`}
                  className="flex items-center gap-2 text-sm font-medium transition-colors duration-200 w-fit"
                  style={{ color: 'rgba(245,240,232,0.7)' }}
                  onMouseEnter={e => applyGold(e.currentTarget)}
                  onMouseLeave={e => removeGold(e.currentTarget, 'rgba(245,240,232,0.7)')}>
                  {GMAIL_ICON}
                  {CONTACT_EMAIL}
                </a>
              </div>
            </div>
          </motion.div>

          {/* Right — form */}
          <ContactForm />
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div className="max-w-5xl mx-auto px-6 sm:px-10">
        <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.25), transparent)' }} />
      </div>

      {/* ── BOTTOM FOOTER ── */}
      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">

        <div className="flex flex-col items-center sm:items-start gap-0.5">
          <span className="gold-chrome-text font-black uppercase tracking-[0.25em] text-lg">Flaash</span>
          <span className="text-[0.6rem] font-light uppercase tracking-[0.3em]" style={{ color: 'rgba(212,175,55,0.4)' }}>Retail &amp; Wholesale</span>
        </div>

        <p className="text-xs order-last sm:order-none" style={{ color: 'rgba(245,240,232,0.35)' }}>
          {t.footer.copyright}
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={scrollToTop}
            aria-label="Back to top"
            className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 hover:scale-110 cursor-pointer"
            style={{ border: '1px solid rgba(212,175,55,0.3)', background: 'transparent', color: 'rgba(212,175,55,0.5)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#C8A028'; e.currentTarget.style.borderColor = '#A06800' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(212,175,55,0.5)'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  )
}
