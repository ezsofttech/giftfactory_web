/** Ensures the current form value appears in the dropdown even if the remote list uses different spelling. */
export function mergeLocationOptions(list: string[], currentValue: string | undefined): string[] {
  const next = new Set(list.filter(Boolean).map((s) => s.trim()).filter(Boolean));
  const cur = currentValue?.trim();
  if (cur) next.add(cur);
  return Array.from(next).sort((a, b) => a.localeCompare(b));
}
