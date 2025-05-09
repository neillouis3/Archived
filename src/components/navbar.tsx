"use client";
import {Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button, Avatar} from "@heroui/react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { ThemeSwitcher } from "./themeSwitch";




export default function NavBar() {
  return (
    <Navbar maxWidth="2xl" shouldHideOnScroll={true} disableAnimation={true} >      
      <NavbarContent justify="start">
       <NavbarItem>
          <ThemeSwitcher />
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        
        <NavbarItem>
          <Avatar size="md" isBordered color="default" src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
          
        </NavbarItem>

      </NavbarContent>
    </Navbar>
  );
}
