"use client";

import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Label,
  Separator,
  useOverlayState,
} from "@heroui/react";

export type EditPostVisibility = "public" | "friends" | "private";

type EditPostModalProps = {
  state: ReturnType<typeof useOverlayState>;
  trigger?: ReactElement | null;
  postId: string;
  initialBio: string;
  initialLocation: string;
  initialVisibility: EditPostVisibility;
  onSaved: (data: {
    body: string;
    location?: string;
    visibility: EditPostVisibility;
  }) => void;
  onDeleted: () => void;
};

export default function EditPostModal({
  state,
  trigger = null,
  postId,
  initialBio,
  initialLocation,
  initialVisibility,
  onSaved,
  onDeleted,
}: EditPostModalProps) {
  const [bio, setBio] = useState(initialBio);
  const [location, setLocation] = useState(initialLocation);
  const [visibility, setVisibility] = useState<EditPostVisibility>(initialVisibility);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!state.isOpen) return;
    setBio(initialBio);
    setLocation(initialLocation);
    setVisibility(initialVisibility);
  }, [state.isOpen, initialBio, initialLocation, initialVisibility]);

  async function handleSave(close: () => void) {
    const trimmedBio = bio.trim();
    setSaving(true);
    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(postId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          body: trimmedBio,
          location: location.trim(),
          visibility,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Save failed (${res.status})`);
      }
      const data = await res.json();
      onSaved({
        body: typeof data.body === "string" ? data.body : trimmedBio,
        location: typeof data.location === "string" ? data.location : location.trim(),
        visibility: (["public", "friends", "private"].includes(data.visibility)
          ? data.visibility
          : visibility) as EditPostVisibility,
      });
      close();
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(close: () => void) {
    if (!window.confirm("Delete this post permanently? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(postId)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Delete failed (${res.status})`);
      }
      onDeleted();
      close();
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Could not delete post.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Modal state={state}>
      {trigger}
      <Modal.Backdrop className="!z-[110]">
        <Modal.Container className="w-full max-w-full p-4 sm:p-6">
          <Modal.Dialog className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-lg min-w-0 mx-auto">
            {({ close }) => (
              <>
                <Modal.Header className="px-6 py-4 border-b border-stone-200 flex items-center justify-between gap-3">
                  <Modal.Heading
                    className="text-lg font-normal text-stone-800"
                   
                  >
                    Edit post
                  </Modal.Heading>
                  <Modal.CloseTrigger className="text-stone-400 hover:text-stone-700 transition-colors shrink-0 p-1 min-w-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </Modal.CloseTrigger>
                </Modal.Header>

                <Modal.Body className="p-6 overflow-y-auto max-h-[65vh] flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-medium text-stone-600">
                      Description <span className="font-normal text-stone-400">(optional)</span>
                    </Label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={5}
                      className="bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 placeholder:text-stone-300 outline-none resize-none focus:border-stone-400 transition-colors"
                      placeholder="Caption (optional)"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-medium text-stone-600">Location</Label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-700 placeholder:text-stone-300 outline-none focus:border-stone-400 transition-colors"
                      placeholder="City, venue, or place"
                    />
                  </div>

                  <Separator />

                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-medium text-stone-600">Who can see this</Label>
                    <div className="flex flex-col gap-2">
                      {(
                        [
                          { value: "public" as const, label: "Public", hint: "Anyone" },
                          { value: "friends" as const, label: "Friends", hint: "People you follow each other" },
                          { value: "private" as const, label: "Private", hint: "Only you" },
                        ] as const
                      ).map(({ value, label, hint }) => (
                        <label
                          key={value}
                          className={`flex items-start gap-3 rounded-xl border px-3 py-2.5 cursor-pointer transition-colors ${
                            visibility === value
                              ? "border-stone-500 bg-white"
                              : "border-stone-200 hover:border-stone-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="edit-post-visibility"
                            value={value}
                            checked={visibility === value}
                            onChange={() => setVisibility(value)}
                            className="mt-1"
                          />
                          <span className="flex flex-col min-w-0">
                            <span className="text-sm text-stone-800">{label}</span>
                            <span className="text-xs text-stone-400">{hint}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </Modal.Body>

                <Modal.Footer className="px-6 py-4 border-t border-stone-200 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
                  <Button
                    variant="ghost"
                    onPress={() => void handleDelete(close)}
                    isDisabled={saving || deleting}
                    isPending={deleting}
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs sm:mr-auto"
                  >
                    Delete post
                  </Button>
                  <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
                    <Button
                      variant="ghost"
                      onPress={close}
                      isDisabled={saving || deleting}
                      className="text-stone-400 hover:text-stone-600 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      onPress={() => void handleSave(close)}
                      isPending={saving}
                      isDisabled={saving || deleting}
                      className="bg-stone-800 hover:bg-stone-700 disabled:bg-stone-300 text-white text-xs rounded-xl px-6"
                    >
                      {saving ? "Saving…" : "Save"}
                    </Button>
                  </div>
                </Modal.Footer>
              </>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
