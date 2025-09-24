// Dropzone.tsx
"use client";

import { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Button } from "@heroui/react";


export const CopyDocumentIcon = (props) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-16">
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>

  );
};

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
    <div {...getRootProps()} className="h-fit">
      <div className="mb-8">
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center  ">
          <CopyDocumentIcon />
          {isDragActive ? <p>Drop files here...</p> 
          : 
          <p className="text-default-500">Drag & drop files here</p>}
        </div>
      </div>
      <div className="w-full flex justify-center">
      <Button color="primary" size="sm" onPress={open} >Select from computer</Button>

      </div>
      
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
