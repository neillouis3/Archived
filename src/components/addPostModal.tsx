"use client";

import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure,
    User,
    Input,
  } from "@heroui/react";

import {Select, SelectSection, SelectItem} from "@heroui/react";

import { UploadDropzone } from "@/utils/uploadThing";
import {Textarea} from "@heroui/react";

import "@uploadthing/react/styles.css";


export const MailIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-5 text-default-400">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>


  );
};

export const TagIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-5 text-default-400">
    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>


  );
};


  export default function AddPostModal() {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
  
    return (
      <>
        <Button onPress={onOpen}>Add post</Button>
        <Modal isOpen={isOpen} size="5xl" onOpenChange={onOpenChange}         
>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Add milestone</ModalHeader>
                <ModalBody>

                  <div className="flex flex-row gap-4">
                    <div className="flex-2/3">
                      <UploadDropzone 
                        endpoint="imageUploader" 
                        onClientUploadComplete={(res) => {
                          // Do something with the response
                          console.log("Files: ", res);
                          alert("Upload Completed");
                        }}
                        onUploadError={(error: Error) => {
                          // Do something with the error.
                          alert(`ERROR! ${error.message}`);
                        }}
                        appearance={{
                          button: "hidden",
                        }}
 

                      />
                    </div>
                    <div className="flex-1/3 flex flex-col">
                      <div>
                        <User
                          avatarProps={{
                            src: "https://avatars.githubusercontent.com/u/30373425?v=4",
                          }}
                          description={
                            "@jrgarciadev"
                          }
                          name="Junior Garcia"
                        />
                      </div>
                      
                      <div className="mt-4">
                        <Textarea className="max-w-xs"  placeholder="Enter your description" maxRows={5}/>
                      </div>
                      <div className="mt-2">
                        <Input size="sm"  placeholder="Add location" type="text" variant="flat" endContent={<MailIcon/>} />
                      </div>
                      <div className="mt-2">
                        <Input size="sm"  placeholder="Add tags" type="text" variant="flat" endContent={<TagIcon/>} />
                      </div>
                      <div className="mt-2">
                         <Select
                           className="max-w-xs"
                           label="milestone"
                           labelPlacement="outside"
                           placeholder="Add to album"
                           selectionMode="multiple"
                         >
                           <SelectItem key="1">Monthsary</SelectItem>
                           <SelectItem key="2">Sophia</SelectItem>
                           <SelectItem key="3">Work</SelectItem>
                           <SelectItem key="4">Weight Loss</SelectItem>
                         </Select>
                       </div>
                    </div>
                    
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button className="text-zinc-400" variant="light" onPress={onClose}>
                    Save to drafts
                  </Button>
                  <Button color="primary" onPress={onClose} >
                    Post
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    );
  }
  