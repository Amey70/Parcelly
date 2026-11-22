import type { CarrierId, Customer, Period, Shipment } from './data'
import { carriers, referenceDate } from './data'

export const formatNumber = (n: number) => n.toLocaleString('en-US')
export const initials = (name: string) => name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase()
export const getCarrier = (id: CarrierId) => carriers.find(c => c.id === id)!
export const formatDate = (date: string, withYear = false) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', ...(withYear ? { year: 'numeric' as const } : {}) }).format(new Date(date))
export const statusClass = (status: string) => status.toLowerCase().replaceAll(' ', '-')

export function inPeriod(shipment: Shipment, period: Period) {
  if (shipment.isLocal || period === 'all') return true
  const days = (referenceDate.getTime() - new Date(shipment.created).getTime()) / 86400000
  return days >= 0 && days < (period === 'week' ? 7 : 30)
}

export function readStorage<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(`parcelly-${key}`); return raw ? JSON.parse(raw) as T : fallback } catch { return fallback }
}

export function writeStorage(key: string, value: unknown) {
  try { localStorage.setItem(`parcelly-${key}`, JSON.stringify(value)); return true } catch { return false }
}

export function normalizeTracking(number: string) { return number.replace(/[\s-]/g, '').toUpperCase() }

export function detectCarrier(number: string, shipments: Shipment[]): CarrierId | null {
  const normalized = normalizeTracking(number)
  const saved = shipments.find(s => normalizeTracking(s.tracking) === normalized && s.status !== 'Draft')
  if (saved) return saved.carrier
  if (/^1Z[A-Z0-9]{16}$/.test(normalized)) return 'ups'
  if (/^(92|93|94|95|96|97)\d{18,20}$/.test(normalized)) return 'usps'
  // Numeric formats overlap between carriers. Ask rather than route to the wrong one.
  return null
}

export function trackingUrl(carrier: CarrierId, number: string) {
  const encoded = encodeURIComponent(normalizeTracking(number))
  const urls: Record<CarrierId, string> = {
    dhl: `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${encoded}`,
    fedex: `https://www.fedex.com/fedextrack/?trknbr=${encoded}`,
    ups: `https://www.ups.com/track?loc=en_US&tracknum=${encoded}`,
    usps: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encoded}`,
    bluedart: 'https://www.bluedart.com/tracking',
    dtdc: 'https://www.dtdc.com/track-your-shipment/',
  }
  return urls[carrier]
}

function csvCell(value: string | number) {
  let text = String(value)
  if (/^[=+@\-\t\r]/.test(text)) text = `'${text}`
  return `"${text.replaceAll('"', '""')}"`
}

export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const csv = '\uFEFF' + [headers, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  const link = document.createElement('a')
  link.href = url; link.download = filename; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function exportShipments(shipments: Shipment[], customers: Customer[]) {
  downloadCsv('parcelly-shipments.csv', ['Shipment ID', 'Tracking number', 'Customer', 'Delivery partner', 'Status', 'Created', 'Destination', 'Weight (kg)'], shipments.map(s => [s.id, s.tracking, customers.find(c => c.id === s.customerId)?.name ?? '', getCarrier(s.carrier).name, s.status, formatDate(s.created, true), s.destination, s.weight]))
}
