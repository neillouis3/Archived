"use client";

import {
  Flag01Icon,
  InformationCircleIcon,
  MoreHorizontalIcon,
  Share01Icon,
  UserBlock01Icon,
  UserLock01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { Modal, useOverlayState } from "@heroui/react";
import { useState } from "react";

type Props = {
  username?: string | null;
  userId: string;
};

const ACTIONS: {
  label: string;
  danger?: boolean;
  action: "block" | "restrict" | "report" | "share" | "about";
  icon: IconSvgElement;
}[] = [
  { label: "Block", danger: true, action: "block", icon: UserBlock01Icon },
  { label: "Restrict", danger: true, action: "restrict", icon: UserLock01Icon },
  { label: "Report", danger: true, action: "report", icon: Flag01Icon },
  { label: "Share to...", action: "share", icon: Share01Icon },
  {
    label: "About this account",
    action: "about",
    icon: InformationCircleIcon,
  },
];

export default function ProfileActionsMenu({ username, userId }: Props) {
  const menu = useOverlayState();
  const [copied, setCopied] = useState(false);

  async function onAction(action: (typeof ACTIONS)[number]["action"]) {
    if (action === "share") {
      const url =
        typeof window !== "undefined"
          ? `${window.location.origin}/profile/${encodeURIComponent(userId)}`
          : "";
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
          menu.close();
        }, 900);
      } catch {
        menu.close();
      }
      return;
    }
    menu.close();
  }

  return (
    <>
      <button
        type="button"
        aria-label="More profile options"
        onClick={() => menu.open()}
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-black transition-colors hover:bg-neutral-200"
      >
        <HugeiconsIcon icon={MoreHorizontalIcon} size={20} strokeWidth={2} />
      </button>

      <Modal state={menu}>
        <Modal.Backdrop className="bg-black/50">
          <Modal.Container className="flex items-center justify-center p-4">
            <Modal.Dialog
              aria-label={
                username
                  ? `Options for @${username.replace(/^@+/, "")}`
                  : "Profile options"
              }
              className="w-full max-w-[360px] overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div className="py-2">
                {ACTIONS.map(({ label, danger, action, icon }) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => void onAction(action)}
                    className={`mx-2 flex w-[calc(100%-1rem)] items-center justify-between gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors hover:bg-neutral-100 ${
                      danger ? "text-red-600" : "text-neutral-900"
                    }`}
                  >
                    <span>
                      {action === "share" && copied ? "Link copied" : label}
                    </span>
                    <HugeiconsIcon
                      icon={icon}
                      size={18}
                      strokeWidth={1.6}
                      className={`shrink-0 ${
                        danger ? "text-red-600" : "text-neutral-800"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
