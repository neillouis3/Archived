"use client"
import React, { useState } from "react";
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Button, useDisclosure, User, Input, Textarea,
} from "@heroui/react";
import Dropzone from "@components/dropbox";
import { uploadFiles } from "@components/uploadFiles";
import { useUser } from "@clerk/nextjs";
import { PlusIcon } from "./icons"; // adjust imports

export default function AddPostModal({
  imageUrl,
  username,
  fullName,
}: {
  imageUrl?: string;
  username?: string;
  fullName?: string;
} = {}) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const {user} = useUser();


  const resolvedClerkId = user?.id ?? "none";
  const resolvedImageUrl = imageUrl ?? "https://i.pravatar.cc/150?u=placeholder";
  const resolvedUsername = username ? `@${username}` : "@username";
  const resolvedFullName = fullName ?? "Your Name";
  


  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [rejected, setRejected] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handlePost = async () => {

    setLoading(true);

    try {
      // 1️⃣ Upload files to UploadThing
      let mediaUrls: string[] = [];
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));
        mediaUrls = await uploadFiles(formData); // ufsUrl array
        console.log("Uploaded media URLs:", mediaUrls);
      }

      // 2️⃣ Create the post via API
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorClerkId: resolvedClerkId,
          username: resolvedUsername,
          avatarUrl: resolvedImageUrl,
          title: title,
          body: description,
          media: mediaUrls,
          visibility: "public",
        }),
      });
      
      if (!res.ok) {
        const text = await res.text(); // log raw response
        console.error("API error response:", text);
        throw new Error(`Failed to create post: ${res.status}`);
      }
      
      const newPost = await res.json();
      console.log("Post created:", newPost);


      // 3️⃣ Reset form
      setFiles([]);
     
      onClose();

      alert("Post created successfully!");
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onPress={onOpen} isIconOnly color="primary" size="sm">
        <PlusIcon />
      </Button>

      <Modal isOpen={isOpen} size="5xl" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Post milestones</ModalHeader>
              <ModalBody>
                <div className="flex flex-row gap-4 h-fit">
                  <div className="flex-2/3 h-64 flex justify-center items-center ">
                    <Dropzone
                      files={files}
                      setFiles={setFiles}
                      rejected={rejected}
                      setRejected={setRejected}
                      className="w-full h-96"
                    />
                  </div>
                  <div className="flex-1/3 flex flex-col ">
                    <div className="w-full">
                      <User
                        avatarProps={{ src: resolvedImageUrl }}
                        description={resolvedUsername}
                        name={resolvedFullName}
                      />
                    </div>
                   

                    <Input
                      className="mt-4"
                      size="sm"
                      placeholder='"A title for your milestone"'
                      type="text"
                      variant="flat"
                      label="Title"
                      isRequired
                      value={title}
                      onValueChange={setTitle}

                      
                    />
                    <Textarea
                      className="mt-2 max-w-xs"
                      placeholder='"Describe what the milestone is about"'
                      maxRows={5}
                      value={description}
                      label="Description"
                      isRequired
                      onValueChange={setDescription}

                      
                    />
                    {/* <Input
                      className="mt-2"
                      size="sm"
                      placeholder="Add location"
                      type="text"
                      variant="flat"
                      endContent={<MailIcon />}

                      
                    />
                    <Input
                      className="mt-2"
                      size="sm"
                      placeholder="Add tags"
                      type="text"
                      variant="flat"
                      endContent={<div className="text-default-400 mr-1">#</div>}
                      
                    /> */}
                    
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button className="text-zinc-400" variant="light" onPress={onClose}>
                  Save to drafts
                </Button>
                <Button
                  variant="solid"
                  color="primary"
                  onPress={handlePost}
                  disabled={loading}
                >
                  {loading ? "Posting..." : "Post"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
