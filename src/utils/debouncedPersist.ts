/**
 * Coalesces rapid local edits (e.g. per-keystroke field updates) into a single
 * background Supabase write per `key`, so the store's `update*` actions can
 * stay synchronous/optimistic without hammering the network on every change.
 */
type ErrorReporter = (err: unknown) => void

const timers = new Map<string, ReturnType<typeof setTimeout>>()
const pendingPatches = new Map<string, Record<string, unknown>>()

/** Merges successive partial patches for `key` and flushes the merged result after a quiet period. */
export function debouncedPatch<P extends Record<string, unknown>>(
  key: string,
  patch: P,
  flush: (merged: P) => Promise<void>,
  onError: ErrorReporter,
  delayMs = 500,
): void {
  const merged = { ...(pendingPatches.get(key) ?? {}), ...patch }
  pendingPatches.set(key, merged)

  const existing = timers.get(key)
  if (existing) clearTimeout(existing)

  timers.set(
    key,
    setTimeout(() => {
      pendingPatches.delete(key)
      timers.delete(key)
      flush(merged as P).catch(onError)
    }, delayMs),
  )
}

/** Runs `run` after a quiet period for `key`; a new call cancels any pending run still waiting. */
export function debouncedRun(key: string, run: () => Promise<void>, onError: ErrorReporter, delayMs = 500): void {
  const existing = timers.get(key)
  if (existing) clearTimeout(existing)

  timers.set(
    key,
    setTimeout(() => {
      timers.delete(key)
      run().catch(onError)
    }, delayMs),
  )
}
