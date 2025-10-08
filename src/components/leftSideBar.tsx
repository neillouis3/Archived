"use client";
import React, { SVGProps} from "react";
import { Avatar, Accordion, AccordionItem, Button } from "@heroui/react";
import { Image } from "@heroui/react";

export const SearchIcon = (props: SVGProps<SVGSVGElement>) => {
    return (
      <svg
        aria-hidden="true"
        fill="none"
        focusable="false"
        height="1em"
        role="presentation"
        viewBox="0 0 24 24"
        width="1em"
        {...props}
      >
        <path
          d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
        <path
          d="M22 22L20 20"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    );
  };

export default function leftSideBar({ imageUrl, username, fullName }: { imageUrl?: string; username?: string; fullName?: string } = {}) {
    const resolvedImageUrl = imageUrl ?? "https://i.pravatar.cc/150?u=placeholder";

    return (
            <div className="pt-24 pb-8 px-8 lg:h-screen max-lg:border-t-1 max-lg:border-t-default-300 lg:w-[30vw] flex flex-col items-center lg:justify-end z-1 left-0  bottom-0 fixed  lg:top-0 transition-opacity duration-500">
                <div className="flex flex-col w-full h-full items-end justify-between ">
                    <div className="flex flex-col h-full gap-4">
                        <div className="bg-white dark:bg-[#27272a] w-64 h-full py-6 rounded-lg gap-4 flex flex-col shadow-md">

                            <div className="px-6">
                                <div className=" mb-2">
                                    
                                        <Avatar size="lg" isBordered color="default" src={resolvedImageUrl} />
                                    
                                </div>
                                
                                <p className="font-semibold text-lg">{fullName}</p>
                                <p className="text-sm text-default-400 -mt-1 mb-2">@{username}</p>

                                <p className="text-sm">Computer Engineering at Memorial University</p>

                                <div className="flex flex-col justify-center items-center bg-[#f4f4f5] mt-4 -mx-2 px-2 py-2 rounded-lg h-fit gap-2">

                                  <div className="flex flex-row justify-between items-center w-full">
                                    <p className="text-sm text-default-400"><span className="font-bold text-default-700">202</span> posts</p>
                                    <p className="text-sm text-default-400"><span className="font-bold text-default-700">202</span> followers</p>
                                    <p className="text-sm text-default-400"><span className="font-bold text-default-700">202</span> following</p>

                                  </div>


                                </div>
                            </div>

                            
                            <div className="w-full px-4 mt-4">
                              <Accordion defaultExpandedKeys={["1"]} itemClasses={{title: "text-sm"}} variant="light">
                                <AccordionItem key="1" title="Milestones">
                                  <div className="columns-2 gap-2 items-center w-full text-xs h-fit" >
                                    <div className="bg-default-200 mb-2 rounded-lg w-full aspect-square">
                                      <Image src="/images/album1.jpg" alt="album1" radius="md" isZoomed classNames={{img: "aspect-square object-cover"}} />
                                    </div>
                                    <div className="bg-default-200 mb-2 rounded-lg w-full aspect-square">
                                      <Image src="/images/album2.jpg" alt="album1" radius="md" isZoomed classNames={{img: "aspect-square object-cover"}} />
                                    </div>
                                    <div className="bg-default-200 mb-2 rounded-lg  w-full aspect-square">
                                      <Image src="/images/album3.jpg" alt="album1" radius="md" isZoomed classNames={{img: "aspect-square object-cover"}} />
                                    </div>
                                    <div className="bg-default-200 mb-2 rounded-lg  w-full aspect-square">
                                      <Image src="/images/album4.jpg" alt="album1" radius="md" isZoomed classNames={{img: "aspect-square object-cover"}} />
                                    </div>

                                    
                                  </div>
                                  <div className="flex justify-end">
                                    <Button size="sm" color="primary" variant="light">View all</Button>
                                  </div>
                                </AccordionItem>
                                <AccordionItem key="2" title="Milestones">
                                  <div className="columns-3 gap-2 items-center w-full text-xs" >
                                    <div className="bg-default-200 mb-2 rounded-lg w-16 h-16">
                                      <Image src="/images/album1.jpg" alt="album1" width={40} height={40} />
                                    </div>
                                    <div className="bg-default-200 mb-2 rounded-lg w-16 h-16">
                                      <Image src="/images/album1.jpg" alt="album1" width={40} height={40} />
                                    </div>
                                    <div className="bg-default-200 mb-2 rounded-lg w-16 h-16">
                                      <Image src="/images/album1.jpg" alt="album1" width={40} height={40} />
                                    </div>
                                    <div className="bg-default-200 mb-2 rounded-lg w-16 h-16">
                                      <Image src="/images/album1.jpg" alt="album1" width={40} height={40} />
                                    </div>
                                    <div className="bg-default-200 mb-2 rounded-lg w-16 h-16">
                                      <Image src="/images/album1.jpg" alt="album1" width={40} height={40} />
                                    </div>
                                    <div className="bg-default-200 mb-2 rounded-lg w-16 h-16">
                                      <Image src="/images/album1.jpg" alt="album1" width={40} height={40} />
                                    </div>
                                    <div className="bg-default-200 mb-2 rounded-lg w-16 h-16">
                                      <Image src="/images/album1.jpg" alt="album1" width={40} height={40} />
                                    </div>
                                    <div className="bg-default-200 mb-2 rounded-lg w-16 h-16">
                                      <Image src="/images/album1.jpg" alt="album1" width={40} height={40} />
                                    </div>
                                    <div className="bg-default-200 mb-2 rounded-lg w-16 h-16">
                                      <Image src="/images/album1.jpg" alt="album1" width={40} height={40} />
                                    </div>
                                    
                                  </div>
                                </AccordionItem>
                              </Accordion>
                            </div>
                        </div>
                        {/* <div className="bg-white w-64  rounded-lg flex flex-col">
                            <div className="p-4 text-xs">
                                202 followers
                            </div>
                        </div> */}
                        
                    </div>

                    
                </div>
            </div>
    );
}
