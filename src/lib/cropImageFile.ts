export type CropMode = "fill" | "fit";

export type ImageCropTransform = {
  mode: CropMode;
  zoom: number;
  /** Pan in crop-frame pixels (same space as `frameWidth` / `frameHeight`). */
  pan: { x: number; y: number };
  frameWidth: number;
  frameHeight: number;
};

const OUTPUT_LONG_EDGE = 2048;

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for crop"));
    };
    img.src = url;
  });
}

function canvasToFile(
  canvas: HTMLCanvasElement,
  name: string,
  type: string
): Promise<File> {
  const outType =
    type === "image/png" || type === "image/webp" ? type : "image/jpeg";
  const quality = outType === "image/jpeg" ? 0.92 : undefined;
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to encode cropped image"));
          return;
        }
        const base = name.replace(/\.[^.]+$/, "") || "photo";
        const ext =
          outType === "image/png"
            ? "png"
            : outType === "image/webp"
              ? "webp"
              : "jpg";
        resolve(new File([blob], `${base}-cropped.${ext}`, { type: outType }));
      },
      outType,
      quality
    );
  });
}

/**
 * Bake fill/fit + zoom + pan into a new image file matching `aspectRatio`.
 * Transform math mirrors the crop editor (image centered in frame, then panned).
 */
export async function bakeCroppedImageFile(
  file: File,
  aspectRatio: number,
  transform: ImageCropTransform
): Promise<File> {
  const img = await loadImageFromFile(file);
  const natW = img.naturalWidth || img.width;
  const natH = img.naturalHeight || img.height;
  if (!natW || !natH) return file;

  const frameW = Math.max(1, transform.frameWidth);
  const frameH = Math.max(1, transform.frameHeight);
  const zoom = Math.max(1, transform.zoom || 1);

  const sx = frameW / natW;
  const sy = frameH / natH;
  const base =
    transform.mode === "fit" ? Math.min(sx, sy) : Math.max(sx, sy);
  const scale = base * zoom;

  let outW: number;
  let outH: number;
  if (aspectRatio >= 1) {
    outW = OUTPUT_LONG_EDGE;
    outH = Math.max(1, Math.round(OUTPUT_LONG_EDGE / aspectRatio));
  } else {
    outH = OUTPUT_LONG_EDGE;
    outW = Math.max(1, Math.round(OUTPUT_LONG_EDGE * aspectRatio));
  }

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, outW, outH);

  const left = (frameW - natW * scale) / 2 + transform.pan.x;
  const top = (frameH - natH * scale) / 2 + transform.pan.y;
  const ox = outW / frameW;
  const oy = outH / frameH;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    img,
    0,
    0,
    natW,
    natH,
    left * ox,
    top * oy,
    natW * scale * ox,
    natH * scale * oy
  );

  return canvasToFile(canvas, file.name, file.type || "image/jpeg");
}
