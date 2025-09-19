"use client";
import React, { SVGProps} from "react";
import { Button, Listbox, ListboxSection, ListboxItem, Input, Image, Avatar } from "@heroui/react";

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

export default function RightSideBar({ imageUrl, username, fullName }: { imageUrl?: string; username?: string; fullName?: string } = {}) {
    const resolvedImageUrl = imageUrl ?? "https://i.pravatar.cc/150?u=placeholder";

    return (
            <div className="pt-24 pb-8 px-8 lg:h-screen max-lg:border-t-1 max-lg:border-t-default-300 lg:w-[30vw] flex flex-col items-center lg:justify-end z-1 right-0  top-0 fixed  lg:top-0 transition-opacity duration-500">
                <div className="flex flex-col w-full h-full items-start justify-between">
                    <div className="flex flex-col gap-4">
                        
                        <div className="bg-white h-fit rounded-lg w-64 text-sm shadow-md p-1" >
                            <div className="px-3 pt-3">
                                <Input 
                                    size="sm"
                                    placeholder="Search"
                                    radius="lg"
                                    startContent={
                                        <SearchIcon className="text-black/50 mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none shrink-0" />
                                    }
                                />
                            </div>
                            <Listbox>
                                
                                <ListboxItem key="Albums">Friends</ListboxItem>
                                <ListboxItem key="Albums2">Explore</ListboxItem>
                                <ListboxItem key="Albu3ms">Following</ListboxItem>
                                
                                
                                
                            </Listbox>

                            
                        </div>
                    </div>

                    <p className="text-xs mt-auto">Designed & built by @neillouis3 for Sophia</p>
                </div>
            </div>
    );
}
