"use client"

import AlbumPost from "@/components/albumPost";
import ImageGrid from "@/components/imageGrid";


import { useUser } from "@clerk/nextjs";
import { useState, useEffect, SVGProps } from "react";
import { Button, Image, Link, Tab, Tabs } from "@heroui/react";
import LeftSideBar, { UserIcon } from "@/components/leftSideBar2";
import RightSideBar from "@/components/rightSideBar1";


export const LinkIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
<path fillRule="evenodd" d="M19.902 4.098a3.75 3.75 0 0 0-5.304 0l-4.5 4.5a3.75 3.75 0 0 0 1.035 6.037.75.75 0 0 1-.646 1.353 5.25 5.25 0 0 1-1.449-8.45l4.5-4.5a5.25 5.25 0 1 1 7.424 7.424l-1.757 1.757a.75.75 0 1 1-1.06-1.06l1.757-1.757a3.75 3.75 0 0 0 0-5.304Zm-7.389 4.267a.75.75 0 0 1 1-.353 5.25 5.25 0 0 1 1.449 8.45l-4.5 4.5a5.25 5.25 0 1 1-7.424-7.424l1.757-1.757a.75.75 0 1 1 1.06 1.06l-1.757 1.757a3.75 3.75 0 1 0 5.304 5.304l4.5-4.5a3.75 3.75 0 0 0-1.035-6.037.75.75 0 0 1-.354-1Z" clipRule="evenodd" />
</svg>


  );
};

export const AlbumIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none" className="size-5">
    <path d="M6 17.9745C6.1287 19.2829 6.41956 20.1636 7.07691 20.8209C8.25596 22 10.1536 22 13.9489 22C17.7442 22 19.6419 22 20.8209 20.8209C22 19.6419 22 17.7442 22 13.9489C22 10.1536 22 8.25596 20.8209 7.07691C20.1636 6.41956 19.2829 6.1287 17.9745 6" stroke="#141B34" stroke-width="1.5" />
    <path d="M2 10C2 6.22876 2 4.34315 3.17157 3.17157C4.34315 2 6.22876 2 10 2C13.7712 2 15.6569 2 16.8284 3.17157C18 4.34315 18 6.22876 18 10C18 13.7712 18 15.6569 16.8284 16.8284C15.6569 18 13.7712 18 10 18C6.22876 18 4.34315 18 3.17157 16.8284C2 15.6569 2 13.7712 2 10Z" stroke="#141B34" stroke-width="1.5" />
    <path d="M5 18C8.42061 13.2487 12.2647 6.9475 18 11.6734" stroke="#141B34" stroke-width="1.5" />
</svg>

  );
};
export const BirthdayIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Zm-3 0a.375.375 0 1 1-.53 0L9 2.845l.265.265Zm6 0a.375.375 0 1 1-.53 0L15 2.845l.265.265Z" />
</svg>

  );
};
export const UniversityIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
</svg>


  );
};





export default  function Profile() {
  const [activeTab, setActiveTab] = useState("profile");
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
    <div className="flex flex-col w-full h-full items-center justify-center">
      <LeftSideBar onTabChange={setActiveTab}/>
      <RightSideBar/>
      {activeTab === "profile" && isLoaded && user && (
        <div className="h-[90vh] gap-4 flex flex-col  w-[45vw] my-4  items-center justify-center"> 
              <div className="p-4 bg-background h-fit flex-4 flex flex-col gap-4 items-center shadow-md rounded-2xl">
                  <div className="h-fit w-full flex flex-row items-center px-2 gap-2">
                      <div className="h-fit">
                        <Image radius="full" width={180} src={user?.imageUrl}  />
                      </div>              
                      <div className="h-fit w-full flex flex-col ml-4 justify-between">
                          <div className="flex flex-col gap-2 ">
                            <div className="flex flex-row gap-4 justify-between rounded-md bg-midground h-fit py-1 px-2 w-fit">
                              <div className="flex flex-row items-end gap-2">
                                <p className="font-bold text-default-700">202</p>
                                <p className="text-sm text-default-400"> posts</p>
                              </div>
                              <div className="flex flex-row items-end gap-2">
                                <p className="font-bold text-default-700">202</p>
                                <p className="text-sm text-default-400"> followers</p>
                              </div>
                              <div className="flex flex-row items-end gap-2">
                                <p className="font-bold text-default-700">202</p>
                                <p className="text-sm text-default-400"> following</p>
                              </div>
                            </div>
                            <div className="mt-2 ml-2">
                              <p className="font-bold text-2xl -mt-1">{user?.fullName}</p>
                              <p className="text-sm text-default-400 -mt-1 mb-2">@{user?.username}</p>
                              <div className="flex-row flex gap-4">
                              <div className="flex flex-row items-center h-fit text-default-400 gap-2">
                                <BirthdayIcon />
                                <p className="text-sm  ">
                                  {user?.publicMetadata?.birthday
                                    ? new Date(user?.publicMetadata?.birthday as string).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })
                                    : ""}
                                </p>
                              </div>
                              <div className="flex flex-row items-center h-fit text-default-400 gap-2">
                                <UniversityIcon />
                                <p className="text-sm  ">
                                   Memorial University
                                </p>
                              </div>
                              </div>
                              
                            </div>


                          </div>
                          
                            
                      </div>

                      
                  </div>
                  <div className="">
                    <p className="text-sm">{user?.publicMetadata?.bio as string}</p>
                  </div>
                  <div className="flex flex-row gap-2 items-center p-2 -mx-4 rounded-sm w-full bg-[#f4f4f5]">
                    <div className="flex flex-row gap-2 items-center rounded-md"><LinkIcon /><Link size="sm">www.example.com</Link></div>
                  </div>
                  <div className="h-52 w-full bg-primary-300 rounded-2xl px-8 py-8 flex flex-col justify-betwee mt-8"> 
                    <div>
                      <h1 className="font-black text-xl">You aren't verified yet</h1>
                      <p className="text-md text-default-700">Get verified for boosted replies, analytics, ad-free browsing, and more. Upgrade your profile now.</p>
                    
                    </div>
                    <div>

                    <Button radius="full">Get verified</Button>
                    </div>
                  
                  </div>
              </div>
              
        </div>
      )}
      {activeTab === "milestones" && isLoaded && user && (
        <div className=" flex flex-col w-[45vw]   items-center justify-center"> 
         
            <div className=" w-full ml-auto h-full  pb-8 flex flex-col gap-4 items-center">

              <div className="flex flex-col mt-4 ">
                {/* {posts.map((post) =>
                <div className="flex flex-row gap-4">
                          <div className="w-[35vw]">
                            <AlbumPost
                            fullName={post.fullName}
                            key={post._id}
                            title={post.title}
                            description={post.body}
                            mediaUrl={post.media.map((m: any) => m.url).filter(Boolean)}
                            username={post.username}
                            imageUrl={post.avatarUrl}
                          />
                          </div>
                          
                </div>
                )} */}

                <ImageGrid authorClerkId={user?.id}/>
              </div> 
            </div>
          
        </div>
      )}


      
    </div>
  );
}
