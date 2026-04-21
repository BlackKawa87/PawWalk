import { getBookingsByOwner } from "./booking";

export const SERVICE_FEE = 1.5;
const GRACE_DAYS = 60;
const ACTIVITY_WINDOW_DAYS = 14;

export interface FeeStatus {
  charged: boolean;
  reason: "active" | "new_user" | "inactive";
  safeDaysLeft?: number;
}

export function getFeeStatus(userId: string, signedUpAt?: string): FeeStatus {
  const now = new Date();

  const bookings = getBookingsByOwner(userId);
  const lastBooking = bookings[0];
  const daysSinceLast = lastBooking
    ? Math.floor((now.getTime() - new Date(lastBooking.createdAt).getTime()) / 86_400_000)
    : null;

  // Active: booked within the last 14 days → always free
  if (daysSinceLast !== null && daysSinceLast < ACTIVITY_WINDOW_DAYS) {
    return {
      charged: false,
      reason: "active",
      safeDaysLeft: ACTIVITY_WINDOW_DAYS - daysSinceLast,
    };
  }

  // New-user grace: account < 60 days AND no inactivity gap yet
  if (signedUpAt) {
    const accountAgeDays = Math.floor(
      (now.getTime() - new Date(signedUpAt).getTime()) / 86_400_000
    );
    if (accountAgeDays < GRACE_DAYS && daysSinceLast === null) {
      return {
        charged: false,
        reason: "new_user",
        safeDaysLeft: GRACE_DAYS - accountAgeDays,
      };
    }
  }

  return { charged: true, reason: "inactive" };
}
