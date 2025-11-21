"use client";
import {Navbar, NavbarContent, NavbarItem, NavbarBrand, Input} from "@heroui/react";
import ProfileIcon from "./profileIcon";
import { useUser } from "@clerk/nextjs";
import NotificationIcon from "./notification";
import { SVGProps } from "react";

export const SearchIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" {...props}>
  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
</svg>
  );
};




export default function NavBar() {

  const { user } = useUser();
  
  return (
    <Navbar maxWidth="full" isBlurred={false}  disableAnimation={true} isBordered classNames={{base: "bg-background"}}> 
      <NavbarBrand>
        <div onClick={() => window.location.href = "/home"} className="cursor-pointer">
          <h1 className="text-2xl font-bold text-gray-500">milestones</h1>
        </div>
      </NavbarBrand>

      <NavbarContent justify="end">
        <NavbarItem>
          <Input
            classNames={{
              base: "max-w-full sm:max-w-[10rem] h-8",
              mainWrapper: "h-full",
              input: "text-xs",
              inputWrapper:
                "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
            }}
            placeholder="Type to search..."
            size="sm"
            startContent={<SearchIcon />}
            type="search"
          />
        </NavbarItem>
     
        <NavbarItem>
          <NotificationIcon/>
        </NavbarItem>
        <NavbarItem>
          <ProfileIcon imageUrl={user?.imageUrl ?? undefined} />  
          
        </NavbarItem>

      </NavbarContent>
    </Navbar>
  );
}
