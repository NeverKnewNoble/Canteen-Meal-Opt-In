/**
 * Typed fetch helper for internal /api routes (client-side utils call the server DB layer).
 */

type Json = Record<string, unknown> | unknown[] | null;

function buildHeaders(init?: RequestInit, hasJsonBody?: boolean): HeadersInit {
  const base = new Headers(init?.headers);
  if (hasJsonBody && !base.has('Content-Type')) {
    base.set('Content-Type', 'application/json');
  }
  return base;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const hasBody = init?.body != null;
  const res = await fetch(path, {
    ...init,
    headers: buildHeaders(init, hasBody),
  });
  const text = await res.text();
  let body: Json;
  try {
    body = text ? (JSON.parse(text) as Json) : null;
  } catch {
    throw new Error(text || res.statusText);
  }
  if (!res.ok) {
    const errObj = body as { error?: string } | null;
    throw new Error(errObj?.error || res.statusText);
  }
  return body as T;
}
