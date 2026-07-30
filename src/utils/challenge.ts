
export const DEFAULT_CHALLENGE_START_DATE = '2026-03-24'; // Default start date

export function getCurrentDayNumber(startDateString?: string, totalDays: number = 30): number {
  const dateStr = startDateString || DEFAULT_CHALLENGE_START_DATE;
  // Use T00:00:00 to ensure it's treated as a local date
  const startDate = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
  const today = new Date();
  
  // Reset time to midnight for accurate day calculation
  startDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  return Math.max(1, Math.min(totalDays, diffDays));
}

export function getDaysRemaining(startDateString?: string, totalDays: number = 30): number {
  const currentDay = getCurrentDayNumber(startDateString, totalDays);
  return Math.max(0, totalDays - currentDay);
}

export function isDrillAccessible(drillDayNumber: number, isPaid: boolean = false, expiryDate?: string, isFreeSample: boolean = false, startDateString?: string, totalDays: number = 30): boolean {
  const currentDay = getCurrentDayNumber(startDateString, totalDays);
  
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

