const FAV_KEY = "pawgo_favs";
const CREDIT_KEY = "pawgo_credits";
const REWARD_KEY = "pawgo_rewarded";

// ─── Favorites ─────────────────────────────────────────────────────────────

export function getFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function toggleFavorite(walkerId: string): boolean {
  const favs = getFavorites();
  const nowFav = !favs.includes(walkerId);
  localStorage.setItem(
    FAV_KEY,
    JSON.stringify(nowFav ? [...favs, walkerId] : favs.filter((id) => id !== walkerId))
  );
  return nowFav;
}

export function isFavorite(walkerId: string): boolean {
  return getFavorites().includes(walkerId);
}

// ─── Credits ───────────────────────────────────────────────────────────────

export function getCredits(): number {
  return parseFloat(localStorage.getItem(CREDIT_KEY) ?? "0");
}

export function addCredits(amount: number): void {
  const updated = Math.round((getCredits() + amount) * 100) / 100;
  localStorage.setItem(CREDIT_KEY, String(updated));
}

export function spendCredits(amount: number): number {
  const current = getCredits();
  const spent = Math.round(Math.min(current, amount) * 100) / 100;
  localStorage.setItem(CREDIT_KEY, String(Math.round((current - spent) * 100) / 100));
  return spent;
}

// ─── First booking reward ──────────────────────────────────────────────────

export function claimFirstBookingReward(userId: string): boolean {
  const key = `${REWARD_KEY}_${userId}`;
  if (localStorage.getItem(key)) return false;
  localStorage.setItem(key, "1");
  addCredits(5);
  return true;
}

export function hasClaimedReward(userId: string): boolean {
  return !!localStorage.getItem(`${REWARD_KEY}_${userId}`);
}
