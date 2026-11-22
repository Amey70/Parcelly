import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, ArrowUpRight, Bell, ChartNoAxesCombined, Check, CheckCheck, ChevronDown, ChevronRight, ChevronsUpDown, CircleCheck, Command, Copy, Download, ExternalLink, Info, LayoutDashboard, LifeBuoy, MapPinned, Menu, Package, Plus, Search, Settings2, ShieldCheck, Sun, Truck, UsersRound, X, CalendarDays } from 'lucide-react'
import { carriers, defaultSettings, pageNames, seedCustomers, seedShipments } from './lib/data'
import type { CarrierId, Customer, Page, Period, Shipment, TrackingEntry, WorkspaceSettings } from './lib/data'
import { detectCarrier, exportShipments, formatNumber, getCarrier, inPeriod, normalizeTracking, readStorage, trackingUrl, writeStorage } from './lib/utils'
import { Avatar, BrandMark, CourierLogo } from './components/Brand'
import Modal from './components/Modal'
import ShippingModal from './components/ShippingModal'
import ShipmentDetail from './components/ShipmentDetail'
import { AddCustomerModal, CustomerDetail } from './components/CustomerModal'
import HelpModal from './components/HelpModal'
import Dashboard from './pages/Dashboard'
import Shipments from './pages/Shipments'
import Partners from './pages/Partners'
import Customers from './pages/Customers'
import Tracking from './pages/Tracking'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'

const navigation = [
  { page: 'dashboard' as const, icon: LayoutDashboard, label: 'Dashboard' },
  { page: 'shipments' as const, icon: Package, label: 'Shipments' },
  { page: 'tracking' as const, icon: MapPinned, label: 'Tracking' },
  { page: 'partners' as const, icon: Truck, label: 'Delivery partners' },
  { page: 'customers' as const, icon: UsersRound, label: 'Customers' },
]

function pageFromHash(): Page {
  const value = window.location.hash.replace('#/', '')
  return value in pageNames ? value as Page : 'dashboard'
}

function CarrierPicker({ number, onClose, onChoose, notify }: { number: string; onClose: () => void; onChoose: (carrier: CarrierId) => void; notify: (message: string) => void }) {
  const [selected, setSelected] = useState<CarrierId | null>(null)
  return <Modal title="Who’s delivering your parcel?" subtitle="A few couriers use similar numbers. Let’s get you to the right place." onClose={onClose}><div className="modal-body"><div className="carrier-picker-number"><Package size={18}/><strong>{number}</strong><button className="icon-button" aria-label="Copy tracking number" onClick={() => navigator.clipboard.writeText(number).then(() => notify('Tracking number copied.')).catch(() => notify('Select and copy the tracking number above.'))}><Copy size={15}/></button></div><div className="carrier-picker-grid">{carriers.map(c => <button key={c.id} className={`carrier-picker-option ${selected === c.id ? 'selected' : ''}`} onClick={() => setSelected(c.id)} aria-pressed={selected === c.id}><CourierLogo carrier={c.id}/><span>{c.name}</span><span className="radio-dot">{selected === c.id && <Check size={10}/>}</span></button>)}</div><div className="info-banner"><Info size={17}/><p>{selected === 'bluedart' || selected === 'dtdc' ? 'This courier requires you to paste the number into its tracking form. We’ll try to copy it for you when you continue.' : 'Find your delivery partner’s name in your shipping confirmation email or on your parcel label.'}</p></div></div><div className="modal-footer"><button className="button button-secondary" onClick={onClose}>Cancel</button><button className="button button-primary" disabled={!selected} onClick={() => { if (selected) onChoose(selected) }}>Open official tracking<ExternalLink size={15}/></button></div></Modal>
}

