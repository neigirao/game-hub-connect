import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

// C14: redirect / to /home.html at Worker level — eliminates React hydration flash
// Exception: OAuth callbacks carry ?code= and must reach the React app to exchange the token
function isRootRequest(url: URL): boolean {
  if (url.searchParams.has("code") || url.searchParams.has("access_token")) return false;
  return url.pathname === "/" || url.pathname === "";
}

// C10: generates a branded SVG og:image for the /share page
function ogShareImage(score: string, stars: string, speed: string, g: string): Response {
  const starCount = Math.min(3, Math.max(0, Number(stars)));
  const starEmoji = "⭐".repeat(starCount) + "☆".repeat(3 - starCount);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1c0d52"/>
      <stop offset="100%" stop-color="#0b052b"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="0" width="1200" height="6" fill="#FF6BD6"/>
  <!-- Logo badge -->
  <rect x="60" y="52" width="48" height="48" rx="12" fill="#FFA502"/>
  <text x="84" y="86" font-family="system-ui,sans-serif" font-size="28" text-anchor="middle" fill="#0E0726">🎢</text>
  <text x="126" y="88" font-family="system-ui,sans-serif" font-weight="700" font-size="26" fill="#fff">CRASH COASTER</text>
  <!-- Stars -->
  <text x="600" y="220" font-family="system-ui,sans-serif" font-size="72" text-anchor="middle">${starEmoji}</text>
  <!-- Score -->
  <text x="600" y="360" font-family="monospace" font-weight="700" font-size="140" text-anchor="middle" fill="#FFA502">${score}</text>
  <text x="600" y="410" font-family="system-ui,sans-serif" font-size="28" text-anchor="middle" fill="#B7AEE0">pontos</text>
  <!-- Stats -->
  <text x="380" y="510" font-family="monospace" font-weight="700" font-size="36" text-anchor="middle" fill="#70A1FF">${speed} km/h</text>
  <text x="380" y="545" font-family="system-ui,sans-serif" font-size="20" text-anchor="middle" fill="#B7AEE0">Velocidade</text>
  <text x="820" y="510" font-family="monospace" font-weight="700" font-size="36" text-anchor="middle" fill="#FF4757">${g}G</text>
  <text x="820" y="545" font-family="system-ui,sans-serif" font-size="20" text-anchor="middle" fill="#B7AEE0">G-Force</text>
  <!-- Tagline -->
  <text x="600" y="600" font-family="system-ui,sans-serif" font-size="18" text-anchor="middle" fill="#4a2aa6">The game where failing is more fun than winning</text>
</svg>`;
  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml",
      "cache-control": "public, max-age=3600",
    },
  });
}

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
    "font-src fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://lovable.dev",
    "img-src 'self' data: https://*.supabase.co lh3.googleusercontent.com",
    "frame-ancestors 'none'",
  ].join("; "),
};

function addSecurityHeaders(response: Response): Response {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) return response;
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) headers.set(k, v);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);

    // C14: Worker-level redirect / → /home.html (no React hydration flash)
    if (isRootRequest(url)) {
      return Response.redirect(new URL("/home.html", request.url).toString(), 302);
    }

    // C10: og:image endpoint for /share page
    if (url.pathname === "/api/og/share") {
      return ogShareImage(
        url.searchParams.get("score") ?? "0",
        url.searchParams.get("stars") ?? "0",
        url.searchParams.get("speed") ?? "0",
        url.searchParams.get("g") ?? "0",
      );
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);
      return addSecurityHeaders(normalized);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
