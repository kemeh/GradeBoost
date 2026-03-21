import { Timestamp } from 'firebase/firestore';

/**
 * Safely formats a date from various formats (Firebase Timestamp, Date object, or ISO string)
 * @param dateValue The date value to format
 * @param fallback The fallback string if the date is invalid
 * @returns Formatted date string
 */
export function formatDate(dateValue: any, fallback: string = "Date not available"): string {
  if (!dateValue) return fallback;

  try {
    let dateObj: Date;

    // Handle Firebase Timestamp
    if (dateValue instanceof Timestamp || (typeof dateValue === 'object' && 'toDate' in dateValue && typeof dateValue.toDate === 'function')) {
      dateObj = dateValue.toDate();
    } 
    // Handle Date object
    else if (dateValue instanceof Date) {
      dateObj = dateValue;
    }
    // Handle string or number
    else {
      dateObj = new Date(dateValue);
    }

    // Check if valid date
    if (isNaN(dateObj.getTime())) {
      console.warn("Invalid date value encountered:", dateValue);
      return fallback;
    }

    return dateObj.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  } catch (error) {
    console.error("Error parsing date:", error, dateValue);
    return fallback;
  }
}

/**
 * Gets the current week number (1-53)
 * @param date The date to get the week number for
 * @returns The week number
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
}

/**
 * Gets the start and end of the current week (Monday to Sunday)
 * @returns { start: Date, end: Date }
 */
export function getCurrentWeekRange(): { start: Date, end: Date } {
  const now = new Date();
  const day = now.getDay(); // 0 (Sun) to 6 (Sat)
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  const start = new Date(now.setDate(diff));
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  const endDate = new Date(start);
  endDate.setDate(start.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);
  
  return { start, end: endDate };
}
