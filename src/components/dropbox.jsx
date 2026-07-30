// Dropzone.jsx
"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Button } from "@heroui/react";
import { Album02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export const CopyDocumentIcon = () => (
  <HugeiconsIcon
    icon={Album02Icon}
    size={56}
    strokeWidth={1.5}
    className="text-stone-300"
  />
);

function CreateMediaIcons() {
  return (
    <div className="mb-6 flex items-center justify-center" aria-hidden>
      <HugeiconsIcon
        icon={Album02Icon}
        size={112}
        strokeWidth={1.25}
        className="text-stone-900"
      />
    </div>
  );
}

/**
 * @param {{
 *   files: File[],
 *   setFiles: Function,
 *   rejected: any[],
 *   setRejected: Function,
 *   className?: string,
 *   variant?: 'default' | 'create',
 * }} props
 */
const Dropzone = ({
  files,
  setFiles,
  rejected,
  setRejected,
  className = "",
  variant = "default",
}) => {
  const AUTO_CLEAR_REJECT_MS = 4500;

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (acceptedFiles?.length) {
      setFiles((prev) => [
        ...prev,
        ...acceptedFiles.map((file) => Object.assign(file, { preview: URL.createObjectURL(file) })),
      ]);
    }
    if (rejectedFiles?.length) {
      rejectedFiles.forEach((rej, index) => {
        const id = Date.now() + index;
        setRejected((prev) => [...prev, { id, file: rej.file, errors: rej.errors }]);
        setTimeout(() => setRejected((prev) => prev.filter((r) => r.id !== id)), AUTO_CLEAR_REJECT_MS);
      });
    }
  }, [setFiles, setRejected]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: { "image/*": [] },
    maxSize: 1024 * 1000000,
    onDrop,
    noClick: true,
  });

  const removeFile = (name) =>
    setFiles((f) => {
      const target = f.find((file) => file.name === name);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return f.filter((file) => file.name !== name);
    });

  const isCreate = variant === "create";
  const empty = files.length === 0;

  return (
    <div
      {...getRootProps()}
      className={`${isCreate && empty ? "flex h-full min-h-0 flex-1 flex-col" : "h-fit"} ${className}`}
    >
      <input {...getInputProps()} />

      {empty ? (
        isCreate ? (
          <div
            className={`flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 transition-colors ${
              isDragActive ? "bg-stone-50" : "bg-white"
            }`}
          >
            <CreateMediaIcons />
            <p className="text-xl font-light text-stone-900">
              {isDragActive ? "Drop photos here" : "Drag photos and videos here"}
            </p>
            <Button
              variant="solid"
              size="sm"
              onPress={open}
              className="mt-3 rounded-lg bg-[#0095f6] px-4 text-sm font-semibold text-white hover:bg-[#1877f2]"
            >
              Select from computer
            </Button>
          </div>
        ) : (
          <div
            className={`mb-6 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors ${
              isDragActive ? "border-stone-400 bg-white" : "border-stone-200 bg-white"
            }`}
          >
            <CopyDocumentIcon />
            <p className="text-sm text-stone-400">
              {isDragActive ? "Drop files here..." : "Drag & drop files here"}
            </p>
            <Button
              variant="solid"
              size="sm"
              onPress={open}
              className="mt-1 rounded-lg bg-stone-800 px-4 text-xs text-white hover:bg-stone-700"
            >
              Select from computer
            </Button>
          </div>
        )
      ) : isCreate ? null : (
        <div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {files.map((file) => (
              <li
                key={file.name}
                className="relative h-28 overflow-hidden rounded-xl border border-stone-200/60 shadow-sm"
              >
                <Image
                  src={file.preview}
                  alt={file.name}
                  width={100}
                  height={100}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile(file.name)}
                  className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white transition-colors hover:bg-black/80"
                >
                  ×
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-2 py-1.5">
                  <p className="truncate text-xs text-white/80">{file.name}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <Button
              variant="solid"
              size="sm"
              onPress={open}
              className="rounded-lg bg-stone-800 px-4 text-xs text-white hover:bg-stone-700"
            >
              Add more
            </Button>
          </div>
        </div>
      )}

      <div className="fixed bottom-6 right-6 z-50 max-w-xs">
        {rejected.map(({ id, file, errors }) => (
          <div
            key={id}
            className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 shadow-md"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="text-sm font-medium text-red-700">{file.name}</div>
                <div className="mt-0.5 text-xs text-red-500">
                  {errors.map((e) => e.message).join(", ")}
                </div>
              </div>
              <button
                onClick={() => setRejected((prev) => prev.filter((r) => r.id !== id))}
                className="text-base leading-none text-red-400 hover:text-red-600"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dropzone;
