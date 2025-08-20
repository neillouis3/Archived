"use client";
import {Link, Navbar, NavbarContent, NavbarItem} from "@heroui/react";
import ProfileIcon from "./profileIcon";
import AddPostModal from "./addPostModal";





export default function NavBar() {
  return (
    <Navbar maxWidth="2xl" shouldHideOnScroll={true} disableAnimation={true} >      

      <NavbarContent justify="center">
        <NavbarItem>
          <Link href="/home">
          <h1 className="text-2xl font-bold text-gray-500">milestones</h1>
          </Link>
        </NavbarItem>
        <NavbarItem>
          <AddPostModal />
          
        </NavbarItem>

      </NavbarContent>
      <NavbarContent justify="end">
        
        <NavbarItem>
          <ProfileIcon />  
          
        </NavbarItem>

      </NavbarContent>
    </Navbar>
  );
}
