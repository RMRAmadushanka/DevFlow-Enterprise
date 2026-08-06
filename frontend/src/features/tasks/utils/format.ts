export function formatMinutes(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return "0m";
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function isOverdue(dueDate?: string, status?: string): boolean {
  if (!dueDate) return false;
  if (status === "done" || status === "archived") return false;
  return new Date(dueDate).getTime() < Date.now();
}

export function checklistProgress(completed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((completed / total) * 100);
}
