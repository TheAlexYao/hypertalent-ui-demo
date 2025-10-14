const STORAGE_KEY = "hyper-talent-session-id"

let memorySessionId: string | null = null

const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined"

const setMemorySessionId = (value: string | null) => {
  memorySessionId = value
}

export const getSessionId = (): string | null => {
  if (!memorySessionId && isBrowser()) {
    memorySessionId = window.localStorage.getItem(STORAGE_KEY)
  }
  return memorySessionId
}

export const hydrateSessionId = (value: string | null) => {
  setMemorySessionId(value)
}

export const setSessionId = (value: string | null) => {
  setMemorySessionId(value)
  if (!isBrowser()) return

  if (value) {
    window.localStorage.setItem(STORAGE_KEY, value)
  } else {
    window.localStorage.removeItem(STORAGE_KEY)
  }
}

export const clearSessionId = () => {
  setMemorySessionId(null)
  if (isBrowser()) {
    window.localStorage.removeItem(STORAGE_KEY)
  }
}
