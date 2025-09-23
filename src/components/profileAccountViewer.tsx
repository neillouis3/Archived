
// import React from "react";
// import { Button, Avatar, Image } from "@heroui/react";
// import AlbumPost from "./albumPost";

// type Media = {
//     url: string;
//   };
  
//   type Post = {
//     _id: string;      // serialized ObjectId
//     title: string;
//     body: string;
//     media: Media[];   // always at least 1 item
//   };

// export default async function ProfileAccountViewer ({ imageUrl, username, fullName, clerkId }: { imageUrl?: string; username?: string; fullName?: string; clerkId?: string } = {}) {
//     const resolvedImageUrl = imageUrl ?? "https://i.pravatar.cc/150?u=placeholder";


//     const res = await fetch(`/api/posts?authorClerkId=${clerkId}`);
//     const data = await res.json();
    
//     // ✅ all media URLs (flattened)
//     // const allMediaUrls = data.flatMap(post =>
//     //   post.media.map(m => m.url)
//     // );


//     return (
//         <div className="flex flex-col gap-4 w-3xl">
//             {/* <div className="bg-white rounded-lg gap-4 flex flex-col shadow-md">
                
//                 <div className="p-8 flex-4">
//                     <div className=" mb-2 flex-row flex items-center gap-4">
                        
//                         <Image  radius="lg" width="80" src={resolvedImageUrl} />
//                         <div className="h-full items-center ">
//                             <p className="font-semibold text-2xl -mt-1">{fullName}</p>
//                             <p className="text-xs text-default-400 -mt-1 mb-2">@{username}</p>
//                             <div  className="text-[10px] px-2 py-0.5 w-fit bg-default-200 rounded-full font-semibold">Edit profile</div>
//                         </div>
                        
//                     </div>
//                     <div className="my-4 w-2/3">
//                         <p className="text-xs">Computer Engineering at Memorial University. I am on my fourth year. I am taking 5 courses, and I have one and a half years left before graduating. I will graduate around April of 2027.</p>
//                     </div>
                    

                    
//                 </div>
//             </div>
//             <div className="bg-white w-full h-128 rounded-lg justify-center items-center flex flex-col">
//                 <div className="p-4 text-xs">
            
                
//                 {data.map((post) => (
//                 <AlbumPost
//                     key={post._id}
//                     title={post.title}
//                     description={post.body}
//                     imgUrl={post.media.map(m => m.url)} // pass all media URLs as array
//                 />
//                 ))}
//                 </div>
//             </div> */}
//             {data}
//         </div>
        
//     )
// }