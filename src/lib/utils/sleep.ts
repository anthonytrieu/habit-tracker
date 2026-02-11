/**
 * Calculate sleep hours from bedtime and wake time strings.
 * If bedtime > wakeTime, assumes the user crossed midnight.
 */
export function calculateSleepHours(bedtime: string, wakeTime: string): number {
  const [bedH, bedM] = bedtime.split(":").map(Number);
  const [wakeH, wakeM] = wakeTime.split(":").map(Number);

  const bedMinutes = bedH * 60 + bedM;
  const wakeMinutes = wakeH * 60 + wakeM;

  let diff = wakeMinutes - bedMinutes;
  if (diff <= 0) {
    diff += 24 * 60; // crossed midnight
  }

  return Math.round((diff / 60) * 100) / 100;
}
