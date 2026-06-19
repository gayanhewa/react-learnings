// CONCEPT: a fetch wrapper that transparently handles access-token expiry.
// On a 401 it calls /api/refresh once, then retries the original request.
// PROD: this is exactly the "interceptor" an auth library installs for you
// (axios interceptor / library middleware). You rarely write it by hand - but
// understanding it is how you debug "why am I randomly getting logged out".

// GOTCHA: the single-flight guard. When the access token expires, SEVERAL
// requests can 401 at once. Without this, each fires its own /refresh, racing
// and rotating tokens chaotically. We keep ONE in-flight refresh promise and
// make every concurrent 401 await the same one.
let refreshPromise: Promise<boolean> | null = null;

async function refreshOnce(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch("/api/refresh", {
      method: "POST",
      credentials: "include", // send the refresh cookie
    })
      .then((res) => res.ok)
      .finally(() => {
        refreshPromise = null; // reset so the next expiry can refresh again
      });
  }
  return refreshPromise;
}

export async function authFetch(
  input: RequestInfo,
  init: RequestInit = {},
): Promise<Response> {
  // credentials: "include" makes the browser send our httpOnly auth cookies.
  // (We never read the token in JS - that's the point of httpOnly.)
  const opts: RequestInit = { ...init, credentials: "include" };

  let res = await fetch(input, opts);
  if (res.status !== 401) return res;

  // Access token likely expired - try one refresh, then replay the request.
  const refreshed = await refreshOnce();
  if (!refreshed) return res; // refresh failed -> caller treats as logged out
  res = await fetch(input, opts);
  return res;
}
