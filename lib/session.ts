const STORAGE_KEY = "hyper-talent-session-id"

let memorySessionId: string | null = null

const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined"

export const getSessionId = (): string | null => {
  if (!memorySessionId && isBrowser()) {
    memorySessionId = window.localStorage.getItem(STORAGE_KEY)
  }
  return memorySessionId
}

export const setSessionId = (value: string | null) => {
  memorySessionId = value
  if (!isBrowser()) return

  if (value) {
    window.localStorage.setItem(STORAGE_KEY, value)
  } else {
    window.localStorage.removeItem(STORAGE_KEY)
  }
}

export const clearSessionId = () => {
  memorySessionId = null
  if (isBrowser()) {
    window.localStorage.removeItem(STORAGE_KEY)
  }
}
