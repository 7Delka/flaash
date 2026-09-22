import { useState, useRef, useEffect } from 'react'

const COUNTRIES = [
  { code: 'MX', flag: '🇲🇽', name: 'México',        dial: '+52' },
  { code: 'AR', flag: '🇦🇷', name: 'Argentina',     dial: '+54' },
  { code: 'US', flag: '🇺🇸', name: 'Estados Unidos', dial: '+1'  },
  { code: 'CA', flag: '🇨🇦', name: 'Canadá',        dial: '+1'  },
  { code: 'ES', flag: '🇪🇸', name: 'España',        dial: '+34' },
  { code: 'CO', flag: '🇨🇴', name: 'Colombia',      dial: '+57' },
  { code: 'CL', flag: '🇨🇱', name: 'Chile',         dial: '+56' },
  { code: 'PE', flag: '🇵🇪', name: 'Perú',          dial: '+51' },
  { code: 'BR', flag: '🇧🇷', name: 'Brasil',        dial: '+55' },
  { code: 'UY', flag: '🇺🇾', name: 'Uruguay',       dial: '+598' },
  { code: 'PY', flag: '🇵🇾', name: 'Paraguay',      dial: '+595' },
  { code: 'BO', flag: '🇧🇴', name: 'Bolivia',       dial: '+591' },
  { code: 'VE', flag: '🇻🇪', name: 'Venezuela',     dial: '+58' },
  { code: 'EC', flag: '🇪🇨', name: 'Ecuador',       dial: '+593' },
  { code: 'PA', flag: '🇵🇦', name: 'Panamá',        dial: '+507' },
  { code: 'GT', flag: '🇬🇹', name: 'Guatemala',     dial: '+502' },
  { code: 'CR', flag: '🇨🇷', name: 'Costa Rica',    dial: '+506' },
  { code: 'HN', flag: '🇭🇳', name: 'Honduras',      dial: '+504' },
  { code: 'SV', flag: '🇸🇻', name: 'El Salvador',   dial: '+503' },
  { code: 'NI', flag: '🇳🇮', name: 'Nicaragua',     dial: '+505' },
  { code: 'DO', flag: '🇩🇴', name: 'Rep. Dominicana', dial: '+1' },
  { code: 'CU', flag: '🇨🇺', name: 'Cuba',          dial: '+53' },
  { code: 'GB', flag: '🇬🇧', name: 'Reino Unido',   dial: '+44' },
  { code: 'FR', flag: '🇫🇷', name: 'Francia',       dial: '+33' },
  { code: 'DE', flag: '🇩🇪', name: 'Alemania',      dial: '+49' },
  { code: 'IT', flag: '🇮🇹', name: 'Italia',        dial: '+39' },
  { code: 'PT', flag: '🇵🇹', name: 'Portugal',      dial: '+351' },
]

interface Props {
  value: string
  onChange: (fullNumber: string) => void
  label?: string
  required?: boolean
}

export default function PhoneInput({ onChange, label = 'Teléfono', required }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(COUNTRIES[0]) // México default
  const [localNumber, setLocalNumber] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // Sync internal state → parent
  useEffect(() => {
    onChange(localNumber ? `${selected.dial} ${localNumber}` : '')
  }, [selected, localNumber])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Focus search when dropdown opens
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50)
  }, [open])

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.dial.includes(search)
  )

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.65rem', fontWeight: 700,
    letterSpacing: '0.15em', textTransform: 'uppercase',
    marginBottom: 6, color: 'rgba(12,12,12,0.55)',
  }
  const inputBase: React.CSSProperties = {
    background: '#FFFFFF', border: '1px solid rgba(212,175,55,0.3)',
    borderRadius: 10, color: '#0C0C0C', fontSize: '0.9rem', outline: 'none',
  }

  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', gap: 8, position: 'relative' }} ref={dropdownRef}>

        {/* Country selector button */}
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          style={{
            ...inputBase,
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 12px', cursor: 'pointer', flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{selected.flag}</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0C0C0C' }}>{selected.dial}</span>
          <span style={{ fontSize: '0.6rem', color: 'rgba(12,12,12,0.4)', marginLeft: 2 }}>▼</span>
        </button>

        {/* Dropdown */}
        {open && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, zIndex: 100,
            background: '#FFFFFF', border: '1px solid rgba(212,175,55,0.3)',
            borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            width: 260, marginTop: 4, overflow: 'hidden',
          }}>
            {/* Search */}
            <div style={{ padding: '8px 10px', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
              <input
                ref={searchRef}
                type="text"
                placeholder="Buscar país o código…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', border: 'none', outline: 'none',
                  fontSize: '0.85rem', color: '#0C0C0C', background: 'transparent',
                }}
              />
            </div>
            {/* List */}
            <div style={{ maxHeight: 220, overflowY: 'auto' }}>
              {filtered.length === 0 && (
                <p style={{ padding: '12px 14px', fontSize: '0.82rem', color: 'rgba(12,12,12,0.4)', margin: 0 }}>
                  Sin resultados
                </p>
              )}
              {filtered.map(c => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => { setSelected(c); setOpen(false); setSearch('') }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '9px 14px', border: 'none',
                    background: selected.code === c.code ? 'rgba(212,175,55,0.1)' : 'transparent',
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{c.flag}</span>
                  <span style={{ fontSize: '0.85rem', color: '#0C0C0C', flex: 1 }}>{c.name}</span>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(12,12,12,0.45)', fontWeight: 600 }}>{c.dial}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Number input */}
        <input
          type="tel"
          required={required}
          placeholder="11 5798 8854"
          value={localNumber}
          onChange={e => setLocalNumber(e.target.value.replace(/[^0-9\s\-]/g, ''))}
          style={{ ...inputBase, flex: 1, padding: '10px 14px' }}
        />
      </div>
    </div>
  )
}
