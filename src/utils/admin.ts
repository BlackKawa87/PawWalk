import type { Booking } from "@/utils/booking";
import { getBookings } from "@/utils/booking";
import { MOCK_WALKERS } from "@/data/walkers";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type LogCategory = "booking" | "user" | "payment" | "review" | "system";

export interface ActivityLog {
  id: string;
  category: LogCategory;
  action: string;
  actorName: string;
  detail: string;
  timestamp: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "owner" | "walker";
  location: string;
  status: "active" | "suspended";
  joinedAt: string;
  bookingCount: number;
  rating?: number;
}

export interface AdminAlert {
  id: string;
  type: "low_rating" | "high_cancellations" | "inactive_region";
  severity: "warning" | "critical";
  title: string;
  detail: string;
  triggeredAt: string;
  resolved: boolean;
}

// ─── Storage keys ──────────────────────────────────────────────────────────────

const LOG_KEY      = "pawgo_admin_logs";
const BLOCKED_KEY  = "pawgo_blocked_users";
const RESOLVED_KEY = "pawgo_resolved_alerts";

// ─── Block / suspend ───────────────────────────────────────────────────────────

export function getBlockedUsers(): string[] {
  try { return JSON.parse(localStorage.getItem(BLOCKED_KEY) ?? "[]"); }
  catch { return []; }
}

export function toggleBlockUser(userId: string): boolean {
  const blocked = getBlockedUsers();
  const willBlock = !blocked.includes(userId);
  localStorage.setItem(
    BLOCKED_KEY,
    JSON.stringify(willBlock ? [...blocked, userId] : blocked.filter((id) => id !== userId))
  );
  return willBlock;
}

// ─── Activity logs ─────────────────────────────────────────────────────────────

const SEED_LOGS: ActivityLog[] = [
  { id: "sl01", category: "user",    action: "User registered",   actorName: "Sarah Thompson", detail: "New owner · Islington, London",                      timestamp: "2026-04-21T08:02:00Z" },
  { id: "sl02", category: "booking", action: "Booking created",   actorName: "Sarah Thompson", detail: "Emily Carter · 30 min · £15.00",                     timestamp: "2026-04-21T08:15:00Z" },
  { id: "sl03", category: "payment", action: "Payment processed", actorName: "Stripe",         detail: "£15.00 · Platform £3.00 · Walker £12.00",             timestamp: "2026-04-21T08:15:02Z" },
  { id: "sl04", category: "user",    action: "User registered",   actorName: "David Kim",      detail: "New owner · Camden, London",                         timestamp: "2026-04-20T14:30:00Z" },
  { id: "sl05", category: "booking", action: "Booking created",   actorName: "David Kim",      detail: "James Reid · 45 min · £19.60",                       timestamp: "2026-04-20T14:45:00Z" },
  { id: "sl06", category: "payment", action: "Payment processed", actorName: "Stripe",         detail: "£19.60 · Platform £3.92 · Walker £15.68",             timestamp: "2026-04-20T14:45:02Z" },
  { id: "sl07", category: "review",  action: "Review submitted",  actorName: "Rachel Moore",   detail: "5★ Sophie Walsh — 'Absolutely brilliant with Luna'",  timestamp: "2026-04-20T10:00:00Z" },
  { id: "sl08", category: "booking", action: "Booking created",   actorName: "Emma Wilson",    detail: "Priya Sharma · 60 min · £28.80",                      timestamp: "2026-04-19T11:20:00Z" },
  { id: "sl09", category: "payment", action: "Payment processed", actorName: "Stripe",         detail: "£28.80 · Platform £5.76 · Walker £23.04",             timestamp: "2026-04-19T11:20:03Z" },
  { id: "sl10", category: "user",    action: "Walker registered", actorName: "Tom Clarke",     detail: "New walker · Dalston · pending verification",         timestamp: "2026-04-19T09:00:00Z" },
  { id: "sl11", category: "booking", action: "Booking cancelled", actorName: "James Patel",    detail: "Marcus Chen · full refund issued",                    timestamp: "2026-04-18T16:30:00Z" },
  { id: "sl12", category: "system",  action: "Alert triggered",   actorName: "System",         detail: "Low rating threshold — Tom Clarke (4.6★)",            timestamp: "2026-04-18T12:00:00Z" },
  { id: "sl13", category: "user",    action: "User suspended",    actorName: "Admin",          detail: "James Patel — 3 cancellations in 7 days",             timestamp: "2026-04-18T17:00:00Z" },
  { id: "sl14", category: "booking", action: "Booking created",   actorName: "Amelia Clark",   detail: "Emily Carter · 45 min · £19.60",                      timestamp: "2026-04-17T09:00:00Z" },
  { id: "sl15", category: "payment", action: "Payment processed", actorName: "Stripe",         detail: "£19.60 · Platform £3.92 · Walker £15.68",             timestamp: "2026-04-17T09:00:02Z" },
  { id: "sl16", category: "review",  action: "Review submitted",  actorName: "Amelia Clark",   detail: "5★ Emily Carter — 'Best walker on the platform'",     timestamp: "2026-04-16T20:00:00Z" },
  { id: "sl17", category: "user",    action: "User registered",   actorName: "Noah Brown",     detail: "New owner · Camden, London",                         timestamp: "2026-04-15T11:00:00Z" },
  { id: "sl18", category: "booking", action: "Booking created",   actorName: "Noah Brown",     detail: "Priya Sharma · 30 min · £18.00",                      timestamp: "2026-04-15T11:30:00Z" },
];

