import { useState } from 'react'
import { ArrowRight, ChevronDown, ExternalLink, PackageSearch, Radar } from 'lucide-react'
import { carriers } from '../lib/data'
import type { CarrierId } from '../lib/data'

export default function TrackingForm({ onTrack, expanded = false }: { onTrack: (number: string, carrier: CarrierId | 'auto') => void; expanded?: boolean }) {
  const [number, setNumber] = useState('')
  const [carrier, setCarrier] = useState<CarrierId | 'auto'>('auto')
  const [error, setError] = useState('')
  return <section className={`tracking-card ${expanded ? 'tracking-card-expanded' : ''}`}>
    <div className="tracking-copy"><span className="eyebrow"><Radar size={13}/> A LITTLE PEACE OF MIND</span><h2>Where’s your parcel?</h2><p>Every partner. Every parcel. One place to track.</p></div>
    <img className="parcel-illustration" src="/images/parcel-illustration.png" alt="A parcel with a floating orange location pin" />
    <form className="tracking-form" onSubmit={e => { e.preventDefault(); if (!/^[A-Za-z0-9][A-Za-z0-9\s-]{4,44}[A-Za-z0-9]$/.test(number.trim())) { setError('Enter a valid tracking number (6–46 letters or numbers).'); return } setError(''); onTrack(number.trim(), carrier) }}>
      <div className="tracking-input-wrap"><PackageSearch size={18}/><input aria-label="Parcel tracking number" placeholder="Enter your tracking number" value={number} onChange={e => { setNumber(e.target.value); setError('') }} autoComplete="off" /></div>
      <div className="tracking-select"><select aria-label="Tracking delivery partner" value={carrier} onChange={e => setCarrier(e.target.value as CarrierId | 'auto')}><option value="auto">Auto-detect</option>{carriers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><ChevronDown size={12}/></div>
      <button type="submit" className="button button-primary"><span>Track parcel</span><ArrowRight size={16}/></button>
    </form>
    {error ? <p className="tracking-footnote form-error" role="alert">{error}</p> : <p className="tracking-footnote"><ExternalLink size={11}/> Opens your delivery partner’s official tracking page.</p>}
  </section>
}
