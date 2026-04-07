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
