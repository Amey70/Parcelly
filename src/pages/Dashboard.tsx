import { useState } from 'react'
import { ArrowRight, ArrowUpRight, ChevronRight, UsersRound } from 'lucide-react'
import type { CarrierId, Customer, Page, Period, Shipment } from '../lib/data'
import { carriers } from '../lib/data'
import { Avatar, CourierLogo } from '../components/Brand'
import TrackingForm from '../components/TrackingForm'
import Metrics from '../components/Metrics'
import ShipmentTable from '../components/ShipmentTable'
import { formatNumber } from '../lib/utils'

interface DashboardProps {
  shipments: Shipment[]
  customers: Customer[]
  period: Period
  onNavigate: (page: Page) => void
  onCreate: (carrier?: CarrierId) => void
  onShipment: (shipment: Shipment) => void
  onCustomer: (customer: Customer) => void
  onTrack: (number: string, carrier: CarrierId | 'auto') => void
}

export default function Dashboard({ shipments, customers, period, onNavigate, onCreate, onShipment, onCustomer, onTrack }: DashboardProps) {
  const [recentTab, setRecentTab] = useState('All shipments')
  const visible = shipments.filter(s => recentTab === 'All shipments' || s.status === recentTab).slice(0, 5)
  const stats = [
    { label: 'Delivered', value: shipments.filter(s => s.status === 'Delivered').length, color: '#f47b3e' },
    { label: 'In transit', value: shipments.filter(s => s.status === 'In transit').length, color: '#ffbc8f' },
    { label: 'Out for delivery', value: shipments.filter(s => s.status === 'Out for delivery').length, color: '#f5dcc9' },
    { label: 'Exceptions', value: shipments.filter(s => s.status === 'Exception').length, color: '#b6bfce' },
    ...(shipments.some(s => s.status === 'Draft') ? [{ label: 'Drafts', value: shipments.filter(s => s.status === 'Draft').length, color: '#b4a1d6' }] : []),
  ]
  let accumulated = 0
  const gradient = stats.map(stat => { const start = accumulated; accumulated += stat.value / Math.max(shipments.length, 1) * 100; return `${stat.color} ${start}% ${accumulated}%` }).join(',')
  const customerCounts = customers.map(c => ({ customer: c, count: shipments.filter(s => s.customerId === c.id).length })).filter(c => c.count > 0).sort((a, b) => b.count - a.count)
  const deliveredPercent = shipments.length ? (stats[0].value / shipments.length * 100).toFixed(1) : '0'
  return <div className="dashboard-content">
    <Metrics shipments={shipments} period={period}/>
    <div className="tracking-overview-row">
      <TrackingForm onTrack={onTrack}/>
      <section className="card delivery-overview"><div className="card-heading"><h2>Delivery overview</h2><button className="icon-button" aria-label="View delivery analytics" onClick={() => onNavigate('analytics')}><ArrowUpRight size={17}/></button></div><div className="overview-chart-row"><div className="donut-chart" style={{ background: shipments.length ? `conic-gradient(${gradient})` : '#eceef1' }} role="img" aria-label={`${deliveredPercent}% of shipments delivered`}><div className="donut-center"><strong>{formatNumber(shipments.length)}</strong><span>Total shipments</span></div></div><div className="chart-legend">{stats.map(stat => <div key={stat.label}><span className="legend-dot" style={{ background: stat.color }}/><span>{stat.label}</span><strong>{formatNumber(stat.value)}</strong></div>)}</div></div><div className="overview-footer"><span className="positive"><ArrowUpRight size={13}/>{deliveredPercent}%</span><span>of your parcels have reached their destination</span></div></section>
    </div>
    <section className="partners-section"><div className="section-heading"><div><h2>Your delivery partners <span className="count-badge">{carriers.length}</span></h2><p>Great deliveries start with the right partner.</p></div><button className="text-link" onClick={() => onNavigate('partners')}>View all partners <ArrowRight size={15}/></button></div><div className="partner-card-grid">{carriers.slice(0, 4).map(carrier => <article className="partner-card" key={carrier.id}><div className="partner-card-top"><CourierLogo carrier={carrier.id}/><span className="partner-connected"><span/>Available</span></div><div className="partner-card-info"><h3>{carrier.name}</h3><span>{carrier.tagline}</span></div><button className="partner-ship-button" onClick={() => onCreate(carrier.id)}>Ship with {carrier.shortName}<ArrowRight size={14}/></button></article>)}</div></section>
    <div className="recent-customers-row">
      <section className="card recent-shipments"><div className="card-heading"><div className="heading-with-count"><h2>Recent shipments</h2><span className="count-badge">{formatNumber(shipments.length)}</span></div><button className="subtle-link" onClick={() => onNavigate('shipments')}>View all<ArrowUpRight size={14}/></button></div><div className="card-tabs">{['All shipments', 'In transit', 'Delivered'].map(tab => <button key={tab} className={recentTab === tab ? 'active' : ''} onClick={() => setRecentTab(tab)}>{tab}</button>)}</div><ShipmentTable shipments={visible} customers={customers} onSelect={onShipment} compact/><div className="table-card-footer"><span>Showing {visible.length} of {formatNumber(shipments.filter(s => recentTab === 'All shipments' || s.status === recentTab).length)} shipments</span><span className="live-indicator"><span/>Up to date</span></div></section>
      <section className="card top-customers"><div className="card-heading"><h2>Top customers</h2><span className="muted"><UsersRound size={18}/></span></div><p className="card-description">A few of your frequent shippers.</p><div className="customer-list">{customerCounts.slice(0, 4).map(({ customer, count }) => <button className="customer-list-item" key={customer.id} onClick={() => onCustomer(customer)}><Avatar customer={customer}/><span className="customer-list-info"><strong>{customer.name}</strong><span>{customer.company}</span></span><span className="customer-list-count"><strong>{count}</strong><span>shipments</span></span></button>)}</div><div className="customer-summary"><div className="avatar-stack">{customerCounts.slice(0, 3).map(({ customer }) => <Avatar key={customer.id} customer={customer} size="small"/>)}<span>+{Math.max(0, customerCounts.length - 3)}</span></div><span>Good company.<br/><strong>Even better deliveries.</strong></span></div><button className="card-bottom-link" onClick={() => onNavigate('customers')}>View all customers<ChevronRight size={15}/></button></section>
    </div>
    <div className="dashboard-footer"><span><span className="tiny-brand-dot"/> A little order. A lot of possibility.</span><span>Sample workspace · All shipment and customer data is illustrative</span></div>
  </div>
}
