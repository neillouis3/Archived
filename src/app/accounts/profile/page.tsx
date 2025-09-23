"use client"

import AlbumPost from "@/components/albumPost";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Image } from "@heroui/react";




export default  function Profile() {
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
    <div className="flex flex-col w-full gap-16  items-center">
      <div className=" w-[75vw] h-fit py-8 flex flex-col gap-4 items-center">
        <div className="bg-white rounded-lg gap-4 w-full flex flex-col shadow-md">
                
          <div className="p-8 flex-4">
            <div className=" mb-2 flex-row flex items-center gap-4">
                              
              <Image  radius="lg" width="80" src={user?.imageUrl} />
                <div className="h-full items-center ">
                    <p className="font-semibold text-2xl -mt-1">{user?.fullName}</p>
                    <p className="text-xs text-default-400 -mt-1 mb-2">@{user?.username}</p>
                    <div  className="text-[10px] px-2 py-0.5 w-fit bg-default-200 rounded-full font-semibold">Edit profile</div>
                </div>
              
            </div>
            <div className="my-4 w-2/3">
                <p className="text-xs">Computer Engineering at Memorial University. I am on my fourth year. I am taking 5 courses, and I have one and a half years left before graduating. I will graduate around April of 2027.</p>
            </div>    
          </div>
        </div>
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
