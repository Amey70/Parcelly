import type { CarrierId, Customer, ShipmentStatus } from '../lib/data'
import { initials, statusClass } from '../lib/utils'

export function BrandMark({ small = false }: { small?: boolean }) {
  return <svg className={small ? 'brand-mark small' : 'brand-mark'} viewBox="0 0 40 40" fill="none" aria-hidden="true"><rect width="40" height="40" rx="12" fill="currentColor"/><path d="m20 9 11 6.4v12L20 34 9 27.4v-12L20 9Z" fill="white" fillOpacity=".96"/><path d="m9 15.4 11 6.4 11-6.4M20 21.8V34M14.5 12.2l11 6.4v5.7" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M9 15.4 20 9l11 6.4" stroke="white" strokeWidth="1.3" strokeLinejoin="round"/></svg>
}

export function CourierLogo({ carrier, compact = false }: { carrier: CarrierId; compact?: boolean }) {
  return <span className={`courier-logo logo-${carrier} ${compact ? 'compact' : ''}`} aria-label={carrier === 'bluedart' ? 'Blue Dart' : carrier.toUpperCase()}>
    {carrier === 'dhl' && <svg viewBox="0 0 100 35" role="img" aria-label="DHL"><rect width="100" height="35" rx="4" fill="#FFDD00"/><path d="M3 14h16m-16 4h14m-14 4h12m65-8h17m-19 4h19m-21 4h21" stroke="#D40511" strokeWidth="2"/><text x="19" y="26" fill="#D40511" fontFamily="Arial,sans-serif" fontWeight="900" fontStyle="italic" fontSize="28" letterSpacing="-2">DHL</text></svg>}
    {carrier === 'fedex' && <span className="fedex-word">Fed<span>Ex</span><sup>®</sup></span>}
    {carrier === 'ups' && <span className="ups-word"><svg viewBox="0 0 41 46" aria-hidden="true"><path d="M3 5Q20-2 38 5v21c0 9-18 18-18 18S3 36 3 26V5Z" fill="#513522" stroke="#A7853D" strokeWidth="2"/><path d="M4 10Q20 5 37 8" fill="none" stroke="#C5A15B"/><text x="8" y="28" fontFamily="Arial,sans-serif" fontSize="21" fontWeight="600" fill="#F8DC8A" letterSpacing="-2">ups</text></svg>{!compact && <span>UPS</span>}</span>}
    {carrier === 'usps' && <span className="usps-word"><svg viewBox="0 0 46 31" aria-hidden="true"><path d="M6 2h39l-6 27H0L6 2Z" fill="#254A81"/><path d="M12 8h25l-3 4-8 2-7 9H7l6-11 16 1-17-5Z" fill="white"/><path d="m18 7 19 1-3 2-16-3Z" fill="white"/></svg><span>USPS<sup>®</sup></span></span>}
    {carrier === 'bluedart' && <span className="bluedart-word">Blue Dart<span>▸▸</span></span>}
    {carrier === 'dtdc' && <span className="dtdc-word"><i>❯</i> DTDC</span>}
  </span>
}

export function Avatar({ customer, size = 'normal' }: { customer: Pick<Customer, 'name' | 'color'>; size?: 'small' | 'normal' | 'large' }) {
  return <span className={`avatar avatar-${customer.color} avatar-${size}`} aria-hidden="true">{initials(customer.name)}</span>
}

export function StatusBadge({ status }: { status: ShipmentStatus }) {
  return <span className={`status-badge status-${statusClass(status)}`}><span />{status}</span>
}
