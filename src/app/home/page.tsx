"use client"

import AlbumPost from "@/components/albumPost";
import StatusPost from "@/components/statusPost";
import LeftSideBar from "@/components/leftSideBar";
import AddPostModal from "@/components/addPostModal";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import RightSideBar from "@/components/rightSideBar";



export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser();
  
  if (!user) return redirect('/accounts/login')
    
  return (
    <div className="flex flex-col w-full gap-16 items-center justify-center">
           <LeftSideBar username={user?.username ?? undefined} fullName={user?.fullName ?? undefined} imageUrl={user?.imageUrl ?? undefined} />
           <RightSideBar username={user?.username ?? undefined} fullName={user?.fullName ?? undefined} imageUrl={user?.imageUrl ?? undefined} />
      
      <div className=" w-[40vw] bg-gray h-fit py-8 flex flex-col gap-4 items-center">
      <AddPostModal username={user?.username ?? undefined} fullName={user?.fullName ?? undefined} imageUrl={user?.imageUrl ?? undefined} />
        <AlbumPost />


      </div>

      
    </div>
  );
}
