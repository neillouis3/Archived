"use client";
import React, { useState } from "react";
import {
  Modal,
  Button,
  Label,
  Separator,
  useOverlayState,
} from "@heroui/react";
import Dropzone from "@components/dropbox";
import { useUser } from "@clerk/nextjs";
import { dispatchArchiveFeedRefresh } from "@/lib/feedRefresh";
import {
  pickUploadThingPublicUrl,
  uploadFilesToUploadThing,
} from "@/lib/uploadthingReact";
import { PlusIcon } from "./icons";

function getReadableErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    const msg = err.message?.trim();
    if (msg) return msg;
    // UploadThing and fetch wrappers sometimes nest details in `cause`.
    const cause = (err as { cause?: unknown }).cause;
    if (cause instanceof Error && cause.message?.trim()) return cause.message.trim();
    if (typeof cause === "string" && cause.trim()) return cause.trim();
  }
  if (typeof err === "string" && err.trim()) return err.trim();
  return "Upload failed. Please try again in a moment.";
}

export default function AddPostModal({
  imageUrl,
  username,
  fullName,
  triggerStyle = "button",
  fullWidth = false,
}: {
  imageUrl?: string;
  username?: string;
  fullName?: string;
  triggerStyle?: "button" | "input";
  fullWidth?: boolean;
} = {}) {
  const state = useOverlayState({ defaultOpen: false });
  const { user } = useUser();

  const resolvedImageUrl = imageUrl ?? "https://i.pravatar.cc/150?u=placeholder";
  const resolvedUsername = username ? `@${username}` : "@username";
  const resolvedFullName = fullName ?? "Your Name";

  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [rejected, setRejected] = useState([]);
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "friends" | "private">(
    "public"
  );

  const handlePost = async () => {
    if (!user?.id) {
      alert("Sign in to post.");
      return;
    }
    if (files.length === 0) {
      alert("Add at least one photo to post.");
      return;
    }
    setLoading(true);
    try {
      /** Use imperative helper so failures throw; `useUploadThing().startUpload` swallows errors and returns `undefined`. */
      const uploaded = await uploadFilesToUploadThing("postMedia", { files });
      const mediaUrls = uploaded
        .map((item) => pickUploadThingPublicUrl(item))
        .filter(Boolean);
      if (!mediaUrls.length) {
        throw new Error("Upload did not return any image URLs. Try again.");
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          authorClerkId: user.id,
          fullName: resolvedFullName,
          username: resolvedUsername,
          avatarUrl: resolvedImageUrl,
          body: description,
          media: mediaUrls,
          visibility,
        }),
      });

      if (!res.ok) throw new Error(`Failed to create post: ${res.status}`);

      setFiles([]);
      setDescription("");
      setVisibility("public");
      state.close();
      dispatchArchiveFeedRefresh();
    } catch (err: unknown) {
      console.error(err);
      const message = getReadableErrorMessage(err);
      alert(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal state={state}>
      {triggerStyle === "input" ? (
        <Button
          variant="tertiary"
          size="sm"
          fullWidth={fullWidth}
          className="justify-start font-normal text-stone-400"
        >
          Share a milestone...
        </Button>
      ) : (
        <Button variant="primary" size="sm" fullWidth={fullWidth} className="gap-2">
          <PlusIcon />
          Post
        </Button>
      )}

      <Modal.Backdrop>
        <Modal.Container className="w-full max-w-full p-4 sm:p-6">
          <Modal.Dialog className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-[min(70vw,56rem)] min-w-0 mx-auto">
            {({ close }) => (
              <>
                <Modal.Header className="px-6 py-4 border-b border-stone-200 flex items-center justify-between gap-3">
                  <Modal.Heading
                    className="text-xl font-normal text-stone-800"
                   
                  >
                    Post milestones
                  </Modal.Heading>
                  <Modal.CloseTrigger className="text-stone-400 hover:text-stone-700 transition-colors shrink-0 p-1 min-w-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </Modal.CloseTrigger>
                </Modal.Header>

                <Modal.Body className="p-6 overflow-y-auto max-h-[70vh]">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 min-h-80 min-w-0">
                      <Dropzone
                        className=""
                        files={files}
                        setFiles={setFiles}
                        rejected={rejected}
                        setRejected={setRejected}
                      />
                    </div>

                    <div className="flex-1 flex flex-col gap-4 min-w-0">
                      <div className="flex items-center gap-3">
                        <img
                          src={resolvedImageUrl}
                          alt={resolvedFullName}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-stone-700 truncate">{resolvedFullName}</span>
                          <span className="text-xs text-stone-400 truncate">{resolvedUsername}</span>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-medium text-stone-600">
                          Description <span className="font-normal text-stone-400">(optional)</span>
                        </Label>
                        <textarea
                          placeholder="Add a caption (optional)"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={7}
                          className="bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 placeholder:text-stone-300 outline-none resize-none focus:border-stone-400 transition-colors"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label className="text-xs font-medium text-stone-600">Who can see this</Label>
                        <div className="flex flex-col gap-2">
                          {(
                            [
                              { value: "public" as const, label: "Public", hint: "Anyone" },
                              { value: "friends" as const, label: "Friends", hint: "Accepted friends only" },
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
                                name="post-visibility"
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
                    </div>
                  </div>
                </Modal.Body>

                <Modal.Footer className="px-6 py-4 border-t border-stone-200 flex items-center justify-end gap-3">
                  <Button variant="ghost" size="sm" onPress={close}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onPress={handlePost}
                    isPending={loading}
                    isDisabled={loading || files.length === 0}
                  >
                    {loading ? "Working…" : "Post"}
                  </Button>
                </Modal.Footer>
              </>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
