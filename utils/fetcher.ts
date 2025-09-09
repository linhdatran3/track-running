export class ApiError extends Error {
  status: number;
  info?: unknown;
  constructor(message: string, status: number, info?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.info = info;
  }
}

export interface FetchError {
  name?: string;
  message?: string;
}

export async function fetchJSON<T>(
  url: string,
  init?: RequestInit & { timeoutMs?: number }
): Promise<T> {
  const { timeoutMs = 20000, signal, ...rest } = init || {};
  const c = new AbortController();
  const timer = setTimeout(() => c.abort(), timeoutMs);
  const merged = mergeSignals(
    [signal, c.signal].filter(Boolean) as AbortSignal[]
  );

  try {
    const res = await fetch(url, {
      ...rest,
      signal: merged,
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", ...(rest.headers || {}) },
    });
    const text = await res.text();
    const data = text ? safeJsonParse(text) : null;
    if (!res.ok)
      throw new ApiError(data?.error || `HTTP ${res.status}`, res.status, data);
    return data as T;
  } catch (e) {
    if ((e as FetchError)?.name === "AbortError")
      throw new ApiError("Request aborted or timed out", 499);
    if (e instanceof ApiError) throw e;
    throw new ApiError((e as FetchError)?.message || "Network error", 0);
  } finally {
    clearTimeout(timer);
  }
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
function mergeSignals(signals: AbortSignal[]) {
  if (signals.length === 1) return signals[0];
  const ctrl = new AbortController();
  const onAbort = () => ctrl.abort();
  signals.forEach((s) => s.addEventListener("abort", onAbort));
  if (signals.some((s) => s.aborted)) ctrl.abort();
  return ctrl.signal;
}
