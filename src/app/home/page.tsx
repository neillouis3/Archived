"use client"

import AlbumPost from "@/components/albumPost";
import StatusPost from "@/components/statusPost";
import ProjectDetails from "@/components/projectDetails";
import AddPostModal from "@/components/addPostModal";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";



export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser();
  
  if (!user) return redirect('/accounts/login')
    
  return (
    <div className="flex w-full h-[200vh] overflow-x-hidden gap-16 relative justify-center">
      <ProjectDetails/>
      
      <div className="max-w-7xl w-3xl bg-gray h-fit py-8 flex flex-col gap-4 items-center">
        <div className="mb-8">
          <AddPostModal username={user?.username ?? undefined} fullName={user?.fullName ?? undefined} imageUrl={user?.imageUrl ?? undefined} />
        </div>

        <AlbumPost />
        <StatusPost />

      </div>

      
    </div>
  );
}
