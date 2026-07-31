"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  CarouselHorizontalIcon,
  Delete02Icon,
  DragDropHorizontalIcon,
  Edit02Icon,
  Globe02Icon,
  LayoutGridIcon,
  MoreHorizontalIcon,
  SquareLock01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { Button, useOverlayState } from "@heroui/react";
import CollectionArrangeModal from "@/components/collectionArrangeModal";
import CollectionCard from "@/components/collectionCard";
import CollectionFormModal from "@/components/collectionFormModal";
import CollectionPhotoPickerModal from "@/components/collectionPhotoPickerModal";
import ImageGrid from "@/components/imageGrid";
import {
  FramerThumbnailCarousel,
  type CarouselItem,
} from "@/components/ui/framer-thumbnail-carousel";
import type {
  CollectionDetail,
  CollectionSummary,
  CollectionVisibility,
  MediaPickItem,
} from "@/lib/collectionTypes";

type GalleryLayout = "grid" | "carousel";

const VISIBILITY_OPTIONS: {
  id: CollectionVisibility;
  label: string;
  icon: IconSvgElement;
}[] = [
  { id: "public", label: "Public", icon: Globe02Icon },
  { id: "friends", label: "Friends", icon: UserGroupIcon },
  { id: "private", label: "Private", icon: SquareLock01Icon },
];

const VISIBILITY_LABEL: Record<CollectionVisibility, string> = {
  public: "Public",
  friends: "Friends",
  private: "Private",
};

type Props = {
  ownerClerkId: string;
  /** Owner can create / edit / delete / add photos */
  canManage: boolean;
  refreshNonce?: number;
  /** Open this collection from /c/[slug] */
  initialSlug?: string | null;
};

function GalleryGridLoader() {
  return (
    <div className="flex w-full gap-1" aria-busy="true" aria-label="Loading gallery">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div
          className="animate-pulse rounded-tl-md bg-stone-100"
          style={{ aspectRatio: "4/5" }}
        />
        <div className="animate-pulse bg-stone-100" style={{ aspectRatio: "1" }} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div
          className="animate-pulse rounded-tr-md bg-stone-100"
          style={{ aspectRatio: "1" }}
        />
        <div className="animate-pulse bg-stone-100" style={{ aspectRatio: "5/4" }} />
      </div>
    </div>
  );
}

function GalleryCarouselLoader() {
  return (
    <div
      className="flex w-full flex-col gap-3"
      aria-busy="true"
      aria-label="Loading gallery"
    >
      <div className="aspect-[4/3] w-full animate-pulse rounded-md bg-stone-100 sm:aspect-[16/10]" />
      <div className="flex h-20 gap-1 overflow-hidden">
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className="h-full shrink-0 animate-pulse rounded-md bg-stone-100"
            style={{ width: i === 0 ? 120 : 35 }}
          />
        ))}
      </div>
    </div>
  );
}

