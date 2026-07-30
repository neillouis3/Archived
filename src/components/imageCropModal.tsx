"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Cancel01Icon, ZoomInAreaIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { bakeCroppedImageFile } from "@/lib/cropImageFile";

type Props = {
  open: boolean;
  file: File | null;
  /** Output frame width / height (1 = square avatar, 3 = wide banner). */
  aspectRatio: number;
  title?: string;
  /** Soft circular vignette for avatar previews. */
  circularMask?: boolean;
  onCancel: () => void;
  onConfirm: (cropped: File) => void | Promise<void>;
};

const STAGE_MAX = 420;

export default function ImageCropModal({
  open,
  file,
  aspectRatio,
  title = "Crop",
  circularMask = false,
  onCancel,
  onConfirm,
}: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const ar = aspectRatio > 0 ? aspectRatio : 1;
  const frame =
    ar >= 1
      ? { width: STAGE_MAX, height: Math.round(STAGE_MAX / ar) }
      : { width: Math.round(STAGE_MAX * ar), height: STAGE_MAX };

  useEffect(() => {
    if (!open || !file) {
      setPreviewUrl(null);
      setNatural({ w: 0, h: 0 });
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setSaving(false);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setNatural({ w: 0, h: 0 });
    return () => URL.revokeObjectURL(url);
  }, [open, file]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !saving) onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onCancel, saving]);

  const baseScale = (() => {
    if (!natural.w || !natural.h) return 1;
    return Math.max(frame.width / natural.w, frame.height / natural.h);
  })();
  const scale = baseScale * zoom;
  const displayW = natural.w * scale;
  const displayH = natural.h * scale;

  function clampPan(x: number, y: number) {
    const maxX = Math.max(0, (displayW - frame.width) / 2);
    const maxY = Math.max(0, (displayH - frame.height) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y)),
    };
  }

  const panClamped = clampPan(pan.x, pan.y);
  const canPan =
    displayW > frame.width + 0.5 || displayH > frame.height + 0.5;

  async function handleSave() {
    if (!file || saving) return;
    setSaving(true);
    try {
      const cropped = await bakeCroppedImageFile(file, ar, {
        mode: "fill",
        zoom,
        pan: panClamped,
        frameWidth: frame.width,
        frameHeight: frame.height,
      });
      await onConfirm(cropped);
    } catch {
      setSaving(false);
    }
  }

  if (!open || !file || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Dismiss"
        className="absolute inset-0 bg-black/55"
        disabled={saving}
        onClick={() => {
          if (!saving) onCancel();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-[121] w-full max-w-[min(100%,460px)] overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="relative flex h-11 items-center justify-center border-b border-stone-200/80">
          <button
            type="button"
            aria-label="Cancel"
            disabled={saving}
            onClick={onCancel}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-800 disabled:opacity-40"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={18} strokeWidth={1.8} />
          </button>
          <h2 className="text-sm font-semibold text-stone-900">{title}</h2>
          <button
            type="button"
            disabled={saving || !natural.w}
            onClick={() => void handleSave()}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#0095f6] hover:text-[#1877f2] disabled:cursor-not-allowed disabled:text-sky-300"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </header>

        <div className="flex flex-col items-center bg-[#efefef] px-4 py-5">
          <div
            className="relative overflow-hidden bg-black"
            style={{
              width: frame.width,
              height: frame.height,
              borderRadius: circularMask ? 9999 : 12,
              cursor: canPan ? (dragging ? "grabbing" : "grab") : "default",
              touchAction: "none",
            }}
            onPointerDown={(e) => {
              if (e.button !== 0 || !canPan) return;
              e.currentTarget.setPointerCapture(e.pointerId);
              dragRef.current = {
                pointerId: e.pointerId,
                startX: e.clientX,
                startY: e.clientY,
                originX: panClamped.x,
                originY: panClamped.y,
              };
              setDragging(true);
            }}
            onPointerMove={(e) => {
              const drag = dragRef.current;
              if (!drag || drag.pointerId !== e.pointerId) return;
              setPan(
                clampPan(
                  drag.originX + (e.clientX - drag.startX),
                  drag.originY + (e.clientY - drag.startY)
                )
              );
            }}
            onPointerUp={(e) => {
              if (dragRef.current?.pointerId === e.pointerId) {
                dragRef.current = null;
                setDragging(false);
              }
            }}
            onPointerCancel={() => {
              dragRef.current = null;
              setDragging(false);
            }}
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt=""
                draggable={false}
                className="absolute max-w-none select-none"
                style={{
                  width: displayW || "100%",
                  height: displayH || "100%",
                  left:
                    (frame.width - (displayW || frame.width)) / 2 +
                    panClamped.x,
                  top:
                    (frame.height - (displayH || frame.height)) / 2 +
                    panClamped.y,
                }}
                onLoad={(e) => {
                  const el = e.currentTarget;
                  if (el.naturalWidth && el.naturalHeight) {
                    setNatural({ w: el.naturalWidth, h: el.naturalHeight });
                  }
                }}
              />
            ) : null}
          </div>

          <div className="mt-4 flex w-full max-w-[420px] items-center gap-3 px-1">
            <HugeiconsIcon
              icon={ZoomInAreaIcon}
              size={16}
              strokeWidth={1.75}
              className="shrink-0 text-stone-500"
            />
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              aria-label="Zoom"
              onChange={(e) => {
                const next = Number(e.target.value);
                setZoom(next);
                setPan((p) => clampPan(p.x, p.y));
              }}
              className="h-1 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-stone-300 accent-stone-800 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-stone-800"
            />
          </div>
          <p className="mt-2 text-center text-xs text-stone-500">
            Drag to reposition · pinch or zoom to frame
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
