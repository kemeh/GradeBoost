
export const DEFAULT_CHALLENGE_START_DATE = '2026-03-22'; // Default start date

export function getCurrentDayNumber(startDateString?: string): number {
  const startDate = new Date(startDateString || DEFAULT_CHALLENGE_START_DATE);
  const today = new Date();
  
  // Reset time to midnight for accurate day calculation
  startDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  return Math.max(1, Math.min(60, diffDays));
}

export function getDaysRemaining(startDateString?: string): number {
  const currentDay = getCurrentDayNumber(startDateString);
  return Math.max(0, 60 - currentDay);
}

export function isDrillAccessible(drillDayNumber: number, isPaid: boolean = false, expiryDate?: string, isFreeSample: boolean = false, startDateString?: string): boolean {
  const currentDay = getCurrentDayNumber(startDateString);
  
  // Day 1 or any drill marked as free sample is always accessible
  if (drillDayNumber === 1 || isFreeSample) return true;

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
