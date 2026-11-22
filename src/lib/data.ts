export type CarrierId = 'dhl' | 'fedex' | 'ups' | 'usps' | 'bluedart' | 'dtdc'
export type ShipmentStatus = 'Delivered' | 'In transit' | 'Out for delivery' | 'Exception' | 'Draft'
export type Page = 'dashboard' | 'shipments' | 'tracking' | 'partners' | 'customers' | 'analytics' | 'settings'
export type Period = 'week' | 'month' | 'all'

export interface Carrier {
  id: CarrierId
  name: string
  shortName: string
  tagline: string
  description: string
  region: string
  services: string[]
  bookingUrl: string
  color: string
}

export interface Customer {
  id: string
  name: string
  email: string
  company: string
  phone: string
  address: string
  city: string
  zip: string
  country: string
  joined: string
  color: string
}

export interface Shipment {
  id: string
  tracking: string
  customerId: string
  carrier: CarrierId
  status: ShipmentStatus
  created: string
  weight: number
  service: string
  origin: string
  destination: string
  estimated: string
  notes?: string
  isLocal?: boolean
}

export interface WorkspaceSettings {
  name: string
  email: string
  workspace: string
  address: string
  defaultCarrier: CarrierId
  unit: 'kg' | 'lb'
  emailNotifications: boolean
  exceptionAlerts: boolean
}

export interface TrackingEntry {
  number: string
  carrier: CarrierId
  date: string
}

export const referenceDate = new Date('2026-09-23T23:59:59')

export const carriers: Carrier[] = [
  { id: 'dhl', name: 'DHL Express', shortName: 'DHL', tagline: 'Go beyond borders', description: 'Express shipping for the things that cannot wait. Explore international delivery options directly with DHL.', region: 'International', services: ['Express', 'International'], bookingUrl: 'https://mydhl.express.dhl/us/en/home.html', color: '#f9cc25' },
  { id: 'fedex', name: 'FedEx', shortName: 'FedEx', tagline: 'Possibilities, delivered', description: 'Find a shipping service that fits your package, from everyday ground delivery to express options.', region: 'International', services: ['Express', 'Ground', 'International'], bookingUrl: 'https://www.fedex.com/en-us/shipping.html', color: '#5b259f' },
  { id: 'ups', name: 'UPS', shortName: 'UPS', tagline: 'Your world, delivered', description: 'Send your next parcel with domestic and international services, with booking and labels managed by UPS.', region: 'International', services: ['Ground', 'Express', 'International'], bookingUrl: 'https://www.ups.com/ship?loc=en_US', color: '#74533a' },
  { id: 'usps', name: 'USPS', shortName: 'USPS', tagline: 'Closer to every doorstep', description: 'Explore postal shipping options for deliveries across the United States and destinations abroad.', region: 'United States', services: ['Postal', 'Domestic', 'International'], bookingUrl: 'https://www.usps.com/ship/', color: '#244b86' },
  { id: 'bluedart', name: 'Blue Dart', shortName: 'Blue Dart', tagline: 'Connecting every corner', description: 'Explore express distribution and delivery options with Blue Dart. Confirm service availability with the carrier.', region: 'India', services: ['Domestic', 'Express'], bookingUrl: 'https://www.bluedart.com/', color: '#225ba7' },
  { id: 'dtdc', name: 'DTDC', shortName: 'DTDC', tagline: 'Delivering your next chapter', description: 'Discover domestic and international parcel services and continue your booking on DTDC’s official website.', region: 'India', services: ['Domestic', 'International'], bookingUrl: 'https://www.dtdc.com/', color: '#1c3989' },
]

export const defaultSettings: WorkspaceSettings = {
  name: 'Alex Morgan', email: 'alex@acme.example', workspace: 'Acme Studio', address: '100 Market Street, San Francisco, CA 94105', defaultCarrier: 'dhl', unit: 'kg', emailNotifications: true, exceptionAlerts: true,
}

const featuredCustomers: Omit<Customer, 'id' | 'joined' | 'color'>[] = [
  { name: 'Olivia Rhye', email: 'olivia@layers.example', company: 'Layers', phone: '+1 (202) 555-0142', address: '248 Oak Avenue', city: 'Los Angeles, CA', zip: '90012', country: 'United States' },
  { name: 'Phoenix Baker', email: 'phoenix@sisyphus.example', company: 'Sisyphus', phone: '+1 (202) 555-0138', address: '72 Broadway', city: 'New York, NY', zip: '10012', country: 'United States' },
  { name: 'Lana Steiner', email: 'lana@catalog.example', company: 'Catalog', phone: '+1 (202) 555-0196', address: '810 Congress Avenue', city: 'Austin, TX', zip: '78701', country: 'United States' },
  { name: 'Demi Wilkinson', email: 'demi@circooles.example', company: 'Circooles', phone: '+1 (202) 555-0174', address: '134 Lake Street', city: 'Chicago, IL', zip: '60601', country: 'United States' },
  { name: 'Drew Cano', email: 'drew@hourglass.example', company: 'Hourglass', phone: '+1 (202) 555-0183', address: '592 Pine Street', city: 'San Francisco, CA', zip: '94108', country: 'United States' },
  { name: 'Natali Craig', email: 'natali@command.example', company: 'Command', phone: '+1 (202) 555-0129', address: '28 Cherry Street', city: 'Seattle, WA', zip: '98104', country: 'United States' },
]
const firstNames = ['Aria', 'James', 'Sofia', 'Oliver', 'Mia', 'Ethan', 'Isla', 'Noah', 'Chloe', 'Lucas', 'Grace', 'Leo', 'Amelia']
const lastNames = ['Chen', 'Wilson', 'Patel', 'Thompson', 'Garcia', 'Anderson']
const cities = ['Denver, CO', 'Portland, OR', 'Boston, MA', 'Atlanta, GA', 'Miami, FL', 'San Diego, CA']
const avatarColors = ['peach', 'purple', 'sage', 'blue', 'rose', 'gold']

