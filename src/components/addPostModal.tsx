"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Button,
  Label,
  Select,
  ListBox,
  useOverlayState,
} from "@heroui/react";
import Dropzone from "@components/dropbox";
import { useUser } from "@clerk/nextjs";
import { dispatchArchiveFeedRefresh } from "@/lib/feedRefresh";
import {
  pickUploadThingPublicUrl,
  uploadFilesToUploadThing,
} from "@/lib/uploadthingReact";
import {
  POST_ASPECT_OPTIONS,
  POST_ASPECT_SQUARE,
  clampPostAspectRatio,
  type PostAspectOptionId,
} from "@/lib/postAspectRatio";
import {
  bakeCroppedImageFile,
  type CropMode,
} from "@/lib/cropImageFile";
import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowUp01Icon,
  AspectRatioIcon,
  Cancel01Icon,
  Copy01Icon,
  FitToScreenIcon,
  Location01Icon,
  MaximizeScreenIcon,
  SmileIcon,
  UserAdd01Icon,
  ZoomInAreaIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

type Step = "select" | "crop" | "share";

type PhotoCrop = {
  zoom: number;
  mode: CropMode;
  pan: { x: number; y: number };
  natural: { w: number; h: number };
  frameWidth: number;
  frameHeight: number;
};

const CAPTION_MAX = 2200;

function defaultPhotoCrop(): PhotoCrop {
  return {
    zoom: 1,
    mode: "fill",
    pan: { x: 0, y: 0 },
    natural: { w: 0, h: 0 },
    frameWidth: 0,
    frameHeight: 0,
  };
}

function aspectIdForPixels(width: number, height: number): PostAspectOptionId {
  const ratio = clampPostAspectRatio(width, height);
  return (
    POST_ASPECT_OPTIONS.find((o) => Math.abs(o.ratio - ratio) < 0.001)?.id ??
    "square"
  );
}

function ShareRow({
  label,
  icon,
  onClick,
  children,
}: {
  label: string;
  icon: typeof Location01Icon;
  onClick?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-stone-50"
    >
      <span className="text-sm text-stone-900">{label}</span>
      {children ?? (
        <HugeiconsIcon
          icon={icon}
          size={18}
          strokeWidth={1.75}
          className="shrink-0 text-stone-400"
        />
      )}
    </button>
  );
}

function ShareDisclosure({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-stone-50"
      >
        <span className="text-sm text-stone-900">{title}</span>
        <HugeiconsIcon
          icon={open ? ArrowUp01Icon : ArrowDown01Icon}
          size={16}
          strokeWidth={2}
          className="shrink-0 text-stone-400"
        />
      </button>
      {open ? <div className="px-4 pb-4">{children}</div> : null}
    </div>
  );
}

function ShareToggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-stone-900">{label}</p>
        {hint ? (
          <p className="mt-1 text-xs leading-relaxed text-stone-400">{hint}</p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-10 shrink-0 rounded-full transition-colors ${
          checked ? "bg-stone-900" : "bg-stone-300"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

/** Outline icon matching each crop frame (Instagram-style). */
function AspectFrameIcon({
  id,
  active,
}: {
  id: PostAspectOptionId;
  active: boolean;
}) {
  const opacity = active ? "opacity-100" : "opacity-50";
  if (id === "story") {
    return (
      <span className={`flex h-6 w-6 items-center justify-center ${opacity}`} aria-hidden>
        <span className="block h-5 w-2.5 rounded-[2px] border-2 border-current" />
      </span>
    );
  }
  if (id === "square") {
    return (
      <span className={`flex h-6 w-6 items-center justify-center ${opacity}`} aria-hidden>
        <span className="block h-4 w-4 rounded-[2px] border-2 border-current" />
      </span>
    );
  }
  if (id === "portrait") {
    return (
      <span className={`flex h-6 w-6 items-center justify-center ${opacity}`} aria-hidden>
        <span className="block h-[18px] w-3.5 rounded-[2px] border-2 border-current" />
      </span>
    );
  }
  if (id === "fiveFour") {
    return (
      <span className={`flex h-6 w-6 items-center justify-center ${opacity}`} aria-hidden>
        <span className="block h-3.5 w-[18px] rounded-[2px] border-2 border-current" />
      </span>
    );
  }
  return (
    <span className={`flex h-6 w-6 items-center justify-center ${opacity}`} aria-hidden>
      <span className="block h-2.5 w-5 rounded-[2px] border-2 border-current" />
    </span>
  );
}

function getReadableErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    const msg = err.message?.trim();
    if (msg) return msg;
    const cause = (err as { cause?: unknown }).cause;
    if (cause instanceof Error && cause.message?.trim()) return cause.message.trim();
    if (typeof cause === "string" && cause.trim()) return cause.trim();
  }
  if (typeof err === "string" && err.trim()) return err.trim();
  return "Upload failed. Please try again in a moment.";
}

const STEP_TITLE: Record<Step, string> = {
  select: "Create new post",
  crop: "Crop",
  share: "Share",
};

export default function AddPostModal({
  imageUrl,
  username,
  fullName,
  triggerStyle = "button",
  fullWidth = false,
  children,
}: {
  imageUrl?: string;
  username?: string;
  fullName?: string;
  triggerStyle?: "button" | "input";
  fullWidth?: boolean;
  children?: React.ReactElement;
} = {}) {
  const state = useOverlayState({ defaultOpen: false });
  const { user } = useUser();

  const resolvedImageUrl = imageUrl ?? "https://i.pravatar.cc/150?u=placeholder";
  const resolvedUsername = username?.replace(/^@+/, "") || "username";
  const resolvedFullName = fullName ?? "Your Name";

  const [step, setStep] = useState<Step>("select");
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [rejected, setRejected] = useState([]);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [collaborators, setCollaborators] = useState("");
  const [altText, setAltText] = useState("");
  const [hideLikeCount, setHideLikeCount] = useState(false);
  const [commentsDisabled, setCommentsDisabled] = useState(false);
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [collaboratorsOpen, setCollaboratorsOpen] = useState(false);
  const [visibility, setVisibility] = useState<"public" | "friends" | "private">(
    "public"
  );
  const [aspectId, setAspectId] = useState<PostAspectOptionId>("square");
  const [previewIndex, setPreviewIndex] = useState(0);
  const [aspectMenuOpen, setAspectMenuOpen] = useState(false);
  const [thumbsOpen, setThumbsOpen] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [photoCrops, setPhotoCrops] = useState<PhotoCrop[]>([]);
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const addPhotosInputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef<string[]>([]);
  const didAutoAspectRef = useRef(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const aspectOption =
    POST_ASPECT_OPTIONS.find((o) => o.id === aspectId) ?? POST_ASPECT_OPTIONS[1];
  const aspectRatio = aspectOption?.ratio ?? POST_ASPECT_SQUARE;

  const SHARE_SIDEBAR_W = 340;
  const CREATE_HEADER_H = 44;
  const [cropFrame, setCropFrame] = useState({ width: 560, height: 560 });
  const [shareFrame, setShareFrame] = useState({ width: 420, height: 420 });

  useEffect(() => {
    const update = () => {
      const pad = 64;
      const maxDialogH = Math.min(
        Math.floor(window.innerHeight * 0.9),
        window.innerHeight - pad
      );
      const maxDialogW = Math.min(
        Math.floor(window.innerWidth * 0.92),
        window.innerWidth - pad
      );
      const maxMediaH = Math.max(240, maxDialogH - CREATE_HEADER_H);

      // Crop canvas must be a true square (IG 1:1 stage).
      const cropSize = Math.min(680, maxDialogW, maxMediaH);
      setCropFrame({ width: cropSize, height: cropSize });

      // Share keeps the same square media pane + fixed sidebar.
      const shareSize = Math.min(
        680,
        Math.max(280, maxDialogW - SHARE_SIDEBAR_W),
        maxMediaH
      );
      setShareFrame({ width: shareSize, height: shareSize });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const aspectBox =
    aspectRatio >= 1
      ? {
          width: cropFrame.width,
          height: cropFrame.width / aspectRatio,
        }
      : {
          width: cropFrame.height * aspectRatio,
          height: cropFrame.height,
        };

  const activeCrop = photoCrops[previewIndex] ?? defaultPhotoCrop();
  const cropZoom = activeCrop.zoom;
  const cropMode = activeCrop.mode;
  const cropPan = activeCrop.pan;
  const imgNatural = activeCrop.natural;

  function patchActiveCrop(patch: Partial<PhotoCrop>) {
    setPhotoCrops((prev) => {
      const next = prev.length
        ? [...prev]
        : files.map(() => defaultPhotoCrop());
      while (next.length < files.length) next.push(defaultPhotoCrop());
      const i = Math.min(previewIndex, Math.max(0, next.length - 1));
      next[i] = {
        ...defaultPhotoCrop(),
        ...next[i],
        ...patch,
        frameWidth: aspectBox.width,
        frameHeight: aspectBox.height,
      };
      return next;
    });
  }

  const letterboxH = Math.max(0, (cropFrame.height - aspectBox.height) / 2);
  const pillarboxW = Math.max(0, (cropFrame.width - aspectBox.width) / 2);

  const activePreview =
    previewUrls[Math.min(previewIndex, Math.max(previewUrls.length - 1, 0))] ??
    null;

  const cropBaseScale = (() => {
    if (!imgNatural.w || !imgNatural.h || !aspectBox.width || !aspectBox.height) {
      return 1;
    }
    const sx = aspectBox.width / imgNatural.w;
    const sy = aspectBox.height / imgNatural.h;
    return cropMode === "fill" ? Math.max(sx, sy) : Math.min(sx, sy);
  })();
  const cropScale = cropBaseScale * cropZoom;
  const cropDisplayW = imgNatural.w * cropScale;
  const cropDisplayH = imgNatural.h * cropScale;

  function clampCropPan(x: number, y: number) {
    const maxX = Math.max(0, (cropDisplayW - aspectBox.width) / 2);
    const maxY = Math.max(0, (cropDisplayH - aspectBox.height) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y)),
    };
  }

  const canPanCrop =
    cropDisplayW > aspectBox.width + 0.5 ||
    cropDisplayH > aspectBox.height + 0.5;

  function cropLayoutForStage(stage: { width: number; height: number }) {
    const box =
      aspectRatio >= 1
        ? { width: stage.width, height: stage.width / aspectRatio }
        : { width: stage.height * aspectRatio, height: stage.height };
    const lb = Math.max(0, (stage.height - box.height) / 2);
    const pb = Math.max(0, (stage.width - box.width) / 2);
    let base = 1;
    if (imgNatural.w && imgNatural.h && box.width && box.height) {
      const sx = box.width / imgNatural.w;
      const sy = box.height / imgNatural.h;
      base = cropMode === "fill" ? Math.max(sx, sy) : Math.min(sx, sy);
    }
    const scale = base * cropZoom;
    const displayW = imgNatural.w * scale;
    const displayH = imgNatural.h * scale;
    const maxX = Math.max(0, (displayW - box.width) / 2);
    const maxY = Math.max(0, (displayH - box.height) / 2);
    const panScale =
      aspectBox.width > 0 ? box.width / aspectBox.width : 1;
    const stagePan = {
      x: Math.min(maxX, Math.max(-maxX, cropPan.x * panScale)),
      y: Math.min(maxY, Math.max(-maxY, cropPan.y * panScale)),
    };
    return {
      box,
      lb,
      pb,
      displayW,
      displayH,
      pan: stagePan,
      canPan:
        displayW > box.width + 0.5 || displayH > box.height + 0.5,
    };
  }

  /** Gray bars outside the active crop frame (IG-style). */
  function AspectMask({
    stage,
  }: {
    stage: { width: number; height: number };
  }) {
    const { lb, pb } = cropLayoutForStage(stage);
    if (lb <= 0.5 && pb <= 0.5) return null;
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[5]">
        {lb > 0.5 ? (
          <>
            <div
              className="absolute inset-x-0 top-0 bg-[#efefef]"
              style={{ height: lb }}
            />
            <div
              className="absolute inset-x-0 bottom-0 bg-[#efefef]"
              style={{ height: lb }}
            />
          </>
        ) : null}
        {pb > 0.5 ? (
          <>
            <div
              className="absolute inset-y-0 left-0 bg-[#efefef]"
              style={{ width: pb }}
            />
            <div
              className="absolute inset-y-0 right-0 bg-[#efefef]"
              style={{ width: pb }}
            />
          </>
        ) : null}
      </div>
    );
  }

  function CropImage({
    interactive,
    stage,
  }: {
    interactive: boolean;
    stage: { width: number; height: number };
  }) {
    if (!activePreview) {
      return (
        <div className="flex h-full items-center justify-center bg-stone-200 text-sm text-stone-400">
          No photo
        </div>
      );
    }

    const layout = cropLayoutForStage(stage);
    const { box, lb, pb, displayW, displayH, pan } = layout;

    return (
      <div
        className="absolute overflow-hidden bg-black"
        style={{
          left: pb,
          top: lb,
          width: box.width,
          height: box.height,
          cursor: interactive && layout.canPan
            ? isDraggingCrop
              ? "grabbing"
              : "grab"
            : "default",
          touchAction: interactive ? "none" : undefined,
        }}
        onPointerDown={
          interactive
            ? (e) => {
                if (e.button !== 0) return;
                e.currentTarget.setPointerCapture(e.pointerId);
                dragRef.current = {
                  pointerId: e.pointerId,
                  startX: e.clientX,
                  startY: e.clientY,
                  originX: cropPan.x,
                  originY: cropPan.y,
                };
                setIsDraggingCrop(true);
              }
            : undefined
        }
        onPointerMove={
          interactive
            ? (e) => {
                const drag = dragRef.current;
                if (!drag || drag.pointerId !== e.pointerId) return;
                const panScale =
                  box.width > 0 && aspectBox.width > 0
                    ? aspectBox.width / box.width
                    : 1;
                patchActiveCrop({
                  pan: clampCropPan(
                    drag.originX + (e.clientX - drag.startX) * panScale,
                    drag.originY + (e.clientY - drag.startY) * panScale
                  ),
                });
              }
            : undefined
        }
        onPointerUp={
          interactive
            ? (e) => {
                if (dragRef.current?.pointerId === e.pointerId) {
                  dragRef.current = null;
                  setIsDraggingCrop(false);
                }
              }
            : undefined
        }
        onPointerCancel={
          interactive
            ? () => {
                dragRef.current = null;
                setIsDraggingCrop(false);
              }
            : undefined
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activePreview}
          alt=""
          draggable={false}
          className="absolute max-w-none select-none"
          style={{
            width: displayW || "100%",
            height: displayH || "100%",
            left: (box.width - (displayW || box.width)) / 2 + pan.x,
            top: (box.height - (displayH || box.height)) / 2 + pan.y,
          }}
          onLoad={(e) => {
            const el = e.currentTarget;
            const w = el.naturalWidth;
            const h = el.naturalHeight;
            if (!w || !h) return;
            patchActiveCrop({ natural: { w, h } });
            if (!didAutoAspectRef.current) {
              didAutoAspectRef.current = true;
              setAspectId(aspectIdForPixels(w, h));
            }
          }}
        />
      </div>
    );
  }

  function revokeAllPreviews() {
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrlsRef.current = [];
    setPreviewUrls([]);
  }

  function appendFiles(incoming: File[]) {
    if (!incoming.length) return;
    const urls = incoming.map((file) => URL.createObjectURL(file));
    previewUrlsRef.current = [...previewUrlsRef.current, ...urls];
    setPreviewUrls([...previewUrlsRef.current]);
    setFiles((prev) => [...prev, ...incoming]);
  }

  /** Dropzone-compatible setter that syncs previewUrls for the create flow. */
  function setFilesFromDropzone(
    updater: File[] | ((prev: File[]) => File[])
  ) {
    setFiles((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (next.length > prev.length) {
        const added = next.slice(prev.length) as (File & { preview?: string })[];
        const urls = added.map(
          (file) => file.preview ?? URL.createObjectURL(file)
        );
        previewUrlsRef.current = [...previewUrlsRef.current, ...urls];
        setPreviewUrls([...previewUrlsRef.current]);
      }
      return next;
    });
  }

  useEffect(() => {
    if (!state.isOpen) {
      revokeAllPreviews();
      setFiles([]);
      setStep("select");
      setDescription("");
      setLocation("");
      setCollaborators("");
      setAltText("");
      setHideLikeCount(false);
      setCommentsDisabled(false);
      setAccessibilityOpen(false);
      setAdvancedOpen(false);
      setLocationOpen(false);
      setCollaboratorsOpen(false);
      setVisibility("public");
      setAspectId("square");
      setPreviewIndex(0);
      setAspectMenuOpen(false);
      setThumbsOpen(false);
      setZoomOpen(false);
      setPhotoCrops([]);
      setIsDraggingCrop(false);
      didAutoAspectRef.current = false;
      dragRef.current = null;
      setRejected([]);
      setLoading(false);
    }
  }, [state.isOpen]);

  useEffect(() => {
    setPhotoCrops((prev) => {
      if (prev.length === files.length) return prev;
      if (files.length > prev.length) {
        return [
          ...prev,
          ...Array.from({ length: files.length - prev.length }, () =>
            defaultPhotoCrop()
          ),
        ];
      }
      return prev.slice(0, files.length);
    });
  }, [files.length]);

  useEffect(() => {
    if (previewIndex >= files.length) {
      setPreviewIndex(Math.max(0, files.length - 1));
    }
  }, [files.length, previewIndex]);

  useEffect(() => {
    if (step === "select" && files.length > 0) {
      setStep("crop");
    }
  }, [files.length, step]);

  function goBack() {
    if (step === "crop") {
      revokeAllPreviews();
      setFiles([]);
      setPreviewIndex(0);
      setAspectMenuOpen(false);
      setThumbsOpen(false);
      setZoomOpen(false);
      setPhotoCrops([]);
      setStep("select");
    } else if (step === "share") {
      setStep("crop");
    }
  }

  function goNext() {
    if (step === "crop") setStep("share");
  }

  function removeCropPhoto(index: number) {
    const url = previewUrlsRef.current[index];
    if (url) URL.revokeObjectURL(url);
    previewUrlsRef.current = previewUrlsRef.current.filter((_, i) => i !== index);
    setPreviewUrls([...previewUrlsRef.current]);
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    if (next.length === 0) {
      setThumbsOpen(false);
      setAspectMenuOpen(false);
      setStep("select");
    }
  }

  function handleAddCropPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files;
    if (!list?.length) return;
    appendFiles(Array.from(list));
    e.target.value = "";
  }

  const handlePost = async () => {
    if (!user?.id) {
      alert("Sign in to post.");
      return;
    }
    if (files.length === 0) {
      alert("Add at least one photo to post.");
      return;
    }
    setLoading(true);
    try {
      const croppedFiles = await Promise.all(
        files.map((file, i) => {
          const crop = photoCrops[i] ?? defaultPhotoCrop();
          const frameWidth =
            crop.frameWidth > 0 ? crop.frameWidth : aspectBox.width;
          const frameHeight =
            crop.frameHeight > 0 ? crop.frameHeight : aspectBox.height;
          return bakeCroppedImageFile(file, aspectRatio, {
            mode: crop.mode,
            zoom: crop.zoom,
            pan: crop.pan,
            frameWidth,
            frameHeight,
          });
        })
      );

      const uploaded = await uploadFilesToUploadThing("postMedia", {
        files: croppedFiles,
      });
      const mediaUrls = uploaded
        .map((item) => pickUploadThingPublicUrl(item))
        .filter(Boolean);
      if (!mediaUrls.length) {
        throw new Error("Upload did not return any image URLs. Try again.");
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          authorClerkId: user.id,
          fullName: resolvedFullName,
          username: resolvedUsername,
          avatarUrl: resolvedImageUrl,
          body: description.slice(0, CAPTION_MAX),
          media: mediaUrls,
          location: location.trim() || undefined,
          altText: altText.trim() || undefined,
          hideLikeCount,
          commentsDisabled,
          tags: collaborators
            .split(/[\s,]+/)
            .map((t) => t.replace(/^@+/, "").trim())
            .filter(Boolean),
          visibility,
          aspectRatio,
        }),
      });

      if (!res.ok) throw new Error(`Failed to create post: ${res.status}`);

      state.close();
      dispatchArchiveFeedRefresh();
    } catch (err: unknown) {
      console.error(err);
      const message = getReadableErrorMessage(err);
      alert(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger =
    triggerStyle === "input" ? (
      <Button
        variant="tertiary"
        size="sm"
        fullWidth={fullWidth}
        className="justify-start font-normal text-stone-400"
        onPress={() => state.open()}
      >
        Share a milestone...
      </Button>
    ) : (
      <Button
        variant="primary"
        size="sm"
        fullWidth={fullWidth}
        className="gap-2"
        onPress={() => state.open()}
      >
        <HugeiconsIcon icon={Add01Icon} size={16} />
        Post
      </Button>
    );

  const trigger = children ? (
    React.isValidElement(children) ? (
      React.cloneElement(
        children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>,
        {
          onClick: (e: React.MouseEvent) => {
            (
              children as React.ReactElement<{
                onClick?: (e: React.MouseEvent) => void;
              }>
            ).props.onClick?.(e);
            state.open();
          },
        }
      )
    ) : (
      children
    )
  ) : (
    defaultTrigger
  );

  return (
    <>
      {trigger}

      <Modal state={state}>
        <Modal.Backdrop className="!z-[70] bg-black/65">
          <Modal.Container
            placement="center"
            className="relative flex w-full max-w-full items-center justify-center p-4 sm:p-6"
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => state.close()}
              className="absolute right-4 top-4 z-[90] rounded-full p-2 text-white transition-colors hover:bg-white/10 sm:right-6 sm:top-6"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>

            <Modal.Dialog
              className="flex min-w-0 flex-col overflow-hidden rounded-xl bg-white !p-0 shadow-2xl transition-[width] duration-200 !h-auto !max-h-none !min-h-0 !max-w-none"
              style={
                step === "share"
                  ? {
                      width: shareFrame.width + SHARE_SIDEBAR_W,
                      minWidth: shareFrame.width + SHARE_SIDEBAR_W,
                      padding: 0,
                    }
                  : {
                      // select + crop share the same square stage size
                      width: cropFrame.width,
                      minWidth: cropFrame.width,
                      padding: 0,
                    }
              }
            >
              {({ close }) => (
                <>
                  <header
                    className="relative flex shrink-0 items-center justify-center px-4"
                    style={{ height: CREATE_HEADER_H }}
                  >
                    {step !== "select" ? (
                      <button
                        type="button"
                        onClick={goBack}
                        disabled={loading}
                        className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-stone-800 transition-colors hover:bg-stone-100 disabled:opacity-40"
                        aria-label="Back"
                      >
                        <HugeiconsIcon icon={ArrowLeft01Icon} size={20} strokeWidth={2} />
                      </button>
                    ) : null}

                    <Modal.Heading className="text-sm font-semibold text-stone-900">
                      {STEP_TITLE[step]}
                    </Modal.Heading>

                    {step === "crop" ? (
                      <button
                        type="button"
                        onClick={goNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#0095f6] transition-colors hover:text-[#1877f2]"
                      >
                        Next
                      </button>
                    ) : null}

                    {step === "share" ? (
                      <button
                        type="button"
                        onClick={() => void handlePost()}
                        disabled={loading || files.length === 0}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#0095f6] transition-colors hover:text-[#1877f2] disabled:cursor-not-allowed disabled:text-sky-300"
                      >
                        {loading ? "Sharing…" : "Share"}
                      </button>
                    ) : null}
                  </header>

                  <div
                    className={
                      step === "select" || step === "crop" || step === "share"
                        ? "overflow-hidden"
                        : "flex min-h-0 flex-1 flex-col overflow-y-auto"
                    }
                  >
                    {step === "select" ? (
                      <div
                        className="flex w-full flex-col"
                        style={{ height: cropFrame.width }}
                      >
                        <Dropzone
                          className="min-h-0 flex-1"
                          files={files}
                          setFiles={setFilesFromDropzone}
                          rejected={rejected}
                          setRejected={setRejected}
                          variant="create"
                        />
                      </div>
                    ) : null}

                    {step === "crop" ? (
                      <div
                        className="relative aspect-square w-full shrink-0 overflow-hidden bg-[#efefef]"
                        style={{ width: cropFrame.width }}
                      >
                        <CropImage interactive stage={cropFrame} />

                        {/* IG-style mask: gray bars outside the selected aspect */}
                        <AspectMask stage={cropFrame} />

                          {aspectMenuOpen ? (
                            <div className="absolute bottom-16 left-3 z-20 min-w-[148px] overflow-hidden rounded-xl bg-black/70 py-1 text-white backdrop-blur-sm">
                              {POST_ASPECT_OPTIONS.map((opt) => {
                                const selected = aspectId === opt.id;
                                return (
                                  <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => {
                                      setAspectId(opt.id);
                                      patchActiveCrop({ pan: { x: 0, y: 0 } });
                                      setAspectMenuOpen(false);
                                    }}
                                    className={`flex w-full items-center justify-between gap-6 px-4 py-3 text-left text-sm transition-colors hover:bg-white/10 ${
                                      selected ? "text-white" : "text-white/55"
                                    }`}
                                  >
                                    <span className="font-medium">
                                      {opt.shortLabel}
                                    </span>
                                    <AspectFrameIcon
                                      id={opt.id}
                                      active={selected}
                                    />
                                  </button>
                                );
                              })}
                            </div>
                          ) : null}

                          {thumbsOpen ? (
                            <div className="absolute bottom-16 right-3 z-20 flex max-w-[min(100%,320px)] items-center gap-3 overflow-x-auto rounded-2xl bg-[#1a1a1a]/90 px-3.5 py-3 backdrop-blur-sm">
                              {previewUrls.map((url, i) => (
                                <div
                                  key={`${url}-${i}`}
                                  className="relative shrink-0 pt-1 pr-1"
                                >
                                  <button
                                    type="button"
                                    onClick={() => setPreviewIndex(i)}
                                    className={`relative block h-[72px] w-[72px] overflow-hidden rounded-lg ring-1 ring-white/40 ${
                                      i === previewIndex
                                        ? "opacity-100"
                                        : "opacity-70 hover:opacity-100"
                                    }`}
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={url}
                                      alt=""
                                      className="h-full w-full object-cover"
                                    />
                                  </button>
                                  <button
                                    type="button"
                                    aria-label="Remove photo"
                                    onClick={() => removeCropPhoto(i)}
                                    className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#cfcfcf] text-stone-900 shadow-sm hover:bg-white"
                                  >
                                    <HugeiconsIcon
                                      icon={Cancel01Icon}
                                      size={11}
                                      strokeWidth={2.5}
                                    />
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                aria-label="Add photos"
                                onClick={() => addPhotosInputRef.current?.click()}
                                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/55 text-white transition-colors hover:border-white hover:bg-white/10"
                              >
                                <HugeiconsIcon
                                  icon={Add01Icon}
                                  size={26}
                                  strokeWidth={1.5}
                                />
                              </button>
                            </div>
                          ) : null}

                          <input
                            ref={addPhotosInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleAddCropPhotos}
                          />

                          <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between p-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                aria-label="Aspect ratio"
                                aria-expanded={aspectMenuOpen}
                                onClick={() => {
                                  setAspectMenuOpen((v) => !v);
                                  setThumbsOpen(false);
                                  setZoomOpen(false);
                                }}
                                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                                  aspectMenuOpen
                                    ? "bg-white text-stone-900"
                                    : "bg-black/60 text-white hover:bg-black/75"
                                }`}
                              >
                                <HugeiconsIcon
                                  icon={AspectRatioIcon}
                                  size={18}
                                  strokeWidth={1.75}
                                />
                              </button>

                              {zoomOpen ? (
                                <div className="flex h-8 items-center gap-2 rounded-full bg-black/60 px-3 text-white backdrop-blur-sm">
                                  <button
                                    type="button"
                                    aria-label="Close zoom"
                                    onClick={() => setZoomOpen(false)}
                                    className="flex items-center justify-center"
                                  >
                                    <HugeiconsIcon
                                      icon={ZoomInAreaIcon}
                                      size={16}
                                      strokeWidth={1.75}
                                    />
                                  </button>
                                  <input
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={0.01}
                                    value={cropZoom}
                                    aria-label="Zoom"
                                    onChange={(e) =>
                                      patchActiveCrop({
                                        zoom: Number(e.target.value),
                                      })
                                    }
                                    className="h-1 w-28 cursor-pointer appearance-none rounded-full bg-white/35 accent-white [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                                  />
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  aria-label="Zoom"
                                  aria-expanded={zoomOpen}
                                  onClick={() => {
                                    setZoomOpen(true);
                                    setAspectMenuOpen(false);
                                    setThumbsOpen(false);
                                  }}
                                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/75"
                                >
                                  <HugeiconsIcon
                                    icon={ZoomInAreaIcon}
                                    size={18}
                                    strokeWidth={1.75}
                                  />
                                </button>
                              )}

                              <button
                                type="button"
                                aria-label={
                                  cropMode === "fill"
                                    ? "Fit image in frame"
                                    : "Fill frame with image"
                                }
                                title={cropMode === "fill" ? "Fit" : "Fill"}
                                onClick={() => {
                                  patchActiveCrop({
                                    mode: cropMode === "fill" ? "fit" : "fill",
                                    pan: { x: 0, y: 0 },
                                  });
                                  setAspectMenuOpen(false);
                                  setThumbsOpen(false);
                                  setZoomOpen(false);
                                }}
                                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                                  cropMode === "fit"
                                    ? "bg-white text-stone-900"
                                    : "bg-black/60 text-white hover:bg-black/75"
                                }`}
                              >
                                <HugeiconsIcon
                                  icon={
                                    cropMode === "fill"
                                      ? FitToScreenIcon
                                      : MaximizeScreenIcon
                                  }
                                  size={18}
                                  strokeWidth={1.75}
                                />
                              </button>
                            </div>

                            <button
                              type="button"
                              aria-label="Select photos"
                              aria-expanded={thumbsOpen}
                              onClick={() => {
                                setThumbsOpen((v) => !v);
                                setAspectMenuOpen(false);
                                setZoomOpen(false);
                              }}
                              className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                                thumbsOpen
                                  ? "bg-white text-stone-900"
                                  : "bg-black/60 text-white hover:bg-black/75"
                              }`}
                            >
                              <HugeiconsIcon
                                icon={Copy01Icon}
                                size={18}
                                strokeWidth={1.75}
                              />
                            </button>
                          </div>
                      </div>
                    ) : null}

                    {step === "share" ? (
                      <div className="flex flex-row overflow-hidden">
                        <div
                          className="relative aspect-square shrink-0 overflow-hidden bg-[#efefef]"
                          style={{ width: shareFrame.width }}
                        >
                          <CropImage interactive={false} stage={shareFrame} />
                          <AspectMask stage={shareFrame} />
                        </div>

                        <div
                          className="flex min-h-0 min-w-0 flex-col overflow-y-auto"
                          style={{
                            width: SHARE_SIDEBAR_W,
                            height: shareFrame.width,
                          }}
                        >
                          <div className="flex items-center gap-3 px-4 pt-4 pb-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={resolvedImageUrl}
                              alt={resolvedFullName}
                              className="h-7 w-7 shrink-0 rounded-full object-cover"
                            />
                            <span className="truncate text-sm font-semibold text-stone-900">
                              {resolvedUsername}
                            </span>
                          </div>

                          <div className="flex min-h-[120px] flex-1 flex-col px-4 pb-2">
                            <textarea
                              placeholder="Write a caption…"
                              value={description}
                              onChange={(e) =>
                                setDescription(
                                  e.target.value.slice(0, CAPTION_MAX)
                                )
                              }
                              rows={5}
                              className="min-h-[100px] w-full flex-1 resize-none border-0 bg-transparent text-sm text-stone-800 outline-none placeholder:text-stone-400"
                            />
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-stone-300" aria-hidden>
                                <HugeiconsIcon
                                  icon={SmileIcon}
                                  size={18}
                                  strokeWidth={1.5}
                                />
                              </span>
                              <span className="text-xs text-stone-400">
                                {description.length}/{CAPTION_MAX.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="mt-auto divide-y divide-stone-100 border-t border-stone-100">
                            <div>
                              <ShareRow
                                label={
                                  location.trim()
                                    ? location.trim()
                                    : "Add location"
                                }
                                icon={Location01Icon}
                                onClick={() => setLocationOpen((v) => !v)}
                              />
                              {locationOpen ? (
                                <div className="px-4 pb-3">
                                  <input
                                    type="text"
                                    value={location}
                                    onChange={(e) =>
                                      setLocation(e.target.value)
                                    }
                                    placeholder="City, venue, or place"
                                    autoFocus
                                    className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-800 outline-none placeholder:text-stone-400 focus:border-stone-400"
                                  />
                                </div>
                              ) : null}
                            </div>

                            <div>
                              <ShareRow
                                label={
                                  collaborators.trim()
                                    ? collaborators.trim()
                                    : "Add collaborators"
                                }
                                icon={UserAdd01Icon}
                                onClick={() =>
                                  setCollaboratorsOpen((v) => !v)
                                }
                              />
                              {collaboratorsOpen ? (
                                <div className="px-4 pb-3">
                                  <input
                                    type="text"
                                    value={collaborators}
                                    onChange={(e) =>
                                      setCollaborators(e.target.value)
                                    }
                                    placeholder="Usernames, separated by spaces"
                                    autoFocus
                                    className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-800 outline-none placeholder:text-stone-400 focus:border-stone-400"
                                  />
                                </div>
                              ) : null}
                            </div>

                            <ShareDisclosure
                              title="Accessibility"
                              open={accessibilityOpen}
                              onToggle={() =>
                                setAccessibilityOpen((v) => !v)
                              }
                            >
                              <Label className="text-xs font-medium text-stone-500">
                                Alt text
                              </Label>
                              <textarea
                                value={altText}
                                onChange={(e) => setAltText(e.target.value)}
                                placeholder="Write alt text…"
                                rows={3}
                                className="mt-2 w-full resize-none rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-800 outline-none placeholder:text-stone-400 focus:border-stone-400"
                              />
                            </ShareDisclosure>

                            <ShareDisclosure
                              title="Advanced settings"
                              open={advancedOpen}
                              onToggle={() => setAdvancedOpen((v) => !v)}
                            >
                              <ShareToggle
                                label="Hide like and view counts on this post"
                                hint="Only you will see the total number of likes and views on this post. You can change this later by editing the post."
                                checked={hideLikeCount}
                                onChange={setHideLikeCount}
                              />
                              <ShareToggle
                                label="Turn off commenting"
                                hint="You can change this later by editing your post."
                                checked={commentsDisabled}
                                onChange={setCommentsDisabled}
                              />
                              <div className="pt-2">
                                <Label className="text-xs font-medium text-stone-500">
                                  Who can see this
                                </Label>
                                <Select
                                  aria-label="Who can see this"
                                  selectedKey={visibility}
                                  onSelectionChange={(key) => {
                                    if (
                                      key === "public" ||
                                      key === "friends" ||
                                      key === "private"
                                    ) {
                                      setVisibility(key);
                                    }
                                  }}
                                  className="mt-1 w-full"
                                >
                                  <Select.Trigger className="w-full justify-between rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800">
                                    <Select.Value />
                                    <Select.Indicator />
                                  </Select.Trigger>
                                  <Select.Popover className="z-[100]">
                                    <ListBox>
                                      <ListBox.Item
                                        id="public"
                                        textValue="Public"
                                        className="rounded-lg px-3 py-2 text-sm"
                                      >
                                        Public
                                      </ListBox.Item>
                                      <ListBox.Item
                                        id="friends"
                                        textValue="Friends — people you follow each other"
                                        className="rounded-lg px-3 py-2 text-sm"
                                      >
                                        Friends
                                      </ListBox.Item>
                                      <ListBox.Item
                                        id="private"
                                        textValue="Private"
                                        className="rounded-lg px-3 py-2 text-sm"
                                      >
                                        Private
                                      </ListBox.Item>
                                    </ListBox>
                                  </Select.Popover>
                                </Select>
                                {visibility === "friends" ? (
                                  <p className="mt-1.5 text-xs text-stone-400">
                                    People you follow each other
                                  </p>
                                ) : null}
                              </div>
                            </ShareDisclosure>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </>
              )}
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