export default function CollectionsGallery({
  ownerClerkId,
  canManage,
  refreshNonce = 0,
  initialSlug = null,
}: Props) {
  const router = useRouter();
  const [collections, setCollections] = useState<CollectionSummary[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(
    null
  );
  const [activeDetail, setActiveDetail] = useState<CollectionDetail | null>(
    null
  );
  const [detailLoading, setDetailLoading] = useState(false);
  const [layout, setLayout] = useState<GalleryLayout>("grid");
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const [carouselLoading, setCarouselLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [visibilityOpen, setVisibilityOpen] = useState(false);
  const [visibilitySaving, setVisibilitySaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const createState = useOverlayState();
  const editState = useOverlayState();
  const pickerState = useOverlayState();
  const arrangeState = useOverlayState();
  const visibilityMenuRef = useRef<HTMLDivElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visibilityOpen && !menuOpen) return;
    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (
        visibilityOpen &&
        visibilityMenuRef.current &&
        !visibilityMenuRef.current.contains(target)
      ) {
        setVisibilityOpen(false);
      }
      if (
        menuOpen &&
        optionsMenuRef.current &&
        !optionsMenuRef.current.contains(target)
      ) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [visibilityOpen, menuOpen]);

  const loadCollections = useCallback(async () => {
    setCollectionsLoading(true);
    try {
      const res = await fetch(
        `/api/collections?ownerClerkId=${encodeURIComponent(ownerClerkId)}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.collections)) {
        setCollections(data.collections);
      } else {
        setCollections([]);
      }
    } catch {
      setCollections([]);
    } finally {
      setCollectionsLoading(false);
    }
  }, [ownerClerkId]);

  useEffect(() => {
    void loadCollections();
  }, [loadCollections, refreshNonce]);

  useEffect(() => {
    if (!initialSlug) {
      setActiveCollectionId(null);
      setActiveDetail(null);
      return;
    }
    const match = collections.find((c) => c.slug === initialSlug);
    if (match) {
      setActiveCollectionId(match.id);
      return;
    }
    if (collectionsLoading) return;

    let cancelled = false;
    setDetailLoading(true);
    void (async () => {
      try {
        const res = await fetch(
          `/api/collections?ownerClerkId=${encodeURIComponent(ownerClerkId)}&slug=${encodeURIComponent(initialSlug)}`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (cancelled) return;
        if (data.success && data.collection?.id) {
          setActiveCollectionId(data.collection.id);
          setActiveDetail(data.collection);
          setCollections((prev) => {
            if (prev.some((c) => c.id === data.collection.id)) return prev;
            return [data.collection, ...prev];
          });
        } else {
          router.replace(
            canManage
              ? "/gallery"
              : `/profile/${encodeURIComponent(ownerClerkId)}`
          );
        }
      } catch {
        if (!cancelled) {
          router.replace(
            canManage
              ? "/gallery"
              : `/profile/${encodeURIComponent(ownerClerkId)}`
          );
        }
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    initialSlug,
    collections,
    collectionsLoading,
    ownerClerkId,
    canManage,
    router,
  ]);

  useEffect(() => {
    if (!activeCollectionId) {
      if (!initialSlug) setActiveDetail(null);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    void (async () => {
      try {
        const res = await fetch(
          `/api/collections/${encodeURIComponent(activeCollectionId)}`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (cancelled) return;
        if (data.success && data.collection) {
          setActiveDetail(data.collection);
        } else {
          setActiveDetail(null);
          setActiveCollectionId(null);
        }
      } catch {
        if (!cancelled) {
          setActiveDetail(null);
          setActiveCollectionId(null);
        }
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeCollectionId, refreshNonce]);

  const collectionGridItems = useMemo(
    () =>
      (activeDetail?.items || []).map((item) => ({
        id: item.id,
        url: item.url,
        postId: item.postId,
        aspectRatio: item.aspectRatio,
      })),
    [activeDetail]
  );

  useEffect(() => {
    if (layout !== "carousel") return;
    let cancelled = false;

    void (async () => {
      if (activeCollectionId && !activeDetail) {
        setCarouselLoading(true);
        return;
      }

      setCarouselLoading(true);
      try {
        if (activeCollectionId && activeDetail) {
          if (cancelled) return;
          setCarouselItems(
            activeDetail.items.map((item, i) => ({
              id: item.id,
              url: item.url,
              title: `${activeDetail.name} · ${i + 1}`,
            }))
          );
          return;
        }
        const res = await fetch(
          `/api/media/${encodeURIComponent(ownerClerkId)}`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (cancelled) return;
        if (data.success && Array.isArray(data.items)) {
          setCarouselItems(
            data.items.map(
              (item: { id?: string; url: string }, i: number) => ({
                id: item.id ?? `media-${i}`,
                url: item.url,
                title: `Photo ${i + 1}`,
              })
            )
          );
        } else {
          setCarouselItems([]);
        }
      } catch {
        if (!cancelled) setCarouselItems([]);
      } finally {
        if (!cancelled) setCarouselLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    layout,
    ownerClerkId,
    activeCollectionId,
    activeDetail,
    refreshNonce,
  ]);

  function toggleLayout() {
    if (layout === "grid") {
      setCarouselLoading(true);
      setLayout("carousel");
    } else {
      setLayout("grid");
    }
  }

  async function createCollection(data: {
    name: string;
    description: string;
    visibility: CollectionVisibility;
    items: MediaPickItem[];
  }) {
    const res = await fetch("/api/collections", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        visibility: data.visibility,
        items: data.items.map((item) => ({
          url: item.url,
          sourceId: item.id,
          postId: item.postId ?? undefined,
          aspectRatio: item.aspectRatio ?? undefined,
        })),
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Could not create collection");
    }
    await loadCollections();
    if (json.collection?.slug) {
      router.push(`/c/${encodeURIComponent(json.collection.slug)}`);
    } else if (json.collection?.id) {
      setActiveCollectionId(json.collection.id);
      setActiveDetail(json.collection);
    }
  }

  async function saveCollectionMeta(data: {
    name: string;
    description: string;
    visibility: CollectionVisibility;
    items: MediaPickItem[];
  }) {
    if (!activeCollectionId) return;
    const res = await fetch(
      `/api/collections/${encodeURIComponent(activeCollectionId)}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          visibility: data.visibility,
          items: data.items.map((item) => ({
            url: item.url,
            sourceId: item.id,
            id: item.id,
            postId: item.postId ?? undefined,
            aspectRatio: item.aspectRatio ?? undefined,
          })),
        }),
      }
    );
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Could not update collection");
    }
    setActiveDetail(json.collection);
    await loadCollections();
    if (
      json.collection?.slug &&
      initialSlug &&
      json.collection.slug !== initialSlug
    ) {
      router.replace(`/c/${encodeURIComponent(json.collection.slug)}`);
    }
  }

  async function addPhotos(items: MediaPickItem[]) {
    if (!activeCollectionId) return;
    const res = await fetch(
      `/api/collections/${encodeURIComponent(activeCollectionId)}/items`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            url: item.url,
            sourceId: item.id,
            postId: item.postId ?? undefined,
            aspectRatio: item.aspectRatio ?? undefined,
          })),
        }),
      }
    );
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Could not add photos");
    }
    setActiveDetail(json.collection);
    await loadCollections();
  }

  async function saveRearrange(items: MediaPickItem[]) {
    if (!activeCollectionId || !activeDetail) return;
    const res = await fetch(
      `/api/collections/${encodeURIComponent(activeCollectionId)}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coverUrl: items[0]?.url,
          items: items.map((item) => {
            const existing = activeDetail.items.find(
              (row) =>
                row.id === item.id ||
                row.sourceId === item.id ||
                row.url === item.url
            );
            return {
              url: item.url,
              sourceId: existing?.sourceId || item.id,
              postId: item.postId ?? existing?.postId ?? undefined,
              aspectRatio:
                item.aspectRatio ?? existing?.aspectRatio ?? undefined,
            };
          }),
        }),
      }
    );
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Could not rearrange photos");
    }
    setActiveDetail(json.collection);
    await loadCollections();
  }

  async function updateVisibility(next: CollectionVisibility) {
    if (!activeCollectionId || !activeDetail) return;
    if (next === activeDetail.visibility) {
      setVisibilityOpen(false);
      return;
    }
    setVisibilitySaving(true);
    try {
      const res = await fetch(
        `/api/collections/${encodeURIComponent(activeCollectionId)}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visibility: next }),
        }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Could not update visibility");
      }
      setActiveDetail(json.collection);
      setVisibilityOpen(false);
      await loadCollections();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Could not update visibility");
    } finally {
      setVisibilitySaving(false);
    }
  }

  async function deleteCollection() {
    if (!activeCollectionId) return;
    if (!window.confirm("Delete this collection? Photos stay in your gallery.")) {
      return;
    }
    setRemoving(true);
    try {
      const res = await fetch(
        `/api/collections/${encodeURIComponent(activeCollectionId)}`,
        { method: "DELETE", credentials: "include" }
      );
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || "Could not delete");
      }
      setActiveCollectionId(null);
      setActiveDetail(null);
      setMenuOpen(false);
      await loadCollections();
      router.push("/gallery");
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Could not delete");
    } finally {
      setRemoving(false);
    }
  }

  const viewingCollection = Boolean(activeCollectionId || initialSlug);

  return (
    <div className="w-full">
      {!viewingCollection ? (
        <>
          <div className="mb-4 flex items-center justify-between gap-3">
            {canManage ? (
              <button
                type="button"
                onClick={() => createState.open()}
                className="text-sm font-medium text-[#0095f6] transition-colors hover:text-[#1877f2]"
              >
                + New Collection
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={toggleLayout}
              aria-label={
                layout === "grid"
                  ? "Switch to carousel layout"
                  : "Switch to grid layout"
              }
              title={
                layout === "grid" ? "Switch to carousel" : "Switch to grid"
              }
              className="inline-flex size-9 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-900"
            >
              <HugeiconsIcon
                icon={
                  layout === "grid" ? CarouselHorizontalIcon : LayoutGridIcon
                }
                size={18}
                strokeWidth={1.75}
              />
            </button>
          </div>

          {collectionsLoading ? (
            <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {Array.from({ length: 4 }, (_, i) => (
                <div
                  key={i}
                  className="aspect-square animate-pulse rounded-xl bg-stone-100"
                />
              ))}
            </div>
          ) : collections.length > 0 ? (
            <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {collections.map((c) => (
                <CollectionCard
                  key={c.id}
                  collection={c}
                  onClick={() =>
                    router.push(`/c/${encodeURIComponent(c.slug)}`)
                  }
                />
              ))}
            </div>
          ) : null}

          {layout === "grid" ? (
            <ImageGrid
              authorClerkId={ownerClerkId}
              refreshNonce={refreshNonce}
            />
          ) : carouselLoading ? (
            <GalleryCarouselLoader />
          ) : (
            <FramerThumbnailCarousel items={carouselItems} />
          )}
        </>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setVisibilityOpen(false);
                  router.push(
                    canManage
                      ? "/gallery"
                      : `/profile/${encodeURIComponent(ownerClerkId)}`
                  );
                }}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                aria-label="Back to gallery"
              >
                <HugeiconsIcon
                  icon={ArrowLeft01Icon}
                  size={18}
                  strokeWidth={1.75}
                />
              </button>
              <div className="flex min-w-0 items-center gap-1.5">
                <h2 className="truncate text-base font-medium leading-none text-stone-900">
                  {activeDetail?.name || "Collection"}
                </h2>
                {activeDetail ? (
                  <>
                    <span
                      className="shrink-0 translate-y-px text-sm leading-none text-stone-300"
                      aria-hidden
                    >
                      ·
                    </span>
                    {canManage ? (
                    <div className="relative shrink-0" ref={visibilityMenuRef}>
                      <button
                        type="button"
                        disabled={visibilitySaving}
                        onClick={() => {
                          setMenuOpen(false);
                          setVisibilityOpen((v) => !v);
                        }}
                        className="inline-flex h-5 items-center gap-0.5 rounded-md px-1 text-sm leading-none text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-800 disabled:opacity-50"
                        aria-expanded={visibilityOpen}
                        aria-haspopup="listbox"
                      >
                        <span className="leading-none">
                          {VISIBILITY_LABEL[activeDetail.visibility]}
                        </span>
                        <HugeiconsIcon
                          icon={ArrowDown01Icon}
                          size={14}
                          strokeWidth={2}
                          className={`shrink-0 transition-transform ${
                            visibilityOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {visibilityOpen ? (
                        <div className="absolute left-0 z-20 mt-1 w-40 overflow-hidden rounded-xl border border-stone-200 bg-white py-1 shadow-lg">
                          {VISIBILITY_OPTIONS.map((opt) => {
                            const selected =
                              activeDetail.visibility === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                disabled={visibilitySaving}
                                onClick={() => void updateVisibility(opt.id)}
                                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-stone-50 disabled:opacity-50 ${
                                  selected
                                    ? "font-medium text-stone-900"
                                    : "text-stone-700"
                                }`}
                              >
                                <HugeiconsIcon
                                  icon={opt.icon}
                                  size={16}
                                  strokeWidth={1.75}
                                  className="text-stone-400"
                                />
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <span className="shrink-0 text-sm leading-none text-stone-400">
                      {VISIBILITY_LABEL[activeDetail.visibility]}
                    </span>
                  )}
                  </>
                ) : null}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {canManage ? (
                <div className="relative" ref={optionsMenuRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setVisibilityOpen(false);
                      setMenuOpen((v) => !v);
                    }}
                    className="inline-flex size-9 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                    aria-label="Collection options"
                  >
                    <HugeiconsIcon
                      icon={MoreHorizontalIcon}
                      size={18}
                      strokeWidth={1.75}
                    />
                  </button>
                  {menuOpen ? (
                    <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-stone-200 bg-white py-1 shadow-lg">
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50"
                        onClick={() => {
                          setMenuOpen(false);
                          pickerState.open();
                        }}
                      >
                        <HugeiconsIcon
                          icon={Add01Icon}
                          size={16}
                          strokeWidth={1.75}
                        />
                        Add photos
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50"
                        onClick={() => {
                          setMenuOpen(false);
                          arrangeState.open();
                        }}
                      >
                        <HugeiconsIcon
                          icon={DragDropHorizontalIcon}
                          size={16}
                          strokeWidth={1.75}
                        />
                        Rearrange
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50"
                        onClick={() => {
                          setMenuOpen(false);
                          editState.open();
                        }}
                      >
                        <HugeiconsIcon
                          icon={Edit02Icon}
                          size={16}
                          strokeWidth={1.75}
                        />
                        Edit details
                      </button>
                      <button
                        type="button"
                        disabled={removing}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                        onClick={() => void deleteCollection()}
                      >
                        <HugeiconsIcon
                          icon={Delete02Icon}
                          size={16}
                          strokeWidth={1.75}
                        />
                        Delete
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
              <button
                type="button"
                onClick={toggleLayout}
                aria-label={
                  layout === "grid"
                    ? "Switch to carousel layout"
                    : "Switch to grid layout"
                }
                title={
                  layout === "grid" ? "Switch to carousel" : "Switch to grid"
                }
                className="inline-flex size-9 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-900"
              >
                <HugeiconsIcon
                  icon={
                    layout === "grid" ? CarouselHorizontalIcon : LayoutGridIcon
                  }
                  size={18}
                  strokeWidth={1.75}
                />
              </button>
            </div>
          </div>

          {activeDetail?.description ? (
            <p className="-mt-2 mb-4 whitespace-pre-line text-sm text-stone-500">
              {activeDetail.description}
            </p>
          ) : null}

          {detailLoading && !activeDetail ? (
            layout === "grid" ? (
              <GalleryGridLoader />
            ) : (
              <GalleryCarouselLoader />
            )
          ) : layout === "grid" ? (
            <ImageGrid
              items={collectionGridItems}
              emptyMessage={
                canManage
                  ? "No photos in this collection yet."
                  : "No photos in this collection."
              }
            />
          ) : carouselLoading ? (
            <GalleryCarouselLoader />
          ) : (
            <FramerThumbnailCarousel items={carouselItems} />
          )}

          {canManage && activeDetail && activeDetail.itemCount === 0 ? (
            <div className="mt-4 flex justify-center">
              <Button variant="secondary" onPress={() => pickerState.open()}>
                Add photos
              </Button>
            </div>
          ) : null}
        </>
      )}

      {canManage ? (
        <>
          <CollectionFormModal
            state={createState}
            mode="create"
            authorClerkId={ownerClerkId}
            onSubmit={createCollection}
          />
          <CollectionFormModal
            state={editState}
            mode="edit"
            authorClerkId={ownerClerkId}
            initialName={activeDetail?.name || ""}
            initialDescription={activeDetail?.description || ""}
            initialVisibility={activeDetail?.visibility || "public"}
            initialItems={(activeDetail?.items || []).map((item) => ({
              id: item.sourceId || item.id,
              url: item.url,
              postId: item.postId,
              aspectRatio: item.aspectRatio,
            }))}
            onSubmit={saveCollectionMeta}
          />
          <CollectionPhotoPickerModal
            state={pickerState}
            authorClerkId={ownerClerkId}
            excludeUrls={(activeDetail?.items || []).map((i) => i.url)}
            onConfirm={addPhotos}
          />
          <CollectionArrangeModal
            state={arrangeState}
            initialItems={(activeDetail?.items || []).map((item) => ({
              id: item.id,
              url: item.url,
              postId: item.postId,
              aspectRatio: item.aspectRatio,
            }))}
            onSave={saveRearrange}
          />
        </>
      ) : null}
    </div>
  );
}
