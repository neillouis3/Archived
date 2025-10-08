"use client"

import AlbumPost from "@/components/albumPost";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Image } from "@heroui/react";
import LeftSideBar from "@/components/leftSideBar2";




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
    <div className="flex flex-col w-full h-full my-4 gap-16 items-center justify-center">
      <LeftSideBar />
      <div className=" bg-background gap-4  w-[70vw] pl-64 top-0 pt-24 z-11 h-64 flex flex-col  fixed">
                
          <div className="bg-white p-8  flex-4 flex flec-col items-center h-52 shadow-md rounded-t-2xl">
            <div className="h-full w-full flex-row flex">
              <div className="h-full w-full flex flex-row items-center gap-4">
                  <div className="h-full ">
                    <Image radius="full" width={160} src={user?.imageUrl}  />
                  </div>              
                
                  <div className="h-full w-full flex flex-col justify-end ">
                      
                      {/* <div  className="text-[10px] px-2 py-0.5 w-fit bg-default-200 rounded-full font-semibold">Edit profile</div> */}
                      <div>
                        <p className="font-semibold text-2xl -mt-1">{user?.fullName}</p>
                        <p className="text-xs text-default-400 -mt-1 mb-2">@{user?.username}</p>
                      </div>
                      <div className="h-full py-2 px-4 w-3/4 rounded-md bg-[#f4f4f5]">
                          <p className="text-xs">{user?.publicMetadata?.bio as string}</p>
                      </div> 
                  </div>
              </div>
              
              <div className="flex flex-row justify-between ml-auto">
                <p className="text-sm text-default-400"><span className="font-bold text-default-700">202</span> posts</p>
                <p className="text-sm text-default-400"><span className="font-bold text-default-700">202</span> followers</p>
                <p className="text-sm text-default-400"><span className="font-bold text-default-700">202</span> following</p>

              </div>
              
                
              
            </div>
               
          </div>
        
      </div>
      <div className=" w-[70vw] ml-auto h-full pt-56 pb-8 pr-64 flex flex-col gap-4 items-center">
        <div className="flex flex-col gap-4 ">
          {posts.map((post) =>
          <div className="flex flex-row gap-4">
                    <div className="w-[35vw]">
                      <AlbumPost
                      key={post._id}
                      title={post.title}
                      description={post.body}
                      mediaUrl={post.media.map((m: any) => m.url).filter(Boolean)}
                      username={post.username}
                      imageUrl={post.avatarUrl}
                    />
                    </div>
                    <div className="w-[15vw] h-fit bg-white p-4 rounded-lg text-sm">
                      <div className="">
                        <h1>Likes: 30</h1>
                        <h1>Comments: 50</h1>
                      </div>
                    </div>
          </div>
          )}
        </div> 

        
       



      </div>

      
    </div>
  );
}
