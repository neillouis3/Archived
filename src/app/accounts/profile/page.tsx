"use client"

import AlbumPost from "@/components/albumPost";
import StatusPost from "@/components/statusPost";
import LeftSideBar from "@/components/leftSideBar";
import AddPostModal from "@/components/addPostModal";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import RightSideBar from "@/components/rightSideBar";
import ProfileAccountViewer from "@/components/profileAccountViewer";



export default function Profile() {
  const { isSignedIn, user, isLoaded } = useUser();

  if (!user) return (
    <>
    </>
  );
    
  return (
    <div className="flex flex-row w-full  gap-16 py-8 w-[50vw] justify-center">
  
      <ProfileAccountViewer username={user?.username ?? undefined} fullName={user?.fullName ?? undefined} imageUrl={user?.imageUrl ?? undefined} />


      
    </div>
  );
}