function App() {
  const [page, setPage] = useState<Page>(pageFromHash)
  const [period, setPeriod] = useState<Period>('week')
  const [localShipments, setLocalShipments] = useState<Shipment[]>(() => readStorage('shipments', []))
  const [localCustomers, setLocalCustomers] = useState<Customer[]>(() => readStorage('customers', []))
  const [settings, setSettings] = useState<WorkspaceSettings>(() => readStorage('settings', defaultSettings))
  const [history, setHistory] = useState<TrackingEntry[]>(() => readStorage('tracking-history', []))
  const [notificationRead, setNotificationRead] = useState(() => readStorage('notifications-read', false))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dateOpen, setDateOpen] = useState(false)
  const [popover, setPopover] = useState<'notifications' | 'profile' | 'workspace' | null>(null)
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [showShipping, setShowShipping] = useState(false)
  const [initialCarrier, setInitialCarrier] = useState<CarrierId | undefined>()
  const [initialCustomer, setInitialCustomer] = useState<string | undefined>()
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [pendingTracking, setPendingTracking] = useState<string | null>(null)
  const [showHelp, setShowHelp] = useState(false)
  const [toasts, setToasts] = useState<{ id: number; message: string }[]>([])
  const searchRef = useRef<HTMLInputElement>(null)
  const searchContainer = useRef<HTMLDivElement>(null)
  const dateRef = useRef<HTMLDivElement>(null)
  const shipments = useMemo(() => [...localShipments, ...seedShipments], [localShipments])
  const customers = useMemo(() => [...localCustomers, ...seedCustomers], [localCustomers])
  const filteredShipments = useMemo(() => shipments.filter(s => inPeriod(s, period)), [shipments, period])
  const notify = useCallback((message: string) => { const id = Date.now() + Math.random(); setToasts(current => [...current.slice(-2), { id, message }]); window.setTimeout(() => setToasts(current => current.filter(t => t.id !== id)), 5500) }, [])

  useEffect(() => { writeStorage('shipments', localShipments) }, [localShipments])
  useEffect(() => { writeStorage('customers', localCustomers) }, [localCustomers])
  useEffect(() => { writeStorage('settings', settings) }, [settings])
  useEffect(() => { writeStorage('tracking-history', history) }, [history])
  useEffect(() => { writeStorage('notifications-read', notificationRead) }, [notificationRead])
  useEffect(() => { document.title = `${pageNames[page]} · Parcelly` }, [page])
  useEffect(() => {
    const onHash = () => { setPage(pageFromHash()); setMobileOpen(false) }
    const onKey = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); searchRef.current?.focus(); setSearchOpen(true) } if (e.key === 'Escape') { setPopover(null); setSearchOpen(false); setDateOpen(false); setMobileOpen(false) } }
    const onPointer = (e: PointerEvent) => { const target = e.target as HTMLElement; if (!target.closest('[data-popover-root]')) setPopover(null); if (!searchContainer.current?.contains(target)) setSearchOpen(false); if (!dateRef.current?.contains(target)) setDateOpen(false) }
    window.addEventListener('hashchange', onHash); window.addEventListener('keydown', onKey); document.addEventListener('pointerdown', onPointer)
    return () => { window.removeEventListener('hashchange', onHash); window.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onPointer) }
  }, [])

  function navigate(next: Page) { setPage(next); window.location.hash = `/${next}`; setMobileOpen(false); setPopover(null); setSearchOpen(false); window.scrollTo({ top: 0, behavior: 'instant' }) }
  function createShipment(carrier?: CarrierId, customerId?: string) { setInitialCarrier(carrier); setInitialCustomer(customerId); setSelectedCustomer(null); setSelectedShipment(null); setPopover(null); setSearchOpen(false); setShowShipping(true) }
  function openShipment(shipment: Shipment) { setSelectedCustomer(null); setSelectedShipment(shipment); setPopover(null); setSearchOpen(false) }
  function openCustomer(customer: Customer) { setSelectedShipment(null); setSelectedCustomer(customer); setPopover(null); setSearchOpen(false) }
  function launchTracking(number: string, carrier: CarrierId) {
    const normalized = normalizeTracking(number)
    const entry: TrackingEntry = { number: normalized, carrier, date: new Date().toISOString() }
    setHistory(current => [entry, ...current.filter(h => !(h.number === normalized && h.carrier === carrier))].slice(0, 8))
    setPendingTracking(null)
    if (carrier === 'bluedart' || carrier === 'dtdc') {
      navigator.clipboard?.writeText(normalized).then(() => notify(`Tracking number copied. Paste it on ${getCarrier(carrier).name}’s tracking page.`)).catch(() => notify(`Paste ${normalized} into ${getCarrier(carrier).name}’s tracking form.`))
    } else notify(`Opening ${getCarrier(carrier).name}’s official tracking page in a new tab.`)
    window.open(trackingUrl(carrier, normalized), '_blank', 'noopener,noreferrer')
  }
  function track(number: string, carrier: CarrierId | 'auto') { if (!number.trim()) { notify('Add the tracking number supplied by your courier first.'); return } const detected = carrier === 'auto' ? detectCarrier(number, shipments) : carrier; if (!detected) setPendingTracking(number); else launchTracking(number, detected) }

  const searchResults = useMemo(() => {
    if (!search.trim()) return { shipments: [], customers: [] }
    const q = search.toLowerCase()
    return { shipments: shipments.filter(s => `${s.id} ${s.tracking} ${customers.find(c => c.id === s.customerId)?.name}`.toLowerCase().includes(q)).slice(0, 4), customers: customers.filter(c => `${c.name} ${c.email} ${c.company}`.toLowerCase().includes(q)).slice(0, 3) }
  }, [search, shipments, customers])
  const hasActivity = settings.emailNotifications || settings.exceptionAlerts
  const pageTitles: Record<Page, { title: string; subtitle: string }> = {
    dashboard: { title: `Good morning, ${settings.name.split(' ')[0]}`, subtitle: 'Here’s what’s happening with your shipments today.' },
    shipments: { title: 'All shipments', subtitle: 'From the first mile to the last, keep everything in view.' },
    tracking: { title: 'Keep every parcel in sight.', subtitle: 'A tracking number is all it takes to feel a little closer.' },
    partners: { title: 'Your delivery partners', subtitle: 'Different journeys. The right partner for every one.' },
    customers: { title: 'Customers', subtitle: 'The people behind every parcel. All in one place.' },
    analytics: { title: 'Your shipping, at a glance.', subtitle: 'A clearer picture of the journeys that move your business.' },
    settings: { title: 'Make yourself at home.', subtitle: 'Your workspace, your preferences, your way of shipping.' },
  }

  return <div className="app-shell">
    {mobileOpen && <button className="sidebar-overlay" aria-label="Close navigation" onClick={() => setMobileOpen(false)}/>}
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <button className="brand" onClick={() => navigate('dashboard')} aria-label="Parcelly home"><BrandMark/><span>parcelly<span className="brand-period">.</span></span></button>
      <div className="workspace-selector-container" data-popover-root><button className="workspace-selector" onClick={() => setPopover(popover === 'workspace' ? null : 'workspace')} aria-expanded={popover === 'workspace'}><span className="workspace-avatar">{settings.workspace.split(' ').slice(0, 2).map(w => w[0]).join('')}</span><span><strong>{settings.workspace}</strong><small>Demo workspace</small></span><ChevronsUpDown size={14}/></button>{popover === 'workspace' && <div className="popover workspace-popover"><span className="popover-eyebrow">YOUR WORKSPACE</span><div className="workspace-current"><span>{settings.workspace}</span><Check size={15}/></div><button onClick={() => navigate('settings')}><Settings2 size={15}/>Workspace settings</button><p>Fictional records. Real possibilities.</p></div>}</div>
      <div className="sidebar-navigation"><span className="nav-section-label">WORKSPACE</span><nav aria-label="Main navigation">{navigation.map(item => <a href={`#/${item.page}`} key={item.page} className={`nav-item ${page === item.page ? 'active' : ''}`} aria-current={page === item.page ? 'page' : undefined} onClick={e => { e.preventDefault(); navigate(item.page) }}><item.icon size={19} strokeWidth={1.75}/><span>{item.label}</span>{item.page === 'shipments' && <span className="nav-count">{formatNumber(filteredShipments.length)}</span>}{item.page === 'dashboard' && page === 'dashboard' && <span className="active-nav-dot"/>}</a>)}</nav><span className="nav-section-label tools-label">TOOLS & INSIGHTS</span><nav aria-label="Workspace tools"><a href="#/analytics" className={`nav-item ${page === 'analytics' ? 'active' : ''}`} aria-current={page === 'analytics' ? 'page' : undefined} onClick={e => { e.preventDefault(); navigate('analytics') }}><ChartNoAxesCombined size={19} strokeWidth={1.75}/><span>Analytics</span></a><a href="#/settings" className={`nav-item ${page === 'settings' ? 'active' : ''}`} aria-current={page === 'settings' ? 'page' : undefined} onClick={e => { e.preventDefault(); navigate('settings') }}><Settings2 size={19} strokeWidth={1.75}/><span>Settings</span></a></nav></div>
      <div className="sidebar-bottom"><div className="help-card"><span className="help-card-icon"><LifeBuoy size={22} strokeWidth={1.7}/></span><h3>A little help?</h3><p>We’re here to keep you moving.</p><button onClick={() => setShowHelp(true)}>Visit help center<ArrowUpRight size={14}/></button><svg className="help-card-decoration" viewBox="0 0 100 100" aria-hidden="true"><circle cx="95" cy="5" r="51"/><circle cx="95" cy="5" r="68"/><circle cx="95" cy="5" r="86"/></svg></div><button className="sidebar-profile" onClick={() => navigate('settings')}><Avatar customer={{ name: settings.name, color: 'peach' }}/><span><strong>{settings.name}</strong><small>Workspace admin</small></span><ChevronsUpDown size={14}/></button></div>
    </aside>
    <div className="main-shell"><header className="topbar"><div className="breadcrumb"><button className="icon-button mobile-menu-button" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={21}/></button><span className="breadcrumb-workspace">Workspace</span><ChevronRight className="breadcrumb-chevron" size={13}/><strong>{pageNames[page]}</strong></div><div className="topbar-actions"><div className="global-search-container" ref={searchContainer}><div className={`global-search ${searchOpen ? 'focused' : ''}`}><Search size={16}/><input ref={searchRef} aria-label="Search workspace" placeholder="Search anything..." value={search} onFocus={() => setSearchOpen(true)} onChange={e => { setSearch(e.target.value); setSearchOpen(true) }}/><kbd><Command size={10}/>K</kbd></div>{searchOpen && <div className="popover search-popover"><div className="search-popover-heading"><span>{search.trim() ? 'SEARCH RESULTS' : 'QUICK ACTIONS'}</span><button className="icon-button" onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={14}/></button></div>{!search.trim() ? <><button onClick={() => createShipment()}><Plus size={16}/><span>Create a shipment</span><span className="search-action-meta">New</span></button><button onClick={() => navigate('tracking')}><MapPinned size={16}/><span>Track a parcel</span><ArrowRight size={14}/></button><button onClick={() => navigate('customers')}><UsersRound size={16}/><span>Explore your customers</span><ArrowRight size={14}/></button></> : <>{searchResults.shipments.map(s => <button key={s.id} onClick={() => openShipment(s)}><Package size={17}/><span><strong>#{s.id}</strong><small>{s.tracking || 'Shipment draft'}</small></span><span className="search-action-meta">Shipment</span></button>)}{searchResults.customers.map(c => <button key={c.id} onClick={() => openCustomer(c)}><Avatar customer={c} size="small"/><span><strong>{c.name}</strong><small>{c.email}</small></span><span className="search-action-meta">Customer</span></button>)}{!searchResults.shipments.length && !searchResults.customers.length && <div className="search-no-results"><Search size={24}/><p>No results for “{search}”</p><small>Try a name, shipment ID, or tracking number.</small></div>}</>}</div>}</div><div className="notification-container" data-popover-root><button className="icon-button notification-button" aria-label="Notifications" aria-expanded={popover === 'notifications'} onClick={() => setPopover(popover === 'notifications' ? null : 'notifications')}><Bell size={19} strokeWidth={1.7}/>{!notificationRead && hasActivity && <span className="notification-dot"/>}</button>{popover === 'notifications' && <div className="popover notification-popover"><div className="popover-heading"><h3>Your updates</h3><button className="text-link" onClick={() => setNotificationRead(true)}><CheckCheck size={13}/>Mark read</button></div>{settings.emailNotifications && <><button className="notification-item" onClick={() => openShipment(seedShipments[0])}><span className="notification-item-icon green-icon"><CheckCheck size={17}/></span><span><strong>A parcel found its person.</strong><span>Olivia’s shipment is marked as delivered.</span><small>Sample activity · Today</small></span>{!notificationRead && <i/>}</button><button className="notification-item" onClick={() => openShipment(seedShipments[1])}><span className="notification-item-icon blue-icon"><Truck size={17}/></span><span><strong>Good things are on the way.</strong><span>Shipment #SH-10283 is in transit.</span><small>Sample activity · Today</small></span>{!notificationRead && <i/>}</button></>}{settings.exceptionAlerts && <button className="notification-item" onClick={() => openShipment(seedShipments[4])}><span className="notification-item-icon"><Info size={17}/></span><span><strong>A delivery needs attention.</strong><span>Review the exception on #SH-10280.</span><small>Sample activity · Today</small></span>{!notificationRead && <i/>}</button>}{!hasActivity && <div className="empty-state"><Bell size={25}/><h3>All quiet here.</h3><p>Notifications are turned off in your preferences.</p></div>}<button className="popover-footer" onClick={() => navigate('settings')}>Manage notification preferences<ArrowRight size={14}/></button></div>}</div><span className="topbar-divider"/><div className="profile-container" data-popover-root><button className="profile-button" onClick={() => setPopover(popover === 'profile' ? null : 'profile')} aria-label="Account menu" aria-expanded={popover === 'profile'}><Avatar customer={{ name: settings.name, color: 'peach' }} size="small"/><ChevronDown size={13}/></button>{popover === 'profile' && <div className="popover profile-popover"><div><strong>{settings.name}</strong><span>{settings.email}</span></div><button onClick={() => navigate('settings')}><Settings2 size={15}/>Your settings</button><button onClick={() => { setPopover(null); setShowHelp(true) }}><LifeBuoy size={15}/>Help center</button><span className="profile-demo-label"><ShieldCheck size={13}/>Local demo workspace</span></div>}</div></div></header>
      <main className={`main-content page-${page}`}><div className="page-heading"><div><div className="page-title-row"><h1>{pageTitles[page].title}</h1>{page === 'dashboard' && <Sun className="greeting-sun" size={26} strokeWidth={1.5}/>}</div><p>{pageTitles[page].subtitle}</p></div><div className="page-heading-actions">{['dashboard', 'shipments', 'analytics'].includes(page) && <div className="date-control" ref={dateRef}><button className="button button-secondary date-button" aria-expanded={dateOpen} onClick={() => setDateOpen(!dateOpen)}><CalendarDays size={15}/><span>{period === 'week' ? 'Sep 17 – Sep 23, 2026' : period === 'month' ? 'Aug 25 – Sep 23, 2026' : 'All time'}</span><ChevronDown size={13}/></button>{dateOpen && <div className="popover date-popover"><span className="popover-eyebrow">REPORTING PERIOD</span>{([{ value: 'week', label: 'Last 7 days' }, { value: 'month', label: 'Last 30 days' }, { value: 'all', label: 'All time' }] as const).map(option => <button key={option.value} className={period === option.value ? 'selected' : ''} onClick={() => { setPeriod(option.value); setDateOpen(false) }}>{option.label}{period === option.value && <Check size={15}/>}</button>)}<p>Sample reporting through Sep 23, 2026</p></div>}</div>}{page === 'customers' ? <button className="button button-primary" onClick={() => setShowAddCustomer(true)}><Plus size={17}/>Add customer</button> : page === 'analytics' ? <button className="button button-primary" onClick={() => { exportShipments(filteredShipments, customers); notify('Your shipping report has been exported.') }}><Download size={16}/>Export report</button> : page !== 'settings' && <button className="button button-primary" onClick={() => createShipment()}><Plus size={17}/>Create shipment</button>}</div></div>
      {page === 'dashboard' && <Dashboard shipments={filteredShipments} customers={customers} period={period} onNavigate={navigate} onCreate={createShipment} onShipment={openShipment} onCustomer={openCustomer} onTrack={track}/>}
      {page === 'shipments' && <Shipments shipments={filteredShipments} customers={customers} onSelect={openShipment} notify={notify}/>}
      {page === 'partners' && <Partners onCreate={createShipment} onTrackPage={() => navigate('tracking')}/>}
      {page === 'customers' && <Customers customers={customers} shipments={shipments} onSelect={openCustomer} notify={notify}/>}
      {page === 'tracking' && <Tracking history={history} shipments={shipments} onTrack={track} onClear={() => { setHistory([]); notify('Tracking history cleared.') }} onShipment={openShipment}/>}
      {page === 'analytics' && <Analytics shipments={filteredShipments} customers={customers} period={period} notify={notify}/>}
      {page === 'settings' && <Settings settings={settings} onSave={value => { setSettings(value); notify('Your workspace preferences have been saved.') }}/>}
      {page !== 'dashboard' && <div className="page-footer"><BrandMark small/><span>Your shipping, simplified.</span><span>Demo workspace · Changes are saved in this browser</span></div>}</main>
    </div>
    {showShipping && <ShippingModal initialCarrier={initialCarrier} initialCustomer={initialCustomer} customers={customers} settings={settings} nextId={`SH-${Math.max(...shipments.map(s => Number(s.id.replace('SH-', '')))) + 1}`} onClose={() => setShowShipping(false)} onSave={(shipment, customer) => { if (customer) setLocalCustomers(current => [customer, ...current]); setLocalShipments(current => [shipment, ...current]); notify('Shipment draft saved. Complete booking with your courier.') }}/>} 
    {showAddCustomer && <AddCustomerModal existingEmails={customers.map(c => c.email)} onClose={() => setShowAddCustomer(false)} onSave={customer => { setLocalCustomers(current => [customer, ...current]); setShowAddCustomer(false); notify(`${customer.name} has been added to your address book.`) }}/>} 
    {selectedShipment && <ShipmentDetail key={selectedShipment.id} shipment={selectedShipment} customer={customers.find(c => c.id === selectedShipment.customerId)} onClose={() => setSelectedShipment(null)} onTrack={track} onUpdate={updated => { setLocalShipments(current => current.map(s => s.id === updated.id ? updated : s)); setSelectedShipment(updated); notify('Shipment record updated in this workspace.') }} onDelete={id => { setLocalShipments(current => current.filter(s => s.id !== id)); setSelectedShipment(null); notify('Shipment draft deleted.') }} notify={notify}/>}
    {selectedCustomer && <CustomerDetail customer={selectedCustomer} shipments={shipments} onClose={() => setSelectedCustomer(null)} onShipment={openShipment} onCreate={() => createShipment(undefined, selectedCustomer.id)}/>}
    {pendingTracking && <CarrierPicker number={pendingTracking} onClose={() => setPendingTracking(null)} onChoose={carrier => launchTracking(pendingTracking, carrier)} notify={notify}/>}
    {showHelp && <HelpModal onClose={() => setShowHelp(false)} onPartners={() => { setShowHelp(false); navigate('partners') }}/>} 
    <div className="toast-container" aria-live="polite">{toasts.map(toast => <div className="toast" role="status" key={toast.id}><CircleCheck size={19}/><span>{toast.message}</span><button className="icon-button" aria-label="Dismiss notification" onClick={() => setToasts(current => current.filter(t => t.id !== toast.id))}><X size={14}/></button></div>)}</div>
  </div>
}

export default App
