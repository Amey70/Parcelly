import { ArrowUpRight, CheckCheck, Package, Truck, UsersRound } from 'lucide-react'
import type { Period, Shipment } from '../lib/data'
import { seedShipments } from '../lib/data'
import { formatNumber } from '../lib/utils'

export default function Metrics({ shipments, period }: { shipments: Shipment[]; period: Period }) {
  const previous = seedShipments.slice(1284)
  const count = (data: Shipment[]) => [data.length, data.filter(s => s.status === 'In transit').length, data.filter(s => s.status === 'Delivered').length, new Set(data.map(s => s.customerId)).size]
  const values = count(shipments), oldValues = count(previous)
  const cards = [
    { label: 'Total shipments', icon: Package, color: 'orange' },
    { label: 'In transit', icon: Truck, color: 'blue' },
    { label: 'Delivered', icon: CheckCheck, color: 'green' },
    { label: 'Total customers', icon: UsersRound, color: 'purple' },
  ]
  return <div className="metrics-grid">{cards.map((card, index) => { const Icon = card.icon; const change = ((values[index] - oldValues[index]) / Math.max(oldValues[index], 1)) * 100; return <section className={`metric-card metric-${card.color}`} key={card.label}>
    <div className="metric-top"><span>{card.label}</span><span className="metric-icon"><Icon size={18} strokeWidth={1.8}/></span></div>
    <div className="metric-value">{formatNumber(values[index])}</div>
    <div className="metric-bottom"><span className="metric-comparison">{period === 'week' ? <><span className={change >= 0 ? 'positive' : 'neutral'}><ArrowUpRight size={12}/>{change >= 0 ? '+' : ''}{change.toFixed(1)}%</span><span>vs. last week</span></> : <span>in selected period</span>}</span><svg className="sparkline" viewBox="0 0 75 28" fill="none" aria-hidden="true"><path d={index % 2 ? 'M1 24L8 18L15 21L23 13L30 18L38 9L45 12L53 5L61 9L68 3L74 5' : 'M1 23L8 25L15 17L23 20L30 10L38 14L45 10L53 13L61 5L68 8L74 2'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
  </section>})}</div>
}
