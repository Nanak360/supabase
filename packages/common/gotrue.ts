import { GoTrueClient, navigatorLock } from '@supabase/gotrue-js'

export const STORAGE_KEY = process.env.NEXT_PUBLIC_STORAGE_KEY || 'supabase.dashboard.auth.token'
export const AUTH_DEBUG_KEY =
  process.env.NEXT_PUBLIC_AUTH_DEBUG_KEY || 'supabase.dashboard.auth.debug'

const debug =
  process.env.NEXT_PUBLIC_IS_PLATFORM === 'true' &&
  globalThis &&
  globalThis.localStorage &&
  globalThis.localStorage.getItem(AUTH_DEBUG_KEY) === 'true'

let customFetch = globalThis.fetch

if (debug) {
  customFetch = async (a, b) => {
    const el = (event: any) => {
      event.preventDefault()
      console.log('GoTrue fetch in progress detected in beforeunload!', a, b)
    }

    try {
      if (document) {
        document.addEventListener('beforeunload', el, { capture: true })
      }

      return await globalThis.fetch(a, b)
    } finally {
      if (document) {
        document.removeEventListener('beforeunload', el, { capture: true })
      }
    }
  }
}

let previousOperation: Promise<any> = Promise.resolve()

export async function lockTab<R>(
  name: string,
  acquireTimeout: number,
  fn: () => Promise<R>
): Promise<R> {
  try {
    await previousOperation
  } catch (e: any) {
    // not important
  }

  previousOperation = fn

  return await previousOperation
}

export const gotrueClient = new GoTrueClient({
  url: process.env.NEXT_PUBLIC_GOTRUE_URL,
  storageKey: STORAGE_KEY,
  detectSessionInUrl: true,
  debug,
  fetch: customFetch,
  lock: globalThis.navigator && globalThis.navigator.locks ? navigatorLock : null,
})
