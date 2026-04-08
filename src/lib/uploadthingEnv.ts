/**
 * UploadThing v7+ expects `UPLOADTHING_TOKEN`: base64 JSON
 * `{ apiKey: "sk_...", appId: string, regions: string[], ingestHost?: string }`.
 *
 * Set either:
 * - `UPLOADTHING_TOKEN` — full string from the dashboard “Token” field, or
 * - `UPLOADTHING_SECRET` (sk_…) + `UPLOADTHING_APP_ID` + `UPLOADTHING_REGIONS` (comma‑separated, e.g. `sea1`).
 */

function normalizeEnvValue(raw: string | undefined): string | undefined {
  if (raw === undefined) return undefined;
  let s = raw.trim();
  if (
    (s.startsWith("'") && s.endsWith("'") && s.length >= 2) ||
    (s.startsWith('"') && s.endsWith('"') && s.length >= 2)
  ) {
    s = s.slice(1, -1).trim();
  }
  return s || undefined;
}

function parseUploadThingTokenPayload(base64: string): unknown {
  const json = Buffer.from(base64, "base64").toString("utf8");
  return JSON.parse(json) as unknown;
}

function isValidUploadThingTokenShape(raw: string): boolean {
  try {
    const data = parseUploadThingTokenPayload(raw) as {
      apiKey?: unknown;
      appId?: unknown;
      regions?: unknown;
    };
    if (typeof data.apiKey !== "string" || !data.apiKey.startsWith("sk_")) return false;
    if (typeof data.appId !== "string" || !data.appId) return false;
    if (!Array.isArray(data.regions) || data.regions.length === 0) return false;
    if (!data.regions.every((r) => typeof r === "string")) return false;
    return true;
  } catch {
    return false;
  }
}

/** Build dashboard-style token from sk_ key + app id + regions (when UPLOADTHING_TOKEN is not set). */
function tryEncodeTokenFromSecretParts(): string | undefined {
  const apiKey = normalizeEnvValue(process.env.UPLOADTHING_SECRET);
  if (!apiKey?.startsWith("sk_")) return undefined;

  const appId = normalizeEnvValue(process.env.UPLOADTHING_APP_ID);
  if (!appId) return undefined;

  const regionsRaw =
    normalizeEnvValue(process.env.UPLOADTHING_REGIONS) ??
    normalizeEnvValue(process.env.UPLOADTHING_REGION);
  if (!regionsRaw) return undefined;

  const regions = regionsRaw
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);
  if (regions.length === 0) return undefined;

  const payload = { apiKey, appId, regions };
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
}

/**
 * Resolves the raw base64 dashboard token string.
 */
export function resolveUploadThingToken(): string | undefined {
  const fromToken = normalizeEnvValue(process.env.UPLOADTHING_TOKEN);
  if (fromToken) {
    if (fromToken.startsWith("sk_")) return undefined;
    return fromToken;
  }

  const encoded = tryEncodeTokenFromSecretParts();
  if (encoded && isValidUploadThingTokenShape(encoded)) return encoded;

  const secret = normalizeEnvValue(process.env.UPLOADTHING_SECRET);
  if (secret && !secret.startsWith("sk_") && isValidUploadThingTokenShape(secret)) {
    return secret;
  }

  return undefined;
}

/** Ensures `process.env.UPLOADTHING_TOKEN` is set for `UTApi` and `createRouteHandler`. */
export function ensureUploadThingTokenInEnv(): void {
  const token = resolveUploadThingToken();
  if (token) process.env.UPLOADTHING_TOKEN = token;
}

function formatConfigHint(): string {
  const hasSk = normalizeEnvValue(process.env.UPLOADTHING_SECRET)?.startsWith("sk_");
  const hasAppId = Boolean(normalizeEnvValue(process.env.UPLOADTHING_APP_ID));
  const hasRegions = Boolean(
    normalizeEnvValue(process.env.UPLOADTHING_REGIONS) ??
      normalizeEnvValue(process.env.UPLOADTHING_REGION)
  );

  if (hasSk && (!hasAppId || !hasRegions)) {
    return (
      " You have UPLOADTHING_SECRET set; add UPLOADTHING_APP_ID and UPLOADTHING_REGIONS (e.g. sea1) " +
        "from the UploadThing dashboard, or set UPLOADTHING_TOKEN to the full base64 token instead."
    );
  }

  return (
    " Set UPLOADTHING_TOKEN to the full token from UploadThing → API Keys, or set UPLOADTHING_SECRET, " +
      "UPLOADTHING_APP_ID, and UPLOADTHING_REGIONS together."
  );
}

export function assertUploadThingTokenConfigured(): void {
  ensureUploadThingTokenInEnv();
  const t = normalizeEnvValue(process.env.UPLOADTHING_TOKEN);
  if (!t || !isValidUploadThingTokenShape(t)) {
    throw new Error(
      "UploadThing: missing or invalid token." +
        formatConfigHint()
    );
  }
}
