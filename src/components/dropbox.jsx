// Dropzone.tsx
"use client";

import { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";

const Dropzone = ({ files, setFiles, rejected, setRejected, className }) => {
  const AUTO_CLEAR_REJECT_MS = 4500;

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (acceptedFiles?.length) {
      setFiles((prev) => [
        ...prev,
        ...acceptedFiles.map((file) =>
          Object.assign(file, { preview: URL.createObjectURL(file) })
        ),
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
    <div>
      <div {...getRootProps({ className })}>
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-4 py-8 border-2 border-dashed rounded-md">
          {isDragActive ? <p>Drop files here...</p> : <p>Drag & drop files here</p>}
        </div>
      </div>

      <button type="button" onClick={open} className="inline-flex items-center px-4 py-2 rounded-md border bg-secondary-400 text-white hover:bg-secondary-500 transition">Upload files</button>

      {/* Accepted files */}
      <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {files.map((file) => (
          <li key={file.name} className="relative h-32 rounded-md shadow p-2">
            <Image src={file.preview} alt={file.name} width={100} height={100} className="h-full w-full object-contain rounded-md" />
            <button
              type="button"
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
              onClick={() => removeFile(file.name)}
            >
              ×
            </button>
            <p className="mt-2 text-xs text-neutral-500">{file.name}</p>
          </li>
        ))}
      </ul>

      {/* Rejected files */}
      <div className="fixed bottom-6 right-6 max-w-xs z-50">
        {rejected.map(({ id, file, errors }) => (
          <div key={id} className="mb-3 rounded-md border border-red-200 bg-red-50 p-3 shadow" role="status" aria-live="polite">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="text-sm font-medium text-red-700">{file.name}</div>
                <div className="text-xs text-red-600">{errors.map((e) => e.message).join(", ")}</div>
              </div>
              <button
                onClick={() => setRejected((prev) => prev.filter((r) => r.id !== id))}
                aria-label="Dismiss"
                className="text-red-500 text-sm"
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
