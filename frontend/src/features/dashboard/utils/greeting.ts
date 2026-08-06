/** Time-of-day greeting for the dashboard header. */
export function getTimeOfDayGreeting(date = new Date()): "Good morning" | "Good afternoon" | "Good evening" {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
