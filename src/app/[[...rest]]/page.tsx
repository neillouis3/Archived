"use client";

import {Image} from "@heroui/image";
import {Button, Link} from "@heroui/react";
import { SignIn, SignUpButton } from "@clerk/nextjs";


export default function Home() {
  return (
    <div className="flex flex-row w-full items-center justify-center h-full gap-16">
      <div className="flex flex-col w-full h-full justify-center items-center gap-16 pb-64">
        <div className="w-full flex justify-center">
          <Image
            alt="HeroUI hero Image"
            src="/logo.jpg"
            width={300}
          />
        </div>
        <div className="flex justify-center w-full px-16">
          <p>Welcome to Milestones! This is a demo of the app. You can sign in or sign up to see the full functionality.</p>
        </div>
        
      </div>
      <div className="flex flex-row gap-4">
          <SignIn />
      </div>
      
    </div>
  );
}
