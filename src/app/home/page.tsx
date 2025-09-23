"use client"

import AlbumPost from "@/components/albumPost";
import StatusPost from "@/components/statusPost";
import LeftSideBar from "@/components/leftSideBar";
import AddPostModal from "@/components/addPostModal";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import RightSideBar from "@/components/rightSideBar";

import { useEffect, useState } from "react";



export default function Home() {
  const {isSignedIn, user, isLoaded } = useUser();

  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoaded || !user) return;

    async function fetchPosts() {
      try {
        const res = await fetch(`/api/posts?authorClerkId=${user?.id}`);
        const data = await res.json();
        setPosts(data.results || []);
      } catch (err) {
        console.error(err);
      }
    }

    fetchPosts();
  }, [isLoaded, user]);

  if (!isLoaded) return <p>Loading user...</p>;
  if (!isSignedIn) return <p>Please sign in</p>;

  return (
    <div className="flex flex-col w-full gap-16 items-center justify-center">
           <LeftSideBar username={user?.username ?? undefined} fullName={user?.fullName ?? undefined} imageUrl={user?.imageUrl ?? undefined} />
           <RightSideBar username={user?.username ?? undefined} fullName={user?.fullName ?? undefined} imageUrl={user?.imageUrl ?? undefined} />
      
      <div className=" w-[40vw] h-fit py-8 flex flex-col gap-4 items-center">
        <AddPostModal username={user?.username ?? undefined} fullName={user?.fullName ?? undefined} imageUrl={user?.imageUrl ?? undefined} clerkId={user?.id ?? undefined} />
          
        {posts.map((post) =>
          <AlbumPost
            key={post._id}
            title={post.title}
            description={post.body}
            imgUrl={post.media.map((m: any) => m.url).filter(Boolean)}
          />
          )}
        
      </div>

      
    </div>
  );
}
