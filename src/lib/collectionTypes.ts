export type CollectionVisibility = "public" | "friends" | "private";

export type CollectionSummary = {
  id: string;
  ownerClerkId: string;
  name: string;
  slug: string;
  description: string;
  visibility: CollectionVisibility;
  coverUrl: string;
  previewUrls: string[];
  itemCount: number;
  createdAt?: string;
  updatedAt?: string;
};

export type CollectionItem = {
  id: string;
  url: string;
  sourceId: string | null;
  postId: string | null;
  aspectRatio: number | null;
  addedAt?: string;
};

export type CollectionDetail = CollectionSummary & {
  items: CollectionItem[];
};

export type MediaPickItem = {
  id: string;
  url: string;
  postId?: string | null;
  aspectRatio?: number | null;
};
