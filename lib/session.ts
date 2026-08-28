import type { AuthTokens } from "@/types";

const ACCESS_KEY = "saman.accessToken";
const USER_KEY = "saman.user";
const REFRESH_KEY = "saman.refreshToken";
const SESSION_EVENT = "saman-session";

export type SessionUser = {
  username: string;
  role: AuthTokens["role"];
  storeId: string | null;
};

let cachedRaw: string | null = null;
let cachedUser: SessionUser | null = null;
let cacheReady = false;

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

function emitSessionChange() {
  cachedRaw = null;
  cachedUser = null;
  cacheReady = false;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SESSION_EVENT));
  }
}

export function getServerSessionUser(): SessionUser | null {
  return null;
}

export function subscribeSession(onChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }
  window.addEventListener(SESSION_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(SESSION_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function getAccessToken(): string | null {
  return storage()?.getItem(ACCESS_KEY) ?? null;
}

export function getSessionUser(): SessionUser | null {
  const store = storage();
  if (!store) return null;
  const raw = store.getItem(USER_KEY);
  if (cacheReady && raw === cachedRaw) {
    return cachedUser;
  }
  cachedRaw = raw;
  cacheReady = true;
  if (!raw) {
    cachedUser = null;
    return null;
  }
  try {
    cachedUser = JSON.parse(raw) as SessionUser;
    return cachedUser;
  } catch {
    cachedUser = null;
    return null;
  }
}

export function setSession(tokens: AuthTokens) {
  const store = storage();
  if (!store) return;
  store.setItem(ACCESS_KEY, tokens.accessToken);
  store.setItem(
    USER_KEY,
    JSON.stringify({
      username: tokens.username,
      role: tokens.role,
      storeId: tokens.storeId,
    } satisfies SessionUser)
  );
  if (tokens.refreshToken) {
    store.setItem(REFRESH_KEY, tokens.refreshToken);
  }
  // Migrate away from legacy sessionStorage keys
  try {
    sessionStorage.removeItem(ACCESS_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
  } catch {
    /* ignore */
  }
  emitSessionChange();
}

export function clearSession() {
  const store = storage();
  store?.removeItem(ACCESS_KEY);
  store?.removeItem(USER_KEY);
  store?.removeItem(REFRESH_KEY);
  try {
    sessionStorage.removeItem(ACCESS_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
  } catch {
    /* ignore */
  }
  emitSessionChange();
}

export function getRefreshToken(): string | null {
  return storage()?.getItem(REFRESH_KEY) ?? null;
}

/** One-time move of legacy sessionStorage auth into localStorage. */
export function migrateLegacySession() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(ACCESS_KEY)) return;
  const access = sessionStorage.getItem(ACCESS_KEY);
  const user = sessionStorage.getItem(USER_KEY);
  const refresh = sessionStorage.getItem(REFRESH_KEY);
  if (!access || !user) return;
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(USER_KEY, user);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  sessionStorage.removeItem(ACCESS_KEY);
  sessionStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
  emitSessionChange();
}
