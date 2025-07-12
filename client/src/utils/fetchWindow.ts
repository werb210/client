/**
 * Fetch Window Control
 * Limits API fetches to twice daily (12:00 PM and 12:00 AM MST)
 * Uses cached data for all other times
 */

export interface FetchWindowInfo {
  isAllowed: boolean;
  nextWindow: Date;
  currentTime: Date;
  reason: string;
}

/**
 * Check if current time is within allowed fetch window
 * @returns true only during 12:00 PM MST (19:00 UTC) or 12:00 AM MST (07:00 UTC)
 */
export function isAllowedToFetchNow(): boolean {
  const now = new Date();
  const utcHour = now.getUTCHours();
  
  // MST is UTC-7, so 12PM MST = 19 UTC, 12AM MST = 7 UTC
  return utcHour === 7 || utcHour === 19;
}

/**
 * Get detailed fetch window information for debugging
 */
export function getFetchWindowInfo(): FetchWindowInfo {
  const now = new Date();
  const utcHour = now.getUTCHours();
  const isAllowed = utcHour === 7 || utcHour === 19;
  
  let nextWindow: Date;
  let reason: string;
  
  if (isAllowed) {
    reason = `Currently in fetch window (${utcHour === 7 ? '12:00 AM' : '12:00 PM'} MST)`;
    // Next window is 12 hours from now
    nextWindow = new Date(now.getTime() + 12 * 60 * 60 * 1000);
  } else {
    reason = `Outside fetch window (current: ${utcHour}:00 UTC)`;
    
    // Calculate next window
    if (utcHour < 7) {
      // Next window is 7 UTC today
      nextWindow = new Date(now);
      nextWindow.setUTCHours(7, 0, 0, 0);
    } else if (utcHour < 19) {
      // Next window is 19 UTC today
      nextWindow = new Date(now);
      nextWindow.setUTCHours(19, 0, 0, 0);
    } else {
      // Next window is 7 UTC tomorrow
      nextWindow = new Date(now);
      nextWindow.setUTCDate(nextWindow.getUTCDate() + 1);
      nextWindow.setUTCHours(7, 0, 0, 0);
    }
  }
  
  return {
    isAllowed,
    nextWindow,
    currentTime: now,
    reason
  };
}

/**
 * Format time for MST display
 */
export function formatMSTTime(date: Date): string {
  // Convert UTC to MST (UTC-7)
  const mstDate = new Date(date.getTime() - 7 * 60 * 60 * 1000);
  return mstDate.toLocaleString('en-US', {
    timeZone: 'America/Denver',
    hour12: true,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}