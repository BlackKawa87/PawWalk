export const PLATFORM_COMMISSION = 0.2;
export const WALKER_SHARE = 0.8;

export type Currency = "GBP" | "USD";
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "pending_payout" | "paid_out";

export interface BookingPayment {
  total: number;
  platformFee: number;
  walkerEarnings: number;
}

export function calculatePayment(pricePerWalk: number, duration: 30 | 45 | 60): BookingPayment {
  const multiplier = duration === 30 ? 1 : duration === 45 ? 1.4 : 1.8;
  const total = Math.round(pricePerWalk * multiplier * 100) / 100;
  const platformFee = Math.round(total * PLATFORM_COMMISSION * 100) / 100;
  const walkerEarnings = Math.round(total * WALKER_SHARE * 100) / 100;
  return { total, platformFee, walkerEarnings };
}

export function fmt(amount: number, currency: Currency = "GBP"): string {
  return `${currency === "GBP" ? "£" : "$"}${amount.toFixed(2)}`;
}

export interface Booking {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerDog: string;
  walkerId: string;
  walkerName: string;
  date: string;
  time: string;
  duration: 30 | 45 | 60;
  pricePerWalk: number;
  total: number;
  platformFee: number;
  walkerEarnings: number;
  serviceFee: number;
  creditsUsed: number;
  currency: Currency;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  notes?: string;
}

const KEY = "pawgo_bookings";

export function getBookings(): Booking[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveBooking(booking: Booking): void {
  const list = getBookings();
  list.push(booking);
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function getBookingById(id: string): Booking | undefined {
  return getBookings().find((b) => b.id === id);
}

export function getBookingsByOwner(ownerId: string): Booking[] {
  return getBookings()
    .filter((b) => b.ownerId === ownerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getBookingsByWalker(walkerId: string): Booking[] {
  return getBookings()
    .filter((b) => b.walkerId === walkerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

const WALKER_OB_KEY = "pawgo_walker_ob";

export interface WalkerOnboarding {
  hasPhoto: boolean;
  hasAvailability: boolean;
  hasServiceArea: boolean;
}

export function getWalkerOnboarding(): WalkerOnboarding {
  try {
    return JSON.parse(localStorage.getItem(WALKER_OB_KEY) ?? "{}");
  } catch {
    return { hasPhoto: false, hasAvailability: false, hasServiceArea: false };
  }
}

export function setWalkerOnboarding(data: Partial<WalkerOnboarding>): WalkerOnboarding {
  const current = getWalkerOnboarding();
  const updated = { ...current, ...data };
  localStorage.setItem(WALKER_OB_KEY, JSON.stringify(updated));
  return updated;
}

export function isWalkerLive(ob: WalkerOnboarding): boolean {
  return ob.hasPhoto && ob.hasAvailability && ob.hasServiceArea;
}
