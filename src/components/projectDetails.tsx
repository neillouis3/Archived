"use client";
import React, { useEffect, useState } from "react";
import { Chip} from "@heroui/react";


export default function ProjectDetails() {

    return (
            <div className="pt-24 pb-8 px-8 lg:h-screen w-full max-lg:border-t-1 max-lg:border-t-default-300 lg:w-[25vw] flex flex-col items-center lg:justify-center z-40 left-0  top-0 fixed  lg:top-0 transition-opacity duration-500">
                <div className="flex flex-col w-full h-full ">
                    <div className="flex flex-col w-full">
                        <div className="bg-white px-8 py-4 h-32 rounded-lg w-full text-sm filter drop-shadow-xl" >
                            <p>
                                HI
                            </p>
                            
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 max-lg:pt-4 max-lg:pb-4 ">
                        

                    </div>
                    <p className="text-xs mt-auto">Designed & built by @neillouis3 for Sophia</p>
                </div>
            </div>
    );
}
