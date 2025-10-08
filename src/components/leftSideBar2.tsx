"use client";
import React, { SVGProps} from "react";
import { Button, Card, CardBody, Tab, Tabs } from "@heroui/react";

export const AccountIcon = () => {
    return (
 

<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-4">
  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
</svg>


      
    );
  };

  export const UserIcon = () => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-4">
  <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
</svg>

    );
  };

export default function leftSideBar() {


    return (
            <div className="pt-24 pb-8 px-8 lg:h-screen lg:w-[30vw] flex flex-col  lg:items-end z-12 left-0  bottom-0 fixed  lg:top-0 transition-opacity duration-500">
                <div className="flex flex-col w-64 h-full bg-white items-end justify-between rounded-2xl shadow-lg p-4">
                  <div className="flex flex-col w-full gap-4">
                    <p>Albums</p>
                    <Tabs isVertical aria-label="Options" fullWidth size="md" variant="light"
                      classNames={{
                        tab: "justify-start ",
                      }}
                    >
                      <Tab 
                      key="photos" 
                      title={
                        <div className="flex w-full  items-center justify-start space-x-2">
                          <UserIcon />
                          <span>Edit profile</span>
                        </div>
                      }
                      >
                        
                      </Tab>
                      <Tab key="music" title={<div className="flex w-full  items-center justify-start space-x-2">
                          <AccountIcon />
                          <span>Account Settings</span>
                          </div>}
                      >
                        
                      </Tab>

                    </Tabs>         
                  </div>
                    
                </div>
            </div>
    );
}
