export type MktCategoryKey = "materials" | "cleaning" | "crews" | "utilities";

export type MktBadge = "hot" | "new" | "sale" | "";

export interface MktItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  unit: string;
  emoji: string;
  rating: string;
  badge: MktBadge;
  bg: string;
  eta?: string;
}

export const MKT_DATA: Record<MktCategoryKey, MktItem[]> = {
  materials: [
    { id: "m1", name: "ABC Fire Extinguisher 5kg", desc: "Dry powder, suitable for Class A, B & C fires. Certified & inspected.", price: 85, unit: "unit", emoji: "🧯", rating: "4.8 ★", badge: "hot", bg: "#fef2f2" },
    { id: "m2", name: "Emergency Exit Signs (LED)", desc: "Battery-backed LED exit signs, UL certified. Pack of 6.", price: 120, unit: "pack", emoji: "🚪", rating: "4.6 ★", badge: "new", bg: "#eff6ff" },
    { id: "m3", name: "Smoke Detector Pack x10", desc: "Interconnected ionisation smoke detectors with 10yr battery.", price: 95, unit: "pack", emoji: "🔔", rating: "4.9 ★", badge: "", bg: "#ecfdf5" },
    { id: "m4", name: "First Aid Kit (Large)", desc: "200-piece commercial first aid kit for buildings up to 50 people.", price: 65, unit: "kit", emoji: "🩺", rating: "4.7 ★", badge: "", bg: "#f5f3ff" },
    { id: "m5", name: "CCTV Camera System (8 cam)", desc: "1080p HD outdoor/indoor cameras, 30-day DVR storage included.", price: 480, unit: "system", emoji: "📹", rating: "4.5 ★", badge: "sale", bg: "#ecfeff" },
    { id: "m6", name: "Water Tanks 2000L", desc: "UV-resistant polyethylene water storage tank, food grade.", price: 220, unit: "unit", emoji: "🪣", rating: "4.4 ★", badge: "", bg: "#fffbeb" },
    { id: "m7", name: "LED Corridor Lighting Kit", desc: "Motion-sensor LED strip lighting for corridors, 10m roll.", price: 75, unit: "roll", emoji: "💡", rating: "4.7 ★", badge: "new", bg: "#fffbeb" },
    { id: "m8", name: "Door Access Control System", desc: "RFID keycard access system, supports 500 cards, weatherproof.", price: 350, unit: "unit", emoji: "🔐", rating: "4.6 ★", badge: "", bg: "#f0fdf4" },
    { id: "m9", name: "Intercom System (10 units)", desc: "Video intercom system for apartment entry, HD camera, app-enabled.", price: 680, unit: "set", emoji: "📞", rating: "4.8 ★", badge: "hot", bg: "#faf5ff" },
  ],
  cleaning: [
    { id: "c1", name: "ProClean Building Services", desc: "Full commercial cleaning — lobbies, corridors, parking & common areas. Daily, weekly or monthly contracts.", price: 320, unit: "visit", emoji: "🧹", rating: "4.9 ★", badge: "hot", bg: "#ecfdf5", eta: "Next day" },
    { id: "c2", name: "ShineBright Facilities", desc: "Specialist high-rise window cleaning, facade washing, pressure cleaning.", price: 580, unit: "day", emoji: "🪟", rating: "4.7 ★", badge: "", bg: "#eff6ff", eta: "3-5 days" },
    { id: "c3", name: "FreshSpace Cleaning Co.", desc: "Deep cleaning service, carpet steam cleaning, upholstery care. End-of-tenancy specialists.", price: 210, unit: "visit", emoji: "✨", rating: "4.8 ★", badge: "new", bg: "#f5f3ff", eta: "Next day" },
    { id: "c4", name: "GreenClean Eco Services", desc: "Eco-friendly, non-toxic cleaning products. LEED-certified processes for green buildings.", price: 380, unit: "visit", emoji: "🌿", rating: "4.6 ★", badge: "sale", bg: "#f0fdf4", eta: "2 days" },
    { id: "c5", name: "Elite Janitorial Services", desc: "24/7 on-call emergency cleaning, biohazard cleanup, water damage response.", price: 450, unit: "visit", emoji: "🏢", rating: "4.5 ★", badge: "", bg: "#fef9ec", eta: "Same day" },
    { id: "c6", name: "AquaJet Pressure Washing", desc: "Industrial pressure washing for parking lots, driveways and exteriors.", price: 290, unit: "session", emoji: "💦", rating: "4.7 ★", badge: "", bg: "#ecfeff", eta: "2-3 days" },
  ],
  crews: [
    { id: "cr1", name: "Master Plumbers Ltd", desc: "Licensed plumbers for leaks, pipe bursts, drain unblocking, water heater installation.", price: 95, unit: "hour", emoji: "🔧", rating: "4.9 ★", badge: "hot", bg: "#eff6ff", eta: "Same day" },
    { id: "cr2", name: "SafeWire Electricians", desc: "Certified electricians. Wiring, breaker issues, lighting installation, safety inspections.", price: 110, unit: "hour", emoji: "⚡", rating: "4.8 ★", badge: "", bg: "#fffbeb", eta: "Same day" },
    { id: "cr3", name: "CoolAir HVAC Experts", desc: "AC installation, servicing, duct cleaning, heating system repair and maintenance.", price: 130, unit: "hour", emoji: "❄️", rating: "4.7 ★", badge: "new", bg: "#ecfeff", eta: "Next day" },
    { id: "cr4", name: "BuildRight Carpentry", desc: "Door fitting, flooring, partition walls, kitchen & bathroom fixtures, custom carpentry.", price: 80, unit: "hour", emoji: "🪚", rating: "4.6 ★", badge: "", bg: "#fef3ec", eta: "2 days" },
    { id: "cr5", name: "PaintPro Decorators", desc: "Interior & exterior painting, wallpaper, texture coating. Quick turnaround guaranteed.", price: 70, unit: "hour", emoji: "🎨", rating: "4.8 ★", badge: "sale", bg: "#fdf4ff", eta: "Next day" },
    { id: "cr6", name: "LiftTech Elevator Services", desc: "Elevator maintenance, inspection, emergency repair. 24/7 callout available.", price: 200, unit: "visit", emoji: "🛗", rating: "4.9 ★", badge: "", bg: "#f0fdf4", eta: "Same day" },
    { id: "cr7", name: "SecureGuard Security", desc: "Guard deployment, patrol services, CCTV monitoring, access control management.", price: 160, unit: "day", emoji: "🛡️", rating: "4.7 ★", badge: "hot", bg: "#eff6ff", eta: "Next day" },
    { id: "cr8", name: "PestAway Exterminators", desc: "Cockroach, rodent, bed bug treatment. Certified chemicals, safe for residents.", price: 180, unit: "visit", emoji: "🐛", rating: "4.8 ★", badge: "", bg: "#fef2f2", eta: "Next day" },
    { id: "cr9", name: "FixIt Handyman Service", desc: "General repairs, furniture assembly, minor fixes. Flexible scheduling, competitive rates.", price: 55, unit: "hour", emoji: "🔨", rating: "4.6 ★", badge: "new", bg: "#ecfdf5", eta: "Same day" },
  ],
  utilities: [
    { id: "u1", name: "AquaFlow Water Delivery", desc: "Bulk water delivery 5,000–20,000L. Emergency supply for buildings with water outages.", price: 180, unit: "delivery", emoji: "🚰", rating: "4.8 ★", badge: "hot", bg: "#ecfeff", eta: "Same day" },
    { id: "u2", name: "CleanBin Waste Management", desc: "Commercial waste collection, recycling programs, hazardous waste disposal.", price: 240, unit: "month", emoji: "♻️", rating: "4.6 ★", badge: "", bg: "#ecfdf5", eta: "Weekly" },
    { id: "u3", name: "SwiftGas Cylinder Delivery", desc: "Commercial LPG cylinders delivered to your building. Bulk pricing available.", price: 95, unit: "cylinder", emoji: "⛽", rating: "4.7 ★", badge: "sale", bg: "#fffbeb", eta: "Next day" },
    { id: "u4", name: "SolarPower Installation", desc: "Rooftop solar panel installation, battery storage, grid tie-in services.", price: 4500, unit: "system", emoji: "☀️", rating: "4.9 ★", badge: "new", bg: "#fef9ec", eta: "5-7 days" },
    { id: "u5", name: "FiberNet Internet Services", desc: "Commercial fibre broadband for buildings. Up to 1Gbps, unlimited data.", price: 320, unit: "month", emoji: "🌐", rating: "4.7 ★", badge: "", bg: "#eff6ff", eta: "3-5 days" },
    { id: "u6", name: "GenSet Backup Power", desc: "Generator rental & installation, UPS systems, automatic transfer switches.", price: 850, unit: "month", emoji: "🔋", rating: "4.8 ★", badge: "hot", bg: "#f5f3ff", eta: "2 days" },
  ],
};

export const MKT_CATEGORIES: {
  key: MktCategoryKey;
  label: string;
  icon: string;
}[] = [
  { key: "materials", label: "Materials & Supplies", icon: "📦" },
  { key: "cleaning", label: "Cleaning Services", icon: "🧹" },
  { key: "crews", label: "Maintenance Crews", icon: "👷" },
  { key: "utilities", label: "Utilities & Delivery", icon: "🚚" },
];

export function totalMarketplaceItems(): number {
  return Object.values(MKT_DATA).reduce((s, a) => s + a.length, 0);
}
