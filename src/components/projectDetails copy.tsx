"use client";

import { Listbox, ListboxSection, ListboxItem } from "@heroui/react";


export default function ProjectDetails() {

    return (
            <div className="pt-24 pb-8 px-8 lg:h-screen max-lg:border-t-1 max-lg:border-t-default-300 lg:w-[20vw] flex flex-col items-center lg:justify-center z-40 left-0  top-0 fixed  lg:top-0 transition-opacity duration-500">
                <div className="flex flex-col w-full h-full ">
                    <div className="flex flex-col w-full">
                        <div className="bg-white h-fit rounded-lg w-full text-sm filter drop-shadow-xl" >

                            <Listbox selectionMode="single" >
                                <ListboxSection showDivider title="Album">
                                    <ListboxItem key="Albums">Work</ListboxItem>
                                    <ListboxItem key="Albums2">Explore</ListboxItem>
                                    <ListboxItem key="Albu3ms">Profile</ListboxItem>
                                </ListboxSection>
                                
                                
                            </Listbox>

                            
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 max-lg:pt-4 max-lg:pb-4 ">
                        

                    </div>
                    <p className="text-xs mt-auto">Designed & built by @neillouis3 for Sophia</p>
                </div>
            </div>
    );
}
