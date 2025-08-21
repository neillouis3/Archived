"use client";
import {Link, Navbar, NavbarContent, NavbarItem, NavbarBrand} from "@heroui/react";
import ProfileIcon from "./profileIcon";
import AddPostModal from "./addPostModal";
import { useUser } from "@clerk/nextjs";
import NotificationIcon from "./notification";





export default function NavBar() {

  const { user } = useUser();
  
  return (
    <Navbar maxWidth="2xl" shouldHideOnScroll={true} disableAnimation={true} > 
      <NavbarBrand>
        <Link href="/home">
          <h1 className="text-2xl font-bold text-gray-500">milestones</h1>
        </Link>
      </NavbarBrand>

      <NavbarContent justify="center">
        <NavbarItem>
          <AddPostModal username={user?.username ?? undefined} fullName={user?.fullName ?? undefined} imageUrl={user?.imageUrl ?? undefined} />
          
        </NavbarItem>

      </NavbarContent>
      <NavbarContent justify="end">
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
