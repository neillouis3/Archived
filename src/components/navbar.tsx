"use client";
import {Navbar, NavbarContent, NavbarItem} from "@heroui/react";
import ProfileIcon from "./profileIcon";
import AddPostModal from "./addPostModal";





export default function NavBar() {
  return (
    <Navbar maxWidth="2xl" shouldHideOnScroll={true} disableAnimation={true} >      

      <NavbarContent justify="center">
        
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
