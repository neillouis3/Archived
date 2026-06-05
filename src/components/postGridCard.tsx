import Link from "next/link";

type PostGridCardProps = {
  href: string;
  src: string;
  alt: string;
  /** Shown on hover in the bottom gradient (e.g. @username). */
  caption?: string;
};

/**
 * Shared tile for post grids (Explore, Home grid view, etc.).
 */
export function PostGridCard({ href, src, alt, caption }: PostGridCardProps) {
  return (
    <Link
      href={href}
      className="relative aspect-square overflow-hidden group block bg-white rounded-sm ring-1 ring-stone-200/40"
      aria-label={alt}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        style={{ filter: "brightness(0.97) contrast(1.02) saturate(0.92)" }}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
      {caption ? (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <p className="text-xs text-white font-medium truncate">
            {caption.replace(/^@+/, "")}
          </p>
        </div>
      ) : null}
    </Link>
  );
}

export const postGridClassName =
  "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5";
