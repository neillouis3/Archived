"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Input,
  Label,
  Modal,
  TextField,
  useOverlayState,
} from "@heroui/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import CollectionArrangePanel from "@/components/collectionArrangePanel";
import type {
  CollectionVisibility,
  MediaPickItem,
} from "@/lib/collectionTypes";

type Props = {
  state: ReturnType<typeof useOverlayState>;
  mode: "create" | "edit";
  authorClerkId: string;
  initialName?: string;
  initialDescription?: string;
  initialVisibility?: CollectionVisibility;
  initialItems?: MediaPickItem[];
  onSubmit: (data: {
    name: string;
    description: string;
    visibility: CollectionVisibility;
    items: MediaPickItem[];
  }) => Promise<void>;
};

type Step = "details" | "photos" | "arrange" | "visibility";

const HEADER_H = 44;

const STEP_TITLE: Record<Step, string> = {
  details: "New collection",
  photos: "Add photos",
  arrange: "Arrange",
  visibility: "Visibility",
};

const VIS_OPTIONS: { id: CollectionVisibility; label: string; hint: string }[] =
  [
    { id: "public", label: "Public", hint: "Anyone can see this collection" },
    {
      id: "friends",
      label: "Friends",
      hint: "People you follow each other",
    },
    { id: "private", label: "Private", hint: "Only you can see it" },
  ];

const STEP_ORDER: Step[] = ["details", "photos", "arrange", "visibility"];

