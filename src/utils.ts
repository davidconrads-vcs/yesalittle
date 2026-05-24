export function resolveByNativeLang(
  field: Record<string, string> | undefined,
  nativeLang: string,
): string | undefined {
  if (!field) return undefined
  return field[nativeLang] ?? field['en-US'] ?? Object.values(field)[0] ?? undefined
}
