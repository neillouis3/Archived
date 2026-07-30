"use client";

import {
  BorderAll02Icon,
  LayoutGridIcon,
  RepostIcon,
  UserSquareIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

export type ProfileContentTab = "posts" | "pictures" | "reposts" | "tagged";

const TABS: {
  id: ProfileContentTab;
  label: string;
  icon: IconSvgElement;
}[] = [
  { id: "posts", label: "Posts", icon: BorderAll02Icon },
  { id: "pictures", label: "Pictures", icon: LayoutGridIcon },
  { id: "reposts", label: "Reposts", icon: RepostIcon },
  { id: "tagged", label: "Tagged", icon: UserSquareIcon },
];

export default function ProfileContentTabs({
  value,
  onChange,
}: {
  value: ProfileContentTab;
  onChange: (tab: ProfileContentTab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Profile content"
      className="flex w-full border-0"
    >
      {TABS.map(({ id, label, icon }) => {
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-label={label}
            aria-selected={active}
            onClick={() => onChange(id)}
            className={`relative flex flex-1 items-center justify-center py-3 transition-colors ${
              active
                ? "text-black"
                : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            <HugeiconsIcon
              icon={icon}
              size={22}
              strokeWidth={active ? 2 : 1.6}
            />
            {active ? (
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-0.5 bg-black"
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
