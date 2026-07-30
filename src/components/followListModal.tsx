"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Label, Modal, SearchField, useOverlayState } from "@heroui/react";
import FollowButton from "@/components/FollowButton";

export type FollowListKind = "followers" | "following";

type FollowListUser = {
  id: string;
  username: string | null;
  fullName: string;
  imageUrl: string;
  viewerFollows: boolean;
  isSelf: boolean;
};

type Props = {
  userId: string;
  kind: FollowListKind;
  state: ReturnType<typeof useOverlayState>;
  /** Own profile: show Remove on followers, Following controls on following. */
  isOwnProfile?: boolean;
  onCountsChange?: () => void;
};

export default function FollowListModal({
  userId,
  kind,
  state,
  isOwnProfile = false,
  onCountsChange,
}: Props) {
  const { user } = useUser();
  const [users, setUsers] = useState<FollowListUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  const title = kind === "followers" ? "Followers" : "Following";

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/follows/${encodeURIComponent(userId)}/list?type=${kind}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [userId, kind]);

  useEffect(() => {
    if (!state.isOpen) return;
    setQuery("");
    void load();
  }, [state.isOpen, load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const handle = (u.username || "").toLowerCase();
      const name = (u.fullName || "").toLowerCase();
      return handle.includes(q) || name.includes(q);
    });
  }, [users, query]);

  async function removeFollower(followerId: string) {
    setRemovingId(followerId);
    try {
      const res = await fetch(
        `/api/follows/followers/${encodeURIComponent(followerId)}`,
        { method: "DELETE", credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed");
      setUsers((prev) => prev.filter((u) => u.id !== followerId));
      onCountsChange?.();
    } catch {
      // silent
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <Modal state={state}>
      <Modal.Backdrop className="bg-black/50">
        <Modal.Container className="flex items-center justify-center p-4">
          <Modal.Dialog
            aria-label={title}
            className="flex h-[min(560px,85vh)] w-full max-w-[400px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="relative flex shrink-0 items-center justify-center px-5 pb-3 pt-5">
              <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
              <Modal.CloseTrigger className="absolute right-3 top-3 rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-800">
                <HugeiconsIcon icon={Cancel01Icon} size={18} strokeWidth={1.8} />
              </Modal.CloseTrigger>
            </div>

            <div className="shrink-0 px-4 pb-3">
              <SearchField
                value={query}
                onChange={setQuery}
                fullWidth
                variant="secondary"
                aria-label={`Search ${title.toLowerCase()}`}
              >
                <Label className="sr-only">Search {title.toLowerCase()}</Label>
                <SearchField.Group>
                  <SearchField.SearchIcon />
                  <SearchField.Input placeholder="Search" />
                  <SearchField.ClearButton />
                </SearchField.Group>
              </SearchField>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
              {loading ? (
                <p className="flex h-full items-center justify-center px-3 text-center text-sm text-neutral-400">
                  Loading…
                </p>
              ) : filtered.length === 0 ? (
                <p className="flex h-full items-center justify-center px-3 text-center text-sm text-neutral-400">
                  {query.trim()
                    ? "No matches"
                    : kind === "followers"
                      ? "No followers yet"
                      : "Not following anyone yet"}
                </p>
              ) : (
                filtered.map((u) => {
                  const handle = (u.username || "").replace(/^@+/, "") || "user";
                  const href = `/profile/${encodeURIComponent(u.id)}`;
                  return (
                    <div
                      key={u.id}
                      className="mx-1 flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-neutral-100"
                    >
                      <Link
                        href={href}
                        onClick={() => state.close()}
                        className="flex min-w-0 flex-1 items-center gap-3"
                      >
                        <span className="relative size-11 shrink-0 overflow-hidden rounded-full bg-neutral-100">
                          <Image
                            src={u.imageUrl}
                            alt={handle}
                            fill
                            className="object-cover"
                            sizes="44px"
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-neutral-900">
                            {handle}
                          </span>
                          <span className="block truncate text-sm text-neutral-500">
                            {u.fullName}
                          </span>
                        </span>
                      </Link>

                      {u.isSelf || user?.id === u.id ? null : isOwnProfile &&
                        kind === "followers" ? (
                        <button
                          type="button"
                          disabled={removingId === u.id}
                          onClick={() => void removeFollower(u.id)}
                          className="shrink-0 rounded-lg bg-neutral-100 px-3 py-1.5 text-sm text-neutral-900 transition-colors hover:bg-neutral-200 disabled:opacity-50"
                        >
                          {removingId === u.id ? "…" : "Remove"}
                        </button>
                      ) : (
                        <FollowButton
                          targetUserId={u.id}
                          username={u.username}
                          imageUrl={u.imageUrl}
                          initialFollowing={u.viewerFollows}
                          onChange={() => {
                            if (kind === "following" && isOwnProfile) {
                              setUsers((prev) =>
                                prev.filter((row) => row.id !== u.id)
                              );
                            } else {
                              setUsers((prev) =>
                                prev.map((row) =>
                                  row.id === u.id
                                    ? {
                                        ...row,
                                        viewerFollows: !row.viewerFollows,
                                      }
                                    : row
                                )
                              );
                            }
                            onCountsChange?.();
                          }}
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