export const seedCustomers: Customer[] = Array.from({ length: 84 }, (_, i) => {
  const base = i < 6 ? featuredCustomers[i] : (() => {
    const n = i - 6
    const first = firstNames[n % firstNames.length]
    const last = lastNames[Math.floor(n / firstNames.length)]
    return { name: `${first} ${last}`, email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`, company: `${last} & Co.`, phone: `+1 (202) 555-${String(100 + i).padStart(4, '0')}`, address: `${100 + i * 12} Maple Street`, city: cities[n % cities.length], zip: ['80202', '97204', '02108', '30303', '33101', '92101'][n % cities.length], country: 'United States' }
  })()
  return { ...base, id: `CUS-${1001 + i}`, joined: i > 75 ? '2026-09-19' : `2026-0${5 + (i % 4)}-${String(1 + (i % 27)).padStart(2, '0')}`, color: avatarColors[i % avatarColors.length] }
})

const sampleNumbers: Record<CarrierId, string> = {
  dhl: '4927158036', fedex: '789345612870', ups: '1Z8V438E0394726581', usps: '9400111899223846721938', bluedart: '80475261983', dtdc: 'D78546321',
}

function makeTracking(carrier: CarrierId, i: number) {
  if (i < 6) return sampleNumbers[carrier]
  if (carrier === 'dhl') return String(4927158036 + i * 13)
  if (carrier === 'fedex') return String(789345612870 + i * 17)
  if (carrier === 'ups') return `1Z8V438E03${String(94726581 + i).padStart(8, '0')}`
  if (carrier === 'usps') return `94001118${String(99223846721938n + BigInt(i) * 11n)}`
  if (carrier === 'bluedart') return String(80475261983 + i * 23)
  return `D${78546321 + i * 7}`
}

function makeBatch(size: number, previous: boolean): Shipment[] {
  return Array.from({ length: size }, (_, i) => {
    const carrier = carriers[i % carriers.length].id
    const customerIndex = i < 6 ? i : i % 100 < 48 ? i % 6 : 6 + ((i * 13 + Math.floor(i / 6)) % (previous ? 70 : 78))
    const customer = seedCustomers[customerIndex]
    const index = previous ? i + 1284 : i
    const dayOffset = Math.floor(i / Math.ceil(size / 7)) + (previous ? 7 : 0)
    const date = new Date(2026, 8, 23 - dayOffset, 10 - (i % 3), 56 - (i % 55))
    const slot = (i * 37) % size
    let status: ShipmentStatus
    if (previous) status = slot < 1015 ? 'Delivered' : slot < 1117 ? 'In transit' : slot < 1129 ? 'Out for delivery' : 'Exception'
    else status = slot < 1098 ? 'Delivered' : slot < 1254 ? 'In transit' : slot < 1272 ? 'Out for delivery' : 'Exception'
    const eta = new Date(date)
    eta.setDate(eta.getDate() + 2 + (i % 3))
    return { id: `SH-${10284 - index}`, tracking: makeTracking(carrier, index), customerId: customer.id, carrier, status, created: date.toISOString(), weight: [1.2, 2.5, 0.8, 3.4, 1.6, 0.5][i % 6], service: i % 3 === 0 ? 'Express' : 'Standard', origin: 'San Francisco, CA', destination: customer.city, estimated: eta.toISOString() }
  })
}

export const seedShipments = [...makeBatch(1284, false), ...makeBatch(1138, true)]
// Keep the first records varied while preserving the sample distribution.
for (const [index, status] of [[1, 'In transit'], [2, 'Out for delivery'], [4, 'Exception']] as const) {
  const match = seedShipments.findIndex((s, i) => i > 6 && s.status === status)
  if (match !== -1) [seedShipments[index].status, seedShipments[match].status] = [seedShipments[match].status, seedShipments[index].status]
}

export const statusOptions: ShipmentStatus[] = ['Delivered', 'In transit', 'Out for delivery', 'Exception', 'Draft']
export const pageNames: Record<Page, string> = { dashboard: 'Dashboard', shipments: 'Shipments', tracking: 'Tracking', partners: 'Delivery partners', customers: 'Customers', analytics: 'Analytics', settings: 'Settings' }
