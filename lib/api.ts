import { toast } from "sonner";
import { clearSession, getAccessToken, getRefreshToken, setSession } from "@/lib/session";
import type { ApiResponse, AuthTokens } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5290";

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors: string[] = []
  ) {
    super(message);
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return false;
  const json = (await res.json()) as ApiResponse<AuthTokens>;
  if (!json.success || !json.data) return false;
  setSession(json.data);
  return true;
}

async function requestFull<T>(path: string, init: RequestInit = {}, retry = true): Promise<ApiResponse<T>> {
  const headers = new Headers(init.headers);
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!(init.body instanceof FormData) && !headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (res.status === 401 && retry) {
    refreshPromise ??= refreshTokens().finally(() => {
      refreshPromise = null;
    });
    const ok = await refreshPromise;
    if (ok) return requestFull<T>(path, init, false);
    clearSession();
    if (typeof window !== "undefined") {
      window.location.replace("/login");
    }
    throw new ApiError("نشست شما منقضی شده است.", 401);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    if (!res.ok) throw new ApiError("خطای سرور", res.status);
    return { success: true, data: undefined as T, message: null, errors: null, pagination: null };
  }

  const json = (await res.json()) as ApiResponse<T>;
  if (!res.ok || json.success === false) {
    throw new ApiError(json.message ?? "خطایی رخ داد.", res.status, json.errors ?? []);
  }
  return json;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const json = await requestFull<T>(path, init);
  return json.data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  getPaged: <T>(path: string) => requestFull<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  upload: <T>(path: string, form: FormData) => request<T>(path, { method: "POST", body: form }),
  blob: async (path: string) => {
    const headers = new Headers();
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const res = await fetch(`${API_URL}${path}`, { headers, credentials: "include" });
    if (!res.ok) throw new ApiError("دانلود ناموفق بود.", res.status);
    return res.blob();
  },
};

export function notifyError(error: unknown) {
  if (error instanceof ApiError) {
    toast.error(error.message, {
      description: error.errors.filter((e) => e !== error.message).join("، "),
    });
    return;
  }
  toast.error("خطای پیش‌بینی‌نشده رخ داد.");
}

export { ApiError, API_URL };
