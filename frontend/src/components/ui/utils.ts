/** Combina nombres de clase ignorando valores falsos. */
export function cn(...clases: Array<string | false | null | undefined>) {
  return clases.filter(Boolean).join(" ");
}
