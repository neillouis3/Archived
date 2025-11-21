"use client";

import {Image} from "@heroui/react";
import { SignIn, useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";


export default function Home() {
  const { user } = useUser();

  if (user) {
    redirect('/home');
  }

  return (


    <div className="flex flex-row w-full items-center justify-center h-full  gap-16">
      <div className="flex flex-col w-full h-full justify-center items-center py-24 gap-16 ">
        <div className="w-full flex justify-center">
          <Image
            alt="HeroUI hero Image"
            src="/logo.jpg"
            width={250}
          />
        </div>
        <div className="flex justify-center w-full text-foreground px-16">
          <p>Welcome to Milestones! This is a demo of the app.</p>
        </div>
        
      </div>
      <div className="flex flex-row gap-4">
          <SignIn />
      </div>
      
    </div>
  );
}
