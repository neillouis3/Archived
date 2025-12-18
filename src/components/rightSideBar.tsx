"use client";
import React, { SVGProps} from "react";
import AddPostModal from '@components/addPostModal'
import { Avatar, Button, Link, Listbox, ListboxItem } from "@heroui/react";
import Image from "next/image";
import { PlusIcon } from "./icons";

export const SearchIcon = (props: SVGProps<SVGSVGElement>) => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5" {...props}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
</svg>
    )}
    export const SearchIcon1 = (props: SVGProps<SVGSVGElement>) => {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
</svg>

      )}
      export const SearchIcon2 = (props: SVGProps<SVGSVGElement>) => {
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
</svg>

        )}

export default function RightSideBar() {


    return (
            <div className="pt-20 pb-8 px-4 lg:h-screen max-lg:border-t-1 max-lg:border-t-default-300  flex flex-col items-center lg:justify-end z-1 right-0  top-0 fixed  lg:top-0 transition-opacity duration-500">
                <div className="flex flex-col w-full h-full items-start justify-between">
                    <div className="flex flex-col  w-64 h-full ">
                        
                        <div className="bg-midground h-fit rounded-lg text-sm p-1 mb-4" >
                            
                            <Listbox >
                                
                                <ListboxItem  key="Albums" startContent={<SearchIcon />}>Friends</ListboxItem>
                                <ListboxItem key="Albums2" startContent={<SearchIcon1 />}>Explore</ListboxItem>
                                <ListboxItem key="Albu3ms" startContent={<SearchIcon2 />}>Following</ListboxItem>
                                
                                
                                
                            </Listbox>

                            
                        </div>

                        
                        <div className="bg-midground h-full rounded-lg w-full text-sm  p-4" >
                            <p className="text-xs text-default-400">What's happening</p>
                            <div className="flex flex-col gap-4 mt-4">
                              <div className="flex flex-row justify-between items-center">
                                <div className="flex flex-row items-center gap-2">
                                  <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="album1"  />
                                  <p className="text-sm">John Doe</p>
                                </div>
                                
                                <Button isIconOnly color="primary" variant="light" size="sm">
                                  <PlusIcon />
                                </Button>
                              </div>
                              <div className="flex flex-row justify-between items-center">
                                <div className="flex flex-row items-center gap-2">
                                  <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="album1"   />
                                  <p className="text-sm">John Doe</p>
                                </div>
                                
                                <Button isIconOnly color="primary" variant="light" size="sm">
                                  <PlusIcon />
                                </Button>
                              </div>
                              <div className="flex flex-row justify-between items-center">
                                <div className="flex flex-row items-center gap-2">
                                  <Avatar src="https://i.pravatar.cc/150?u=a04258114e29026702d" alt="album1"  />
                                  <p className="text-sm">John Doe</p>
                                </div>
                                
                                <Button isIconOnly color="primary" variant="light" size="sm">
                                  <PlusIcon />
                                </Button>
                              </div>

                            </div>
                        </div>
                        <p className="text-xs mt-4">About • Privacy • Terms • Policies • Accessibility</p>
                    <p className="text-xs mt-1 ">Designed & built by <Link size="sm" className="text-xs hover:cursor-pointer">@neillouis3</Link> for Sophia</p>
                   
                    </div>


                </div>
            </div>
    );
}
