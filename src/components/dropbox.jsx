// Dropzone.jsx
"use client";

import { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Button } from "@heroui/react";

export const CopyDocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-14 text-stone-300">
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
);

const Dropzone = ({ files, setFiles, rejected, setRejected, className }) => {
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

  useEffect(() => {
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [files]);

  const removeFile = (name) => setFiles((f) => f.filter((file) => file.name !== name));

  return (
    <div {...getRootProps()} className="h-fit">
      {/* Drop zone */}
      <div
        className={`mb-6 rounded-xl border-2 border-dashed transition-colors p-8 flex flex-col items-center justify-center gap-3
          ${isDragActive ? "border-stone-400 bg-white" : "border-stone-200 bg-white"}`}
      >
        <input {...getInputProps()} />
        <CopyDocumentIcon />
        <p className="text-sm text-stone-400">
          {isDragActive ? "Drop files here..." : "Drag & drop files here"}
        </p>
        {/* HeroUI v3 Button */}
        <Button
          variant="solid"
          size="sm"
          onPress={open}
          className="bg-stone-800 hover:bg-stone-700 text-white text-xs tracking-[0.1em] uppercase rounded-lg px-4 mt-1"
        >
          Select from computer
        </Button>
      </div>

      {/* Accepted files */}
      {files.length > 0 && (
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {files.map((file) => (
            <li key={file.name} className="relative h-28 rounded-xl overflow-hidden border border-stone-200/60 shadow-sm">
              <Image src={file.preview} alt={file.name} width={100} height={100} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeFile(file.name)}
                className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center text-xs hover:bg-black/80 transition-colors"
              >
                ×
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-2 py-1.5">
                <p className="text-[10px] text-white/80 truncate">{file.name}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Rejected files toast */}
      <div className="fixed bottom-6 right-6 max-w-xs z-50">
        {rejected.map(({ id, file, errors }) => (
          <div key={id} className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 shadow-md" role="status" aria-live="polite">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="text-sm font-medium text-red-700">{file.name}</div>
                <div className="text-xs text-red-500 mt-0.5">{errors.map((e) => e.message).join(", ")}</div>
              </div>
              <button onClick={() => setRejected((prev) => prev.filter((r) => r.id !== id))} className="text-red-400 hover:text-red-600 text-base leading-none">×</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dropzone;