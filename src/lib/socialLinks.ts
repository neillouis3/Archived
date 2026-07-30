/** Resolve user input (URL or @handle / username) to a canonical https URL for profile links. */
export function resolveSocialUrl(
  platform: "twitter" | "instagram" | "linkedin" | "github" | "tiktok" | "youtube",
  raw: string
): string | null {
  const t = raw.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  const h = t.replace(/^@/, "").replace(/\/+$/, "");
  if (!h) return null;
  switch (platform) {
    case "twitter":
      return `https://x.com/${h}`;
    case "instagram":
      return `https://www.instagram.com/${h}/`;
    case "github":
      return `https://github.com/${h}`;
    case "linkedin":
      if (h.includes("linkedin.com")) {
        return /^https?:\/\//i.test(h) ? h : `https://${h.replace(/^\/+/, "")}`;
      }
      return `https://www.linkedin.com/in/${h}`;
    case "tiktok":
      return `https://www.tiktok.com/@${h.replace(/^@/, "")}`;
    case "youtube":
      if (h.includes("youtube.com") || h.includes("youtu.be")) {
        return /^https?:\/\//i.test(h) ? h : `https://${h.replace(/^\/+/, "")}`;
      }
      return `https://www.youtube.com/@${h.replace(/^@/, "")}`;
    default:
      return null;
  }
}

export type SocialMediaFields = {
  twitter: string;
  instagram: string;
  linkedin: string;
  github: string;
  tiktok: string;
  youtube: string;
};

export const emptySocialMedia = (): SocialMediaFields => ({
  twitter: "",
  instagram: "",
  linkedin: "",
  github: "",
  tiktok: "",
  youtube: "",
});

export function parseSocialMedia(meta: unknown): SocialMediaFields {
  const base = emptySocialMedia();
  if (!meta || typeof meta !== "object") return base;
  const o = meta as Record<string, unknown>;
  for (const k of Object.keys(base) as (keyof SocialMediaFields)[]) {
    const v = o[k];
    if (typeof v === "string") base[k] = v;
  }
  return base;
}

/** Display handle for profile chips, e.g. `@neillouis3`. */
export function formatSocialHandle(
  platform: keyof SocialMediaFields,
  raw: string
): string {
  const t = raw.trim();
  if (!t) return "";

  if (!/^https?:\/\//i.test(t)) {
    const h = t.replace(/^@/, "").replace(/\/+$/, "");
    return h ? `@${h}` : "";
  }

  try {
    const u = new URL(t);
    const parts = u.pathname.replace(/\/+$/, "").split("/").filter(Boolean);
    let handle = "";

    switch (platform) {
      case "linkedin": {
        const i = parts.indexOf("in");
        handle = (i >= 0 ? parts[i + 1] : parts[0]) ?? "";
        break;
      }
      case "youtube": {
        const at = parts.find((p) => p.startsWith("@"));
        handle = (at ?? parts[parts.length - 1] ?? "").replace(/^@/, "");
        break;
      }
      case "tiktok":
        handle = (parts[0] ?? "").replace(/^@/, "");
        break;
      default:
        handle = (parts[0] ?? "").replace(/^@/, "");
        break;
    }

    handle = handle.replace(/\/+$/, "");
    return handle ? `@${handle}` : t;
  } catch {
    return t;
  }
}

/** Form labels / placeholders (settings) and short labels (profile). */
export const SOCIAL_FIELD_CONFIG: {
  key: keyof SocialMediaFields;
  label: string;
  short: string;
  placeholder: string;
}[] = [
  { key: "twitter", label: "X (Twitter)", short: "X", placeholder: "@handle or https://x.com/…" },
  { key: "instagram", label: "Instagram", short: "IG", placeholder: "@handle or profile URL" },
  { key: "linkedin", label: "LinkedIn", short: "in", placeholder: "Profile URL or username" },
  { key: "github", label: "GitHub", short: "GH", placeholder: "@handle or github.com/…" },
  { key: "tiktok", label: "TikTok", short: "TT", placeholder: "@handle or profile URL" },
  { key: "youtube", label: "YouTube", short: "YT", placeholder: "Channel URL or @handle" },
];
