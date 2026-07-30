import {
  Add01Icon,
  Mail01Icon,
  Tag01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export const PlusIcon = (props: { className?: string }) => (
  <HugeiconsIcon icon={Add01Icon} size={16} className={props.className ?? "size-4"} />
);

export const MailIcon = (props: { className?: string }) => (
  <HugeiconsIcon
    icon={Mail01Icon}
    size={20}
    strokeWidth={1.5}
    className={props.className ?? "size-5 text-default-400"}
  />
);

export const TagIcon = (props: { className?: string }) => (
  <HugeiconsIcon
    icon={Tag01Icon}
    size={20}
    strokeWidth={1.5}
    className={props.className ?? "size-5 text-default-400"}
  />
);
