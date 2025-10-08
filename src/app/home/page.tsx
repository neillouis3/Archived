"use client"

import AlbumPost from "@/components/albumPost";
import LeftSideBar from "@/components/leftSideBar";
import { useUser } from "@clerk/nextjs";
import RightSideBar from "@/components/rightSideBar";

import { useEffect, useState } from "react";



export default function Home() {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true); 

  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoaded || !user) return;

    async function fetchPosts() {
      try {
        const res = await fetch(`/api/posts`);
        const data = await res.json();
        setPosts(data.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false)
      }
    }

    fetchPosts();
  }, [isLoaded, user]);



  return (
    <div className="flex flex-col w-full h-full  gap-16 items-center justify-center">
           <LeftSideBar username={user?.username ?? undefined} fullName={user?.fullName ?? undefined} imageUrl={user?.imageUrl ?? undefined} />
           <RightSideBar username={user?.username ?? undefined} fullName={user?.fullName ?? undefined} imageUrl={user?.imageUrl ?? undefined} />
      
      {loading ? (<div className="h-screen"></div>) :
      (<div className=" w-[40vw] h-full py-8 flex flex-col gap-4 items-center">
          
        {posts.map((post) =>
          <AlbumPost
            key={post._id}
            title={post.title}
            description={post.body}
            mediaUrl={post.media.map((m: any) => m.url).filter(Boolean)}
            username={post.username}
            imageUrl={post.avatarUrl}
          />
          )}
        
      </div>)}


    </div>
  );
}