export function getLogs(): ActivityLog[] {
  try {
    const stored = localStorage.getItem(LOG_KEY);
    if (!stored) {
      localStorage.setItem(LOG_KEY, JSON.stringify(SEED_LOGS));
      return [...SEED_LOGS];
    }
    return JSON.parse(stored);
  } catch {
    return [...SEED_LOGS];
  }
}

export function addAdminLog(log: Omit<ActivityLog, "id" | "timestamp">): void {
  const logs = getLogs();
  const entry: ActivityLog = { ...log, id: crypto.randomUUID(), timestamp: new Date().toISOString() };
  localStorage.setItem(LOG_KEY, JSON.stringify([entry, ...logs]));
}

// ─── Mock admin users ──────────────────────────────────────────────────────────

const OWNERS_BASE: AdminUser[] = [
  { id: "u1", name: "Sarah Thompson", email: "sarah.t@example.com",  role: "owner", location: "Islington, London",      status: "active",    joinedAt: "2025-09-15", bookingCount: 12 },
  { id: "u2", name: "David Kim",      email: "d.kim@example.com",    role: "owner", location: "Camden, London",          status: "active",    joinedAt: "2025-10-02", bookingCount: 7  },
  { id: "u3", name: "Rachel Moore",   email: "r.moore@example.com",  role: "owner", location: "Hackney, London",         status: "active",    joinedAt: "2025-10-18", bookingCount: 3  },
  { id: "u4", name: "James Patel",    email: "j.patel@example.com",  role: "owner", location: "Shoreditch, London",      status: "suspended", joinedAt: "2025-11-01", bookingCount: 1  },
  { id: "u5", name: "Emma Wilson",    email: "e.wilson@example.com", role: "owner", location: "Stoke Newington, London", status: "active",    joinedAt: "2025-11-22", bookingCount: 5  },
  { id: "u6", name: "Oliver Harris",  email: "o.harris@example.com", role: "owner", location: "Dalston, London",         status: "active",    joinedAt: "2026-01-08", bookingCount: 2  },
  { id: "u7", name: "Amelia Clark",   email: "a.clark@example.com",  role: "owner", location: "Islington, London",       status: "active",    joinedAt: "2026-02-14", bookingCount: 8  },
  { id: "u8", name: "Noah Brown",     email: "n.brown@example.com",  role: "owner", location: "Camden, London",          status: "active",    joinedAt: "2026-03-01", bookingCount: 4  },
];

export function getMockOwners(): AdminUser[] {
  const blocked = getBlockedUsers();
  return OWNERS_BASE.map((o) => ({
    ...o,
    status: (blocked.includes(o.id) ? "suspended" : o.status) as "active" | "suspended",
  }));
}

