"use client";

import { useUser } from "@clerk/nextjs";
import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  FavouriteIcon,
  StarIcon,
  UserMinus01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { Modal, useOverlayState } from "@heroui/react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type Props = {
  targetUserId: string;
  username?: string | null;
  imageUrl?: string | null;
  className?: string;
  /** Called after a successful follow or unfollow */
  onChange?: () => void;
  /** Seed follow state without an extra status request (e.g. sidebar suggestions). */
  initialFollowing?: boolean;
  /** When true, render nothing if the viewer already follows the target. */
  hideIfFollowing?: boolean;
};

const pillBase =
  "inline-flex items-center justify-center gap-1 rounded-lg px-4 py-1.5 text-sm font-normal transition-colors disabled:opacity-50";

function MenuRow({
  label,
  icon,
  onClick,
  danger = false,
}: {
  label: string;
  icon?: IconSvgElement;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mx-2 flex w-[calc(100%-1rem)] items-center justify-between gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors hover:bg-neutral-100 ${
        danger ? "text-red-600" : "text-neutral-900"
      }`}
    >
      <span>{label}</span>
      {icon ? (
        <HugeiconsIcon
          icon={icon}
          size={18}
          strokeWidth={1.6}
          className={`shrink-0 ${danger ? "text-red-600" : "text-neutral-800"}`}
        />
      ) : null}
    </button>
  );
}

export default function FollowButton({
  targetUserId,
  username,
  imageUrl,
  className = "",
  onChange,
  initialFollowing,
  hideIfFollowing = false,
}: Props) {
  const { user, isLoaded } = useUser();
  const menu = useOverlayState();
  const [following, setFollowing] = useState<boolean | null>(() =>
    typeof initialFollowing === "boolean" ? initialFollowing : null
  );
  const [followsYou, setFollowsYou] = useState(false);
  const [loading, setLoading] = useState(false);

  const displayName =
    (username ?? "").replace(/^@+/, "").trim() ||
    targetUserId.slice(0, 10) + "…";
  const avatarSrc =
    imageUrl?.trim() ||
    `https://i.pravatar.cc/150?u=${encodeURIComponent(targetUserId)}`;

  const load = useCallback(async () => {
    if (!targetUserId) return;
    try {
      const res = await fetch(
        `/api/follows/${encodeURIComponent(targetUserId)}`,
        { credentials: "include" }
      );
      if (!res.ok) return;
      const data = await res.json();
      setFollowing(Boolean(data.isFollowing));
      setFollowsYou(Boolean(data.followsYou));
    } catch {
      setFollowing(null);
      setFollowsYou(false);
    }
  }, [targetUserId]);

  useEffect(() => {
    if (!isLoaded || !user || user.id === targetUserId) {
      if (typeof initialFollowing !== "boolean") setFollowing(null);
      return;
    }
    if (typeof initialFollowing === "boolean") {
      setFollowing(initialFollowing);
    }
    void load();
  }, [isLoaded, user, targetUserId, load, initialFollowing]);

  if (!isLoaded || !user || user.id === targetUserId) return null;
  if (following === null) return null;
  if (hideIfFollowing && following) return null;

  async function follow() {
    setLoading(true);
    try {
      await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ followingClerkId: targetUserId }),
      });
      setFollowing(true);
      onChange?.();
    } finally {
      setLoading(false);
    }
  }

  async function unfollow() {
    setLoading(true);
    try {
      await fetch(`/api/follows/${encodeURIComponent(targetUserId)}`, {
        method: "DELETE",
        credentials: "include",
      });
      setFollowing(false);
      menu.close();
      onChange?.();
    } finally {
      setLoading(false);
    }
  }

  const labelFollow = followsYou ? "Follow back" : "Follow";

  return (
    <>
      <button
        type="button"
        disabled={loading}
        onClick={() => {
          if (following) menu.open();
          else void follow();
        }}
        className={
          className ||
          (following
            ? `${pillBase} bg-neutral-100 text-black hover:bg-neutral-200`
            : `${pillBase} bg-black text-white hover:bg-neutral-800`)
        }
      >
        {loading && !menu.isOpen ? (
          "…"
        ) : following ? (
          <>
            Following
            <HugeiconsIcon icon={ArrowDown01Icon} size={14} strokeWidth={2} />
          </>
        ) : (
          labelFollow
        )}
      </button>

      <Modal state={menu}>
        <Modal.Backdrop className="bg-black/50">
          <Modal.Container className="flex items-center justify-center p-4">
            <Modal.Dialog className="w-full max-w-[360px] overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="relative flex flex-col items-center px-5 pb-4 pt-6">
                <Modal.CloseTrigger className="absolute right-3 top-3 rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-800">
                  <HugeiconsIcon icon={Cancel01Icon} size={18} strokeWidth={1.8} />
                </Modal.CloseTrigger>

                <div className="relative size-16 overflow-hidden rounded-full bg-neutral-100">
                  <Image
                    src={avatarSrc}
                    alt={displayName}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <p className="mt-3 text-sm font-normal text-neutral-900">
                  {displayName}
                </p>
              </div>

              <div className="py-2">
                <MenuRow
                  label="Add to close friends list"
                  icon={StarIcon}
                  onClick={() => menu.close()}
                />
                <MenuRow
                  label="Add to favorites"
                  icon={FavouriteIcon}
                  onClick={() => menu.close()}
                />
                <MenuRow
                  label="Mute"
                  icon={ArrowRight01Icon}
                  onClick={() => menu.close()}
                />
                <MenuRow
                  label="Restrict"
                  icon={ArrowRight01Icon}
                  onClick={() => menu.close()}
                />
                <MenuRow
                  label={loading ? "…" : "Unfollow"}
                  icon={UserMinus01Icon}
                  danger
                  onClick={() => void unfollow()}
                />
              </div>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
