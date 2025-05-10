import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure,
  } from "@heroui/react";
  
  export default function AddPostModal() {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
  
    return (
      <>
        <Button onPress={onOpen}>Add post</Button>
        <Modal isOpen={isOpen} size="3xl"onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Add milestone</ModalHeader>
                <ModalBody>

                  <div className="flex flex-row gap-4">
                    <div className="flex-1/2">
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pulvinar risus non
                            risus hendrerit venenatis. Pellentesque sit amet hendrerit risus, sed porttitor
                            quam.
                        </p>
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pulvinar risus non
                            risus hendrerit venenatis. Pellentesque sit amet hendrerit risus, sed porttitor
                            quam.
                        </p>
                        <p>
                            Magna exercitation reprehenderit magna aute tempor cupidatat consequat elit dolor
                            adipisicing. Mollit dolor eiusmod sunt ex incididunt cillum quis. Velit duis sit
                            officia eiusmod Lorem aliqua enim laboris do dolor eiusmod. Et mollit incididunt
                            nisi consectetur esse laborum eiusmod pariatur proident Lorem eiusmod et. Culpa
                            deserunt nostrud ad veniam.
                        </p>
                    </div>
                    <div className="flex-1/2">


                  </div>
                </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Close
                  </Button>
                  <Button color="primary" onPress={onClose}>
                    Action
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    );
  }
  