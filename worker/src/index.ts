/**
 * Tally OAuth token-exchange proxy.
 *
 * Google requires a client_secret at the token endpoint even when the client
 * uses PKCE, so a public extension bundle cannot complete the exchange on its
 * own. This Worker holds the secret and performs the exchange, so nothing
 * confidential ships to users. The extension still generates and keeps its own
 * PKCE verifier -- this Worker never sees a user's tokens outside the response
 * it proxies back.
 */

export interface Env {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  /** Comma-separated extension origins permitted to call this Worker. */
  ALLOWED_ORIGINS: string;
}

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

function corsHeaders(origin: string | null, env: Env): HeadersInit {
  const ok = isAllowed(origin, env);
  return {
    "Access-Control-Allow-Origin": ok && origin ? origin : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

/**
 * Firefox assigns every install a random moz-extension:// UUID, so that origin
 * cannot be enumerated ahead of time -- entries ending in "*" match by prefix.
 *
 * This is CORS hygiene, not an access control boundary: any non-browser client
 * can spoof an Origin header. The exchange is protected by the fact that it is
 * useless without a fresh authorization code and the matching PKCE verifier.
 */
function isAllowed(origin: string | null, env: Env): boolean {
  if (!origin) return false;
  return env.ALLOWED_ORIGINS.split(",")
    .map((o) => o.trim())
    .some((a) => (a.endsWith("*") ? origin.startsWith(a.slice(0, -1)) : a === origin));
}

function json(body: unknown, status: number, headers: HeadersInit): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}

async function exchange(
  params: Record<string, string>,
  env: Env,
  headers: HeadersInit,
): Promise<Response> {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      ...params,
    }),
  });

  const data = (await res.json()) as TokenResponse;

  if (!res.ok || data.error) {
    return json(
      { error: data.error ?? "token_exchange_failed", detail: data.error_description },
      res.status === 200 ? 502 : res.status,
      headers,
    );
  }

  return json(
    {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in ?? 3600,
    },
    200,
    headers,
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin");
    const headers = corsHeaders(origin, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    if (!isAllowed(origin, env)) {
      return json({ error: "origin_not_allowed" }, 403, headers);
    }

    if (request.method !== "POST") {
      return json({ error: "method_not_allowed" }, 405, headers);
    }

    const url = new URL(request.url);
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return json({ error: "invalid_json" }, 400, headers);
    }

    if (url.pathname === "/token") {
      const { code, code_verifier, redirect_uri } = body;
      if (
        typeof code !== "string" ||
        typeof code_verifier !== "string" ||
        typeof redirect_uri !== "string"
      ) {
        return json({ error: "missing_parameters" }, 400, headers);
      }
      return exchange(
        { grant_type: "authorization_code", code, code_verifier, redirect_uri },
        env,
        headers,
      );
    }

    if (url.pathname === "/refresh") {
      const { refresh_token } = body;
      if (typeof refresh_token !== "string") {
        return json({ error: "missing_parameters" }, 400, headers);
      }
      return exchange(
        { grant_type: "refresh_token", refresh_token },
        env,
        headers,
      );
    }

    return json({ error: "not_found" }, 404, headers);
  },
};
