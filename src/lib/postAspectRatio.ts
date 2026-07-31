/**
 * Instagram-style post frame aspect ratios (width / height).
 * - Story / tall: 9:16
 * - Portrait: 4:5
 * - Square: 1:1
 * - Landscape (mild): 5:4
 * - Landscape (wide): 16:9
 */
export const POST_ASPECT_STORY = 9 / 16;
export const POST_ASPECT_PORTRAIT = 4 / 5;
export const POST_ASPECT_SQUARE = 1;
export const POST_ASPECT_FIVE_FOUR = 5 / 4;
export const POST_ASPECT_LANDSCAPE = 16 / 9;

/** Discrete frames posts snap to (after clamping into the allowed range). */
export const POST_ASPECT_STANDARDS = [
  POST_ASPECT_STORY,
  POST_ASPECT_PORTRAIT,
  POST_ASPECT_SQUARE,
  POST_ASPECT_FIVE_FOUR,
  POST_ASPECT_LANDSCAPE,
] as const;

export const POST_ASPECT_OPTIONS = [
  {
    id: "story" as const,
    label: "Story",
    shortLabel: "9:16",
    ratio: POST_ASPECT_STORY,
  },
  {
    id: "portrait" as const,
    label: "Portrait",
    shortLabel: "4:5",
    ratio: POST_ASPECT_PORTRAIT,
  },
  {
    id: "square" as const,
    label: "Square",
    shortLabel: "1:1",
    ratio: POST_ASPECT_SQUARE,
  },
  {
    id: "fiveFour" as const,
    label: "Landscape",
    shortLabel: "5:4",
    ratio: POST_ASPECT_FIVE_FOUR,
  },
  {
    id: "wide" as const,
    label: "Wide",
    shortLabel: "16:9",
    ratio: POST_ASPECT_LANDSCAPE,
  },
];

export type PostAspectOptionId = (typeof POST_ASPECT_OPTIONS)[number]["id"];

export function isValidPostAspectRatio(value: unknown): value is number {
  if (typeof value !== "number" || !Number.isFinite(value)) return false;
  if (POST_ASPECT_STANDARDS.some((s) => Math.abs(s - value) < 0.001)) return true;
  // Legacy wide frame stored as ~1.91 before switching to 16:9
  return Math.abs(value - 1.91) < 0.001;
}

export function parsePostAspectRatio(value: unknown): number | undefined {
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    if (!isValidPostAspectRatio(n)) return undefined;
    return nearestStandard(n);
  }
  if (!isValidPostAspectRatio(value)) return undefined;
  return nearestStandard(value);
}

export const POST_MODAL_SIDEBAR_WIDTH = 400;
export const POST_MODAL_MAX_MEDIA_WIDTH = 935;
export const POST_MODAL_MAX_HEIGHT_VH = 0.9;

export type PostAspectKind =
  | "story"
  | "portrait"
  | "square"
  | "fiveFour"
  | "landscape";

function nearestStandard(ratio: number): number {
  let best: number = POST_ASPECT_SQUARE;
  let bestDist = Infinity;
  for (const s of POST_ASPECT_STANDARDS) {
    const d = Math.abs(s - ratio);
    if (d < bestDist) {
      bestDist = d;
      best = s;
    }
  }
  return best;
}

/**
 * Map natural pixel size → display frame ratio.
 * Clamps into [9:16, 16:9], then snaps to the nearest standard
 * (9:16, 4:5, 1:1, 5:4, or 16:9).
 */
export function clampPostAspectRatio(width: number, height: number): number {
  if (!width || !height || !Number.isFinite(width) || !Number.isFinite(height)) {
    return POST_ASPECT_SQUARE;
  }
  const raw = width / height;
  const clamped = Math.min(
    POST_ASPECT_LANDSCAPE,
    Math.max(POST_ASPECT_STORY, raw)
  );
  return nearestStandard(clamped);
}

export function classifyPostAspect(ratio: number): PostAspectKind {
  const snapped = nearestStandard(ratio);
  if (snapped === POST_ASPECT_STORY) return "story";
  if (snapped === POST_ASPECT_PORTRAIT) return "portrait";
  if (snapped === POST_ASPECT_FIVE_FOUR) return "fiveFour";
  if (snapped === POST_ASPECT_LANDSCAPE) return "landscape";
  return "square";
}

/**
 * Modal media box size for a given frame ratio.
 * Portrait → taller modal; landscape → shorter/wider media pane.
 * Always fits within the viewport (media + sidebar).
 */
export function modalMediaBoxSize(
  aspectRatio: number,
  viewportWidth: number,
  viewportHeight: number,
  opts?: { sidebarWidth?: number; stacked?: boolean }
): { width: number; height: number } {
  const ar =
    aspectRatio > 0 && Number.isFinite(aspectRatio)
      ? aspectRatio
      : POST_ASPECT_SQUARE;
  const sidebar = opts?.sidebarWidth ?? POST_MODAL_SIDEBAR_WIDTH;
  const stacked = Boolean(opts?.stacked);
  const maxH = viewportHeight * POST_MODAL_MAX_HEIGHT_VH;
  const pad = 32;

  if (stacked) {
    const width = Math.min(viewportWidth - pad, POST_MODAL_MAX_MEDIA_WIDTH);
    let height = width / ar;
    const maxStackedH = viewportHeight * 0.55;
    if (height > maxStackedH) {
      height = maxStackedH;
      return { width: Math.max(200, height * ar), height };
    }
    return { width, height };
  }

  const maxMediaW = Math.min(
    POST_MODAL_MAX_MEDIA_WIDTH,
    Math.max(240, viewportWidth - pad - sidebar)
  );

  let width: number;
  let height: number;

  // Landscape: grow width first. Portrait: grow height first.
  if (ar >= 1) {
    width = maxMediaW;
    height = width / ar;
    if (height > maxH) {
      height = maxH;
      width = height * ar;
    }
  } else {
    height = maxH;
    width = height * ar;
    if (width > maxMediaW) {
      width = maxMediaW;
      height = width / ar;
    }
  }

  // Keep media + sidebar inside the viewport so actions (e.g. bookmark) aren't clipped.
  const totalW = width + sidebar;
  const availW = Math.max(320, viewportWidth - pad);
  if (totalW > availW) {
    const scale = availW / totalW;
    width *= scale;
    height *= scale;
  }
  if (height > maxH) {
    const scale = maxH / height;
    width *= scale;
    height *= scale;
  }

  return {
    width: Math.max(200, width),
    height: Math.max(200, height),
  };
}

export function loadImageSize(
  url: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const done = () => {
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;
      if (width > 0 && height > 0) resolve({ width, height });
      else reject(new Error("Image has no dimensions"));
    };
    img.onload = done;
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
    // Cached images may already be complete before onload binds.
    if (img.complete) done();
  });
}
