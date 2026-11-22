import { useState } from 'react'
import { ArrowRight, ChevronDown, LifeBuoy, Search } from 'lucide-react'
import Modal from './Modal'

const articles = [
  { title: 'How do I track a parcel?', body: 'Enter the tracking number in the dashboard or Tracking page. Parcelly finds the delivery partner for saved shipments and recognizable UPS or USPS numbers, then opens the official carrier tracking page in a new tab. You can select a courier yourself at any time.' },
  { title: 'What if my delivery partner is not detected?', body: 'Several delivery partners use similar tracking-number formats. Rather than guess, Parcelly asks you to select the courier shown in your shipping confirmation. For Blue Dart and DTDC, copy and paste your tracking number into their official tracking form.' },
  { title: 'Can I book a real shipment here?', body: 'You can choose a courier and save a local shipment draft. The “Continue to courier” button opens the courier’s official site, where you confirm rates, book pickup, pay, and get your label. No real booking or payment is made inside this demo.' },
  { title: 'Where is my customer and shipment data saved?', body: 'New customers, shipment drafts, preferences, and tracking history are stored in this browser. No data is sent to a Parcelly server. Clearing browser storage removes your changes. This demo includes fictional sample records; please do not add sensitive information.' },
  { title: 'How do I export my records?', body: 'Open Shipments or Customers and select Export. Your current filters are applied to the CSV file. In Shipments, you can also check individual rows to export only your selection. Reports are downloaded directly to your device.' },
  { title: 'Are the dashboard statuses live?', body: 'No. Dashboard numbers and status labels reflect sample workspace records and your own manual updates. Open the official courier tracking page for real-time information about a real parcel.' },
]

export default function HelpModal({ onClose, onPartners }: { onClose: () => void; onPartners: () => void }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<string | null>(articles[0].title)
  const filtered = articles.filter(a => `${a.title} ${a.body}`.toLowerCase().includes(query.toLowerCase()))
  return <Modal title="A little help goes a long way." subtitle="Your Parcelly help center." onClose={onClose}><div className="modal-body help-body"><div className="help-search"><LifeBuoy size={30}/><div className="search-field"><Search size={16}/><input aria-label="Search help articles" placeholder="What can we help you with?" value={query} onChange={e => setQuery(e.target.value)}/></div></div><div className="faq-list">{filtered.map(article => <div className="faq-item" key={article.title}><button onClick={() => setOpen(open === article.title ? null : article.title)} aria-expanded={open === article.title}>{article.title}<ChevronDown size={16} className={open === article.title ? 'rotated' : ''}/></button>{open === article.title && <p>{article.body}</p>}</div>)}</div>{!filtered.length && <div className="empty-state"><h3>No matching articles</h3><p>Try “tracking”, “shipping”, or “export”.</p></div>}<button className="button button-primary full-button" onClick={onPartners}>Explore delivery partners<ArrowRight size={15}/></button></div></Modal>
}
