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
