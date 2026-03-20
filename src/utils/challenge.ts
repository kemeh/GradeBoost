
export const CHALLENGE_START_DATE = '2026-03-01'; // Global start date for the 60-day challenge

export function getCurrentDayNumber(): number {
  const startDate = new Date(CHALLENGE_START_DATE);
  const today = new Date();
  
  // Calculate difference in days
  const diffTime = today.getTime() - startDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Clamp between 1 and 60
  return Math.min(Math.max(diffDays, 1), 60);
}

export function getDaysRemaining(): number {
  const currentDay = getCurrentDayNumber();
  return 60 - currentDay;
}

export function isDrillAccessible(drillDayNumber: number, isPaid: boolean = false, expiryDate?: string): boolean {
  const currentDay = getCurrentDayNumber();
  
  // Day 1 is always accessible as a free sample
  if (drillDayNumber === 1) return true;

  // If paid and not expired, can access current day or any past day
  if (isPaid) {
    const hasExpired = expiryDate && new Date(expiryDate) < new Date();
    if (!hasExpired) {
      return drillDayNumber <= currentDay;
    }
  }

  // Otherwise, only current day is accessible if paid
  return drillDayNumber === currentDay && isPaid;
}
