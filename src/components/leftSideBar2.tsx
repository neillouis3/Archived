"use client";
import React, { SVGProps } from "react";
import { Listbox, ListboxItem, ListboxSection } from "@heroui/react";
import AddPostModal from "./addPostModal";

export const AccountIcon = () => (
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
</svg>



);

export const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
</svg>
);

export const AlbumIcon = () => (
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
</svg>

);

export const MediaIcon = () => (
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
</svg>

);

export const LikeIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5" {...props}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
</svg>
  );
};

export const CommentIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5" {...props}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
</svg>
  );
};

export const BookmarkIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5" {...props}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
</svg>
  );
};


export const ShareIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
</svg>

  );
};



export default function LeftSideBar({ onTabChange, imageUrl, username, fullName, bio }: { onTabChange: (key: string) => void, imageUrl?: string; username?: string; fullName?: string; bio?: string }) {
  return (
    <div className="pt-20 pb-4 px-4 lg:h-screen lg:w-[30vw] flex flex-col  fixed left-0 bottom-0 lg:top-0 z-12">
      <div className="flex flex-col w-64 h-full bg-background items-end justify-between rounded-2xl shadow-lg p-4">
        <div className="flex flex-col w-full gap-4">
          <Listbox
            aria-label="Sidebar options"
            onSelectionChange={(keys) => onTabChange(Array.from(keys)[0] as string)}
            selectionMode="single"
            className="w-full"
            
          >
            <ListboxSection title="Overview" >
              <ListboxItem
                key="profile"
                startContent={<UserIcon />}
                description="Check your profile"
                selectedIcon=""
                classNames={{selectedIcon: "hidden"}}
              >
                Profile
              </ListboxItem>

              <ListboxItem
                key="milestones"
                startContent={<AccountIcon />}
                description="All uploaded milestones"
                classNames={{selectedIcon: "hidden"}}
              >
                Milestones
              </ListboxItem>
              <ListboxItem
                key="post"
                className="p-0 w-fit mt-4 mb-8 bg-background "
                classNames={{selectedIcon: "hidden"}}
              >
                <AddPostModal username={username ?? undefined} fullName={fullName ?? undefined} imageUrl={imageUrl ?? undefined}/>
              </ListboxItem>
              </ListboxSection>
              
            <ListboxSection  title="Library">
            <ListboxItem
              key="collections"
              startContent={<AlbumIcon />}
              description="Collection of milestones"
              classNames={{selectedIcon: "hidden"}}
            >
              Collections
            </ListboxItem>

            <ListboxItem
              key="logout"
              startContent={<MediaIcon />}
              description="All uploaded photos"
              classNames={{selectedIcon: "hidden"}}

            >
              Photos
            </ListboxItem>
            </ListboxSection>
            <ListboxSection  title="Interactions" className="mt-16">
            <ListboxItem
              key="collections"
              startContent={<LikeIcon />}
              classNames={{selectedIcon: "hidden"}}
            >
              Likes
            </ListboxItem>

            <ListboxItem
              key="logout"
              startContent={<CommentIcon />}
              classNames={{selectedIcon: "hidden"}}


            >
              Comments
            </ListboxItem>
            <ListboxItem
              key="logout"
              startContent={<ShareIcon />}
              classNames={{selectedIcon: "hidden"}}


            >
              Reposts
            </ListboxItem>
            <ListboxItem
              key="logout"
              startContent={<BookmarkIcon />}
              classNames={{selectedIcon: "hidden"}}


            >
              Saves
            </ListboxItem>
            </ListboxSection>
            
          </Listbox>
        </div>
      </div>
    </div>
  );
}