export function getMockAdminWalkers(): AdminUser[] {
  const blocked = getBlockedUsers();
  return MOCK_WALKERS.map((w) => ({
    id: w.id,
    name: w.name,
    email: `${w.name.toLowerCase().replace(/ /g, ".")}@walker.com`,
    role: "walker" as const,
    location: w.location,
    status: (blocked.includes(w.id) ? "suspended" : "active") as "active" | "suspended",
    joinedAt: "2025-08-01",
    bookingCount: w.reviews,
    rating: w.rating,
  }));
}

// ─── Seed bookings ─────────────────────────────────────────────────────────────

const SEED_BOOKINGS: Booking[] = [
  { id: "sb01", ownerId: "u1", ownerName: "Sarah Thompson", ownerDog: "Milo",    walkerId: "w1", walkerName: "Emily Carter",  date: "2026-04-21", time: "9:00 AM",  duration: 30, pricePerWalk: 15, total: 15.00, platformFee: 3.00, walkerEarnings: 12.00, currency: "GBP", status: "confirmed", paymentStatus: "paid",     createdAt: "2026-04-21T08:15:00Z" },
  { id: "sb02", ownerId: "u2", ownerName: "David Kim",      ownerDog: "Biscuit", walkerId: "w2", walkerName: "James Reid",    date: "2026-04-20", time: "2:00 PM",  duration: 45, pricePerWalk: 14, total: 19.60, platformFee: 3.92, walkerEarnings: 15.68, currency: "GBP", status: "confirmed", paymentStatus: "paid",     createdAt: "2026-04-20T14:45:00Z" },
  { id: "sb03", ownerId: "u5", ownerName: "Emma Wilson",    ownerDog: "Luna",    walkerId: "w5", walkerName: "Priya Sharma",  date: "2026-04-19", time: "11:00 AM", duration: 60, pricePerWalk: 18, total: 28.80, platformFee: 5.76, walkerEarnings: 23.04, currency: "GBP", status: "confirmed", paymentStatus: "paid",     createdAt: "2026-04-19T11:20:00Z" },
  { id: "sb04", ownerId: "u7", ownerName: "Amelia Clark",   ownerDog: "Rosie",   walkerId: "w1", walkerName: "Emily Carter",  date: "2026-04-17", time: "9:00 AM",  duration: 45, pricePerWalk: 15, total: 19.60, platformFee: 3.92, walkerEarnings: 15.68, currency: "GBP", status: "confirmed", paymentStatus: "paid",     createdAt: "2026-04-17T09:00:00Z" },
  { id: "sb05", ownerId: "u8", ownerName: "Noah Brown",     ownerDog: "Cooper",  walkerId: "w5", walkerName: "Priya Sharma",  date: "2026-04-15", time: "10:00 AM", duration: 30, pricePerWalk: 18, total: 18.00, platformFee: 3.60, walkerEarnings: 14.40, currency: "GBP", status: "confirmed", paymentStatus: "paid",     createdAt: "2026-04-15T11:30:00Z" },
  { id: "sb06", ownerId: "u3", ownerName: "Rachel Moore",   ownerDog: "Daisy",   walkerId: "w3", walkerName: "Sophie Walsh",  date: "2026-04-14", time: "3:00 PM",  duration: 60, pricePerWalk: 16, total: 25.60, platformFee: 5.12, walkerEarnings: 20.48, currency: "GBP", status: "confirmed", paymentStatus: "paid",     createdAt: "2026-04-14T10:00:00Z" },
  { id: "sb07", ownerId: "u1", ownerName: "Sarah Thompson", ownerDog: "Milo",    walkerId: "w1", walkerName: "Emily Carter",  date: "2026-04-10", time: "8:00 AM",  duration: 30, pricePerWalk: 15, total: 15.00, platformFee: 3.00, walkerEarnings: 12.00, currency: "GBP", status: "confirmed", paymentStatus: "paid",     createdAt: "2026-04-10T07:00:00Z" },
  { id: "sb08", ownerId: "u4", ownerName: "James Patel",    ownerDog: "Bruno",   walkerId: "w4", walkerName: "Marcus Chen",   date: "2026-04-08", time: "1:00 PM",  duration: 30, pricePerWalk: 13, total: 13.00, platformFee: 2.60, walkerEarnings: 10.40, currency: "GBP", status: "cancelled",  paymentStatus: "refunded", createdAt: "2026-04-08T09:00:00Z" },
  { id: "sb09", ownerId: "u6", ownerName: "Oliver Harris",  ownerDog: "Poppy",   walkerId: "w6", walkerName: "Tom Clarke",    date: "2026-04-05", time: "11:00 AM", duration: 30, pricePerWalk: 12, total: 12.00, platformFee: 2.40, walkerEarnings:  9.60, currency: "GBP", status: "confirmed", paymentStatus: "paid",     createdAt: "2026-04-05T09:00:00Z" },
  { id: "sb10", ownerId: "u2", ownerName: "David Kim",      ownerDog: "Biscuit", walkerId: "w2", walkerName: "James Reid",    date: "2026-04-03", time: "4:00 PM",  duration: 45, pricePerWalk: 14, total: 19.60, platformFee: 3.92, walkerEarnings: 15.68, currency: "GBP", status: "confirmed", paymentStatus: "paid",     createdAt: "2026-04-03T14:00:00Z" },
  { id: "sb11", ownerId: "u5", ownerName: "Emma Wilson",    ownerDog: "Luna",    walkerId: "w3", walkerName: "Sophie Walsh",  date: "2026-04-01", time: "10:00 AM", duration: 30, pricePerWalk: 16, total: 16.00, platformFee: 3.20, walkerEarnings: 12.80, currency: "GBP", status: "confirmed", paymentStatus: "paid",     createdAt: "2026-04-01T09:00:00Z" },
  { id: "sb12", ownerId: "u7", ownerName: "Amelia Clark",   ownerDog: "Rosie",   walkerId: "w5", walkerName: "Priya Sharma",  date: "2026-03-28", time: "9:00 AM",  duration: 60, pricePerWalk: 18, total: 28.80, platformFee: 5.76, walkerEarnings: 23.04, currency: "GBP", status: "confirmed", paymentStatus: "paid",     createdAt: "2026-03-28T08:00:00Z" },
];

