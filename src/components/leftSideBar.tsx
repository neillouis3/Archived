"use client";
import React, { SVGProps} from "react";
import { Avatar, Accordion, AccordionItem, Button, Chip, Link } from "@heroui/react";
import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem} from "@heroui/react";

import { Image } from "@heroui/react";
import AddPostModal from "./addPostModal";

export const SearchIcon = (props: SVGProps<SVGSVGElement>) => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
  <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" />
</svg>

    );
  };

  export const LinkIcon = (props: SVGProps<SVGSVGElement>) => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
  <path fillRule="evenodd" d="M19.902 4.098a3.75 3.75 0 0 0-5.304 0l-4.5 4.5a3.75 3.75 0 0 0 1.035 6.037.75.75 0 0 1-.646 1.353 5.25 5.25 0 0 1-1.449-8.45l4.5-4.5a5.25 5.25 0 1 1 7.424 7.424l-1.757 1.757a.75.75 0 1 1-1.06-1.06l1.757-1.757a3.75 3.75 0 0 0 0-5.304Zm-7.389 4.267a.75.75 0 0 1 1-.353 5.25 5.25 0 0 1 1.449 8.45l-4.5 4.5a5.25 5.25 0 1 1-7.424-7.424l1.757-1.757a.75.75 0 1 1 1.06 1.06l-1.757 1.757a3.75 3.75 0 1 0 5.304 5.304l4.5-4.5a3.75 3.75 0 0 0-1.035-6.037.75.75 0 0 1-.354-1Z" clipRule="evenodd" />
</svg>


    );
  };


  


export default function leftSideBar({ imageUrl, username, fullName, bio }: { imageUrl?: string; username?: string; fullName?: string; bio?: string } = {}) {
    const resolvedImageUrl = imageUrl ?? "https://i.pravatar.cc/150?u=placeholder";

    return (
            <div className="pt-20 pb-4 px-4 lg:h-screen max-lg:border-t-1 max-lg:border-t-default-300 lg:w-[30vw]  flex flex-col items-center lg:justify-end z-1 left-0  bottom-0 fixed  lg:top-0 transition-opacity duration-500">
                <div className="flex flex-col w-full h-full  justify-between ">
                    <div className="flex flex-col h-full gap-4">
                        <div className="bg-midground w-64 h-full py-6 rounded-xl gap-4 flex flex-col ">
                            <div className="px-6">
                                <div className=" mb-2">
                                        <Avatar size="lg" isBordered color="default" src={resolvedImageUrl} />
                                </div>
                                
                                <p className="font-semibold text-lg">{fullName}</p>
                                <p className="text-sm text-default-400 -mt-1 mb-2">@{username}</p>
                                <div className="flex flex-row flex-wrap gap-1 mb-2 ">
                                  {/* <Chip size="sm" color="primary" variant="flat">Organization</Chip> */}
                                  <div className="flex flex-row gap-1 items-center">
                                    <LinkIcon />
                                    <Link size="sm" href="www.example.com" isExternal >www.example.com</Link>
                                  </div>
                                </div>
                                
                                {/* <p className="text-sm">{bio}</p> */}
                                {/* <div className="flex flex-col   mt-2 -mx-2 px-2 py-2 rounded-lg h-fit gap-2">
                                  <p className="text-sm">{bio}</p>
                                </div> */}

                                {/* <div className="flex flex-col justify-center items-center  mt-4 -mx-2 px-2 py-2 rounded-lg h-fit gap-2">
                                  <div className="flex flex-row justify-between items-center w-full">
                                    <p className="text-sm text-default-400"><span className="font-bold text-default-700">202</span> posts</p>
                                    <p className="text-sm text-default-400"><span className="font-bold text-default-700">202</span> followers</p>
                                    <p className="text-sm text-default-400"><span className="font-bold text-default-700">202</span> following</p>
                                  </div>
                                </div> */}
                            </div>
                            <div className="w-full px-4 mt-24 flex flex-col justify-between h-full ">
                              <div className="">
                                <AddPostModal username={username ?? undefined} fullName={fullName ?? undefined} imageUrl={imageUrl ?? undefined}/>
                              </div>
                              
                              <div className="">
                                <Accordion defaultExpandedKeys={["1"]} itemClasses={{title: "text-sm", subtitle: "text-xs"}} variant="light">
                                  <AccordionItem key="1" title="Collections" subtitle="Your milestones">
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
                                
                                </Accordion>
                              </div>
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
