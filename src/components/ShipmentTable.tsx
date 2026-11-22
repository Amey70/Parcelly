import { ArrowUpRight, ChevronRight, PackageOpen } from 'lucide-react'
import type { Customer, Shipment } from '../lib/data'
import { CourierLogo, StatusBadge } from './Brand'
import { formatDate, getCarrier } from '../lib/utils'

export default function ShipmentTable({ shipments, customers, onSelect, compact = false, selected, onToggle, onToggleAll }: { shipments: Shipment[]; customers: Customer[]; onSelect: (shipment: Shipment) => void; compact?: boolean; selected?: Set<string>; onToggle?: (id: string) => void; onToggleAll?: () => void }) {
  if (!shipments.length) return <div className="empty-state"><span className="empty-icon"><PackageOpen size={28}/></span><h3>No shipments found</h3><p>Try a different search or clear your filters.</p></div>
  return <div className="table-scroll"><table className={`shipment-table ${compact ? 'compact-table' : ''}`}>
    <thead><tr>{onToggle && <th className="checkbox-cell"><input type="checkbox" aria-label="Select all visible shipments" checked={shipments.length > 0 && shipments.every(s => selected?.has(s.id))} onChange={onToggleAll}/></th>}<th>Shipment ID</th><th>Customer</th><th>Delivery partner</th>{!compact && <th>Created</th>}<th>Status</th><th className="action-cell"><span className="sr-only">Details</span></th></tr></thead>
    <tbody>{shipments.map(shipment => { const customer = customers.find(c => c.id === shipment.customerId); return <tr key={shipment.id} className={selected?.has(shipment.id) ? 'row-selected' : ''}>
      {onToggle && <td className="checkbox-cell"><input type="checkbox" aria-label={`Select ${shipment.id}`} checked={selected?.has(shipment.id) ?? false} onChange={() => onToggle(shipment.id)}/></td>}
      <td><button className="shipment-id text-button" onClick={() => onSelect(shipment)}>#{shipment.id}<ArrowUpRight size={11}/></button><span className="cell-subtext tracking-number">{shipment.tracking || 'Awaiting tracking number'}</span></td>
      <td><span className="cell-name">{customer?.name ?? 'New customer'}</span><span className="cell-subtext">{shipment.destination}</span></td>
      <td><div className="table-carrier"><CourierLogo carrier={shipment.carrier} compact/>{shipment.carrier === 'ups' && <span>{getCarrier(shipment.carrier).shortName}</span>}</div></td>
      {!compact && <td className="date-cell">{formatDate(shipment.created, true)}</td>}
      <td><StatusBadge status={shipment.status}/></td>
      <td className="action-cell"><button className="icon-button row-action" onClick={() => onSelect(shipment)} aria-label={`View shipment ${shipment.id}`}><ChevronRight size={17}/></button></td>
    </tr>})}</tbody>
  </table></div>
}