export function getAdminBookings(): Booking[] {
  const real = getBookings();
  const realIds = new Set(real.map((b) => b.id));
  return [...real, ...SEED_BOOKINGS.filter((b) => !realIds.has(b.id))].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// ─── Alerts ────────────────────────────────────────────────────────────────────

const BASE_ALERTS: Omit<AdminAlert, "resolved">[] = [
  { id: "a1", type: "low_rating",         severity: "warning",  title: "Low rating — Tom Clarke",       detail: "Rating 4.6 — below platform minimum of 4.7. 22 reviews.",        triggeredAt: "2026-04-18T12:00:00Z" },
  { id: "a2", type: "low_rating",         severity: "warning",  title: "Rating watch — Marcus Chen",    detail: "Rating 4.7 — borderline. Monitor for downward trend.",             triggeredAt: "2026-04-17T10:00:00Z" },
  { id: "a3", type: "high_cancellations", severity: "critical", title: "High cancellations — J. Patel", detail: "3 cancellations in 7 days. Account suspended pending review.",     triggeredAt: "2026-04-18T17:00:00Z" },
  { id: "a4", type: "inactive_region",    severity: "warning",  title: "Low coverage — East London",    detail: "Only 1 active walker in E1/E2 postcode area this week.",           triggeredAt: "2026-04-20T08:00:00Z" },
  { id: "a5", type: "inactive_region",    severity: "warning",  title: "Low coverage — South London",   detail: "No active walkers in SW1/SW2 area this week.",                     triggeredAt: "2026-04-19T08:00:00Z" },
];

export function getAlerts(): AdminAlert[] {
  try {
    const resolved: string[] = JSON.parse(localStorage.getItem(RESOLVED_KEY) ?? "[]");
    return BASE_ALERTS.map((a) => ({ ...a, resolved: resolved.includes(a.id) }));
  } catch {
    return BASE_ALERTS.map((a) => ({ ...a, resolved: false }));
  }
}

export function resolveAlert(alertId: string): void {
  try {
    const resolved: string[] = JSON.parse(localStorage.getItem(RESOLVED_KEY) ?? "[]");
    if (!resolved.includes(alertId)) {
      localStorage.setItem(RESOLVED_KEY, JSON.stringify([...resolved, alertId]));
    }
  } catch { /* noop */ }
}
