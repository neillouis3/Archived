"use client"
import React from "react";
import { Button, Avatar, Image } from "@heroui/react";


export default function ProfileAccountViewer ({ imageUrl, username, fullName }: { imageUrl?: string; username?: string; fullName?: string } = {}) {
    const resolvedImageUrl = imageUrl ?? "https://i.pravatar.cc/150?u=placeholder";

    return (
        <div className="flex flex-col gap-4 w-3xl">
            <div className="bg-white rounded-lg gap-4 flex flex-col shadow-md">
                
                <div className="p-8 flex-4">
                    <div className=" mb-2 flex-row flex items-center gap-4">
                        
                        <Image  radius="lg" width="80" src={resolvedImageUrl} />
                        <div className="h-full items-center ">
                            <p className="font-semibold text-2xl -mt-1">{fullName}</p>
                            <p className="text-xs text-default-400 -mt-1 mb-2">@{username}</p>
                            <div  className="text-[10px] px-2 py-0.5 w-fit bg-default-200 rounded-full font-semibold">Edit profile</div>
                        </div>
                        
                    </div>
                    <div className="my-4 w-2/3">
                        <p className="text-xs">Computer Engineering at Memorial University. I am on my fourth year. I am taking 5 courses, and I have one and a half years left before graduating. I will graduate around April of 2027.</p>
                    </div>
                    

                    
                </div>
            </div>
            <div className="bg-white w-full h-128 rounded-lg justify-center items-center flex flex-col">
                <div className="p-4 text-xs">
                    All milestones will come here
                </div>
            </div>
        </div>
        
    )
}