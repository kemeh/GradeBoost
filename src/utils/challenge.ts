
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

export function isDrillAccessible(drillDayNumber: number): boolean {
  const currentDay = getCurrentDayNumber();
  return drillDayNumber === currentDay;
}
