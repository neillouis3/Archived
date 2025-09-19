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

export default function leftSideBar({ imageUrl, username, fullName }: { imageUrl?: string; username?: string; fullName?: string } = {}) {
    const resolvedImageUrl = imageUrl ?? "https://i.pravatar.cc/150?u=placeholder";

    return (
            <div className="pt-24 pb-8 px-8 lg:h-screen max-lg:border-t-1 max-lg:border-t-default-300 lg:w-[30vw] flex flex-col items-center lg:justify-end z-1 left-0  bottom-0 fixed  lg:top-0 transition-opacity duration-500">
                <div className="flex flex-col w-full h-full items-end justify-between ">
                    <div className="flex flex-col gap-4">
                        <div className="bg-white w-64 h-64 rounded-lg gap-4 flex flex-col shadow-md">
                            <div className="bg-primary w-full flex-2 rounded-t-lg">

                            </div>
                            <div className="p-4 flex-4">
                                <div className="-mt-11 mb-2">
                                    <Button isIconOnly size="undefined" variant="bordered" radius="full">
                                        <Avatar size="lg" isBordered color="default" src={resolvedImageUrl} />
                                    </Button>
                                </div>
                                
                                <p className="font-semibold text-lg">{fullName}</p>
                                <p className="text-xs text-default-400 -mt-1 mb-2">@{username}</p>

                                <p className="text-xs">Computer Engineering at Memorial University</p>
                            </div>
                        </div>
                        <div className="bg-white w-64  rounded-lg flex flex-col">
                            <div className="p-4 text-xs">
                                202 followers
                            </div>
                        </div>
                        
                    </div>

                    
                </div>
            </div>
    );
}
