import { useMemo, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, Download, Search, SlidersHorizontal, X } from 'lucide-react'
import type { CarrierId, Customer, Shipment } from '../lib/data'
import { carriers, statusOptions } from '../lib/data'
import { exportShipments, formatNumber } from '../lib/utils'
import ShipmentTable from '../components/ShipmentTable'

export default function Shipments({ shipments, customers, onSelect, notify }: { shipments: Shipment[]; customers: Customer[]; onSelect: (shipment: Shipment) => void; notify: (message: string) => void }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All shipments')
  const [carrier, setCarrier] = useState<CarrierId | 'all'>('all')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const filtered = useMemo(() => shipments.filter(s => {
    const customer = customers.find(c => c.id === s.customerId)
    return (status === 'All shipments' || s.status === status) && (carrier === 'all' || s.carrier === carrier) && `${s.id} ${s.tracking} ${customer?.name} ${s.destination}`.toLowerCase().includes(query.toLowerCase())
  }), [shipments, customers, query, status, carrier])
  const pageCount = Math.max(1, Math.ceil(filtered.length / 12))
  const activePage = Math.min(page, pageCount)
  const visible = filtered.slice((activePage - 1) * 12, activePage * 12)
  const toggle = (id: string) => setSelected(current => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next })
  const exportData = () => { const data = selected.size ? shipments.filter(s => selected.has(s.id)) : filtered; exportShipments(data, customers); notify(`Exported ${formatNumber(data.length)} shipments to CSV.`) }
  return <section className="card full-table-card">
    <div className="table-toolbar"><div className="search-field"><Search size={17}/><input aria-label="Search shipments" placeholder="Search ID, tracking number, or customer..." value={query} onChange={e => { setQuery(e.target.value); setPage(1) }}/>{query && <button onClick={() => { setQuery(''); setPage(1) }} aria-label="Clear shipment search"><X size={15}/></button>}</div><div className="toolbar-actions"><button className={`button button-secondary ${showFilters ? 'selected-button' : ''}`} onClick={() => setShowFilters(!showFilters)}><SlidersHorizontal size={15}/>Filters{carrier !== 'all' && <span className="filter-dot"/>}</button><button className="button button-secondary" onClick={exportData} disabled={!filtered.length && !selected.size}><Download size={15}/>{selected.size ? `Export ${selected.size} selected` : 'Export'}</button></div></div>
    {showFilters && <div className="expanded-filters"><label>Delivery partner<div className="select-wrap"><select value={carrier} onChange={e => { setCarrier(e.target.value as CarrierId | 'all'); setPage(1) }}><option value="all">All delivery partners</option>{carriers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><ChevronDown size={14}/></div></label><label>Status<div className="select-wrap"><select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}><option>All shipments</option>{statusOptions.map(s => <option key={s}>{s}</option>)}</select><ChevronDown size={14}/></div></label><button className="text-link" onClick={() => { setCarrier('all'); setStatus('All shipments'); setQuery(''); setPage(1) }}>Reset filters<X size={13}/></button></div>}
    <div className="card-tabs shipment-tabs">{['All shipments', 'In transit', 'Delivered', 'Exception', 'Draft'].map(tab => <button key={tab} className={status === tab ? 'active' : ''} onClick={() => { setStatus(tab); setPage(1) }}>{tab === 'Exception' ? 'Exceptions' : tab === 'Draft' ? 'Drafts' : tab}<span>{formatNumber(shipments.filter(s => tab === 'All shipments' || s.status === tab).length)}</span></button>)}</div>
    {selected.size > 0 && <div className="selection-bar"><strong>{selected.size} shipment{selected.size === 1 ? '' : 's'} selected</strong><button className="text-link" onClick={() => setSelected(new Set())}>Clear selection</button></div>}
    <ShipmentTable shipments={visible} customers={customers} onSelect={onSelect} selected={selected} onToggle={toggle} onToggleAll={() => setSelected(current => { const next = new Set(current); const allSelected = visible.every(s => next.has(s.id)); visible.forEach(s => allSelected ? next.delete(s.id) : next.add(s.id)); return next })}/>
    <div className="pagination"><span>Showing {filtered.length ? (activePage - 1) * 12 + 1 : 0}–{Math.min(activePage * 12, filtered.length)} of {formatNumber(filtered.length)} shipments</span><div><button className="button button-secondary" disabled={activePage <= 1} onClick={() => setPage(activePage - 1)}><ChevronLeft size={15}/>Previous</button><span className="page-number">{activePage} / {pageCount}</span><button className="button button-secondary" disabled={activePage >= pageCount} onClick={() => setPage(activePage + 1)}>Next<ChevronRight size={15}/></button></div></div>
  </section>
}
