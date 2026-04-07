import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchRedirectPage({ searchParams }: Props) {
  const sp = await searchParams;
  const raw = sp.q?.trim();
  const target =
    raw && raw.length > 0
      ? `/explore?q=${encodeURIComponent(raw)}`
      : "/explore";
  redirect(target);
}
