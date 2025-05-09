"use client";
import {Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button} from "@heroui/react";
import ProfileIcon from "./profileIcon";
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
          <ProfileIcon />  
          
        </NavbarItem>

      </NavbarContent>
    </Navbar>
  );
}