export default function CollectionFormModal({
  state,
  mode,
  authorClerkId,
  initialName = "",
  initialDescription = "",
  initialVisibility = "public",
  initialItems,
  onSubmit,
}: Props) {
  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [visibility, setVisibility] =
    useState<CollectionVisibility>(initialVisibility);
  const [picked, setPicked] = useState<MediaPickItem[]>([]);
  const [arrangeIndex, setArrangeIndex] = useState(0);
  const [library, setLibrary] = useState<MediaPickItem[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!state.isOpen) return;
    setStep("details");
    setName(initialName);
    setDescription(initialDescription);
    setVisibility(initialVisibility);
    setPicked(initialItems ?? []);
    setArrangeIndex(0);
    setError("");
    // Reset only when the modal opens so parent re-renders don't wipe picks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isOpen]);

  useEffect(() => {
    setArrangeIndex((i) =>
      Math.min(i, Math.max(0, picked.length - 1))
    );
  }, [picked.length]);

  useEffect(() => {
    if (step === "arrange") setArrangeIndex(0);
  }, [step]);

  useEffect(() => {
    if (!state.isOpen || step !== "photos" || !authorClerkId) return;
    let cancelled = false;
    setLibraryLoading(true);
    void (async () => {
      try {
        const res = await fetch(
          `/api/media/${encodeURIComponent(authorClerkId)}?limit=120`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (cancelled) return;
        if (data.success && Array.isArray(data.items)) {
          setLibrary(data.items);
        } else {
          setLibrary([]);
        }
      } catch {
        if (!cancelled) setLibrary([]);
      } finally {
        if (!cancelled) setLibraryLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [state.isOpen, step, authorClerkId]);

  const pickedIds = useMemo(() => new Set(picked.map((p) => p.id)), [picked]);

  const heading =
    mode === "edit" && step === "details"
      ? "Edit collection"
      : STEP_TITLE[step];

  function goBack() {
    setError("");
    const idx = STEP_ORDER.indexOf(step);
    if (idx > 0) setStep(STEP_ORDER[idx - 1]);
  }

  function goNext() {
    if (step === "details") {
      if (!name.trim()) {
        setError("Name is required");
        return;
      }
      setError("");
      setStep("photos");
      return;
    }
    if (step === "photos") {
      if (!picked.length) {
        setError("Select at least one photo");
        return;
      }
      setError("");
      setStep("arrange");
      return;
    }
    if (step === "arrange") {
      setError("");
      setStep("visibility");
    }
  }

  function toggleLibraryItem(item: MediaPickItem) {
    setPicked((prev) => {
      const exists = prev.some((p) => p.id === item.id);
      if (exists) return prev.filter((p) => p.id !== item.id);
      return [...prev, item];
    });
  }

  function removePicked(id: string) {
    setPicked((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name is required");
      setStep("details");
      return;
    }
    if (!picked.length) {
      setError("Select at least one photo");
      setStep("photos");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSubmit({
        name: trimmed,
        description: description.trim(),
        visibility,
        items: picked,
      });
      state.close();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  const primaryLabel =
    step === "visibility"
      ? saving
        ? mode === "create"
          ? "Creating…"
          : "Saving…"
        : mode === "create"
          ? "Create"
          : "Done"
      : "Next";

  return (
    <Modal state={state}>
      <Modal.Backdrop className="!z-[90] bg-black/65">
        <Modal.Container
          placement="center"
          className="relative flex w-full max-w-full items-center justify-center p-3 sm:p-6"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => state.close()}
            className="absolute right-4 top-4 z-[95] rounded-full p-2 text-white transition-colors hover:bg-white/10 sm:right-6 sm:top-6"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>

          <Modal.Dialog
            className="flex min-w-0 flex-col overflow-hidden rounded-xl bg-white !p-0 shadow-2xl transition-[width] duration-200 !h-auto !max-h-none !min-h-0 !max-w-none"
            style={
              step === "photos" || step === "arrange"
                ? {
                    width: "min(98vw, 1080px)",
                    minWidth: "min(98vw, 1080px)",
                    height: "min(92vh, 820px)",
                    maxHeight: "min(92vh, 820px)",
                    padding: 0,
                  }
                : {
                    width: "min(96vw, 420px)",
                    minWidth: "min(92vw, 360px)",
                    maxHeight: "min(92vh, 820px)",
                    padding: 0,
                  }
            }
          >
            <header
              className="relative flex shrink-0 items-center justify-center px-4"
              style={{ height: HEADER_H }}
            >
              {step !== "details" ? (
                <button
                  type="button"
                  onClick={goBack}
                  disabled={saving}
                  className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-stone-800 transition-colors hover:bg-stone-100 disabled:opacity-40"
                  aria-label="Back"
                >
                  <HugeiconsIcon
                    icon={ArrowLeft01Icon}
                    size={20}
                    strokeWidth={2}
                  />
                </button>
              ) : null}

              <Modal.Heading className="text-sm font-semibold text-stone-900">
                {heading}
              </Modal.Heading>

              <button
                type="button"
                onClick={() => {
                  if (step === "visibility") void handleSave();
                  else goNext();
                }}
                disabled={saving}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#0095f6] transition-colors hover:text-[#1877f2] disabled:cursor-not-allowed disabled:text-sky-300"
              >
                {primaryLabel}
              </button>
            </header>

            <div
              className={`min-h-0 flex-1 ${
                step === "arrange" ? "flex flex-col overflow-hidden" : "overflow-y-auto"
              }`}
            >
              {step === "details" ? (
                <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-6 pb-6 pt-6">
                  <TextField
                    value={name}
                    onChange={setName}
                    fullWidth
                    autoFocus
                    maxLength={80}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        goNext();
                      }
                    }}
                  >
                    <Label className="text-sm text-stone-500">Name</Label>
                    <Input
                      type="text"
                      placeholder="Summer 2026"
                      className="rounded-xl border border-stone-200 bg-white text-sm text-stone-700 shadow-none"
                    />
                  </TextField>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm text-stone-500">Description</Label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={500}
                      rows={6}
                      placeholder="Write a description…"
                      className="min-h-[140px] w-full resize-none rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 outline-none placeholder:text-stone-400 focus:border-stone-400"
                    />
                    <div className="flex justify-end">
                      <span className="text-xs text-stone-400">
                        {description.length}/500
                      </span>
                    </div>
                  </div>
                  {error ? (
                    <p className="text-sm text-rose-600">{error}</p>
                  ) : null}
                </div>
              ) : null}

              {step === "photos" ? (
                <div className="px-5 py-5">
                  {libraryLoading ? (
                    <div className="grid grid-cols-3 gap-1.5">
                      {Array.from({ length: 12 }, (_, i) => (
                        <div
                          key={i}
                          className="aspect-square animate-pulse rounded-md bg-stone-100"
                        />
                      ))}
                    </div>
                  ) : !library.length ? (
                    <p className="py-16 text-center text-sm text-stone-400">
                      No photos in your gallery yet.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-1.5">
                      {library.map((item) => {
                        const on = pickedIds.has(item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setError("");
                              toggleLibraryItem(item);
                            }}
                            className="relative aspect-square overflow-hidden rounded-md bg-stone-100"
                          >
                            <img
                              src={item.url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                            {on ? (
                              <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-stone-900 text-[10px] font-medium text-white">
                                ✓
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {error ? (
                    <p className="mt-4 text-sm text-rose-600">{error}</p>
                  ) : null}
                </div>
              ) : null}

              {step === "arrange" ? (
                <CollectionArrangePanel
                  items={picked}
                  activeIndex={arrangeIndex}
                  onActiveIndexChange={setArrangeIndex}
                  onReorder={setPicked}
                  onRemove={removePicked}
                  emptyMessage="No photos selected. Go back to add some."
                  error={error}
                />
              ) : null}

              {step === "visibility" ? (
                <div className="mx-auto flex max-w-md flex-col gap-1 py-2">
                  {VIS_OPTIONS.map((opt) => {
                    const selected = visibility === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setVisibility(opt.id)}
                        className={`flex w-full items-start justify-between gap-3 rounded-xl px-6 py-4 text-left transition-colors ${
                          selected ? "bg-stone-50" : "hover:bg-stone-50"
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-sm text-stone-900">{opt.label}</p>
                          <p className="mt-0.5 text-xs text-stone-400">
                            {opt.hint}
                          </p>
                        </div>
                        <span
                          className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${
                            selected
                              ? "border-stone-900 bg-stone-900"
                              : "border-stone-300 bg-white"
                          }`}
                          aria-hidden
                        >
                          {selected ? (
                            <span className="size-1.5 rounded-full bg-white" />
                          ) : null}
                        </span>
                      </button>
                    );
                  })}
                  {error ? (
                    <p className="px-6 py-3 text-sm text-rose-600">{error}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
