import ImageCard from "@/components/cards/imageCards";
import { Avatar, Button, DropdownTrigger, DropdownItem, DropdownMenu, Dropdown } from "@heroui/react";
import { SVGProps, useState } from "react";


export const LikeIcon = ({ filled, ...props }: SVGProps<SVGSVGElement> & { filled?: boolean }) => {
  return filled ? (

  
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 text-red-500">
  <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
</svg>

  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
  </svg>
  );
};

export const CommentIcon = ({ filled, ...props }: SVGProps<SVGSVGElement> & { filled?: boolean }) => {
  return filled ? (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6" {...props}>
      <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97Z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
    </svg>
  );
};

export const BookmarkIcon = ({ filled, ...props }: SVGProps<SVGSVGElement> & { filled?: boolean }) => {
  return filled ? (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6" {...props}>
      <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
    </svg>
  );
};

export const DotIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" {...props}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
</svg>
  );
};

export const ShareIcon = ({ filled, ...props }: SVGProps<SVGSVGElement> & { filled?: boolean }) => {
  return filled ? (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6" {...props}>
      <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
    </svg>
  );
};




export default function AlbumPost({ fullName, title, description, mediaUrl, username, imageUrl }: { fullName:string, title: string; description: string; mediaUrl: string[]; username: string; imageUrl: string }) {

    const resolvedImageUrl = imageUrl ?? "https://i.pravatar.cc/150?u=placeholder";
    const resolvedUsername = username ? `${username}` : "@username";
    const resolvedFullName = fullName ? `${fullName}` : "First Name Last Name";

    // Clicked/Active states (only for like and bookmark)
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);


    return (

        <div className="bg-background pt-2 flex flex-col gap-2 w-full rounded-xl ">
            <div className="px-4 pb-2">
                <div className="flex flex-row items-center justify-between mb-2 -mr-2">
                    
                        <p className="text-xs font-medium text-default-400 "> Febuary 16, 2024 at 2:34 AM</p>
                    
                    
                    <Dropdown placement="bottom-end" backdrop="blur">
                      <DropdownTrigger>
                        <Button isIconOnly variant="light"  size="sm"><DotIcon /></Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Static Actions">
                        <DropdownItem key="new">New file</DropdownItem>
                        <DropdownItem key="copy">Copy link</DropdownItem>
                        <DropdownItem key="edit">Edit file</DropdownItem>
                        <DropdownItem key="delete" className="text-danger" color="danger">
                          Delete file
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                </div>
                
                <div className="flex flex-row items-center h-fit gap-2 mb-4">
                  <div className="h-fit">
                  <Avatar size="lg" src={resolvedImageUrl}/>
                  </div>
                    
                    <div className="flex flex-col justify-between">
                      <p className="text-md font-semibold">{resolvedFullName}</p>
                      <p className="text-sm text-default-500 font-medium">{resolvedUsername}</p>
                    </div>
                   
                    
                    
                </div>
                <h1 className="text-xl font-bold">
                    {title}
                </h1>
                <div className="w-full  mt-1 rounded-xl">
                    <p className=" text-sm">
                        {description}
                    </p>
                </div>
                

            
            </div>
           <div
            className={`
              px-2 gap-1 
              grid
              ${
                mediaUrl.length === 1
                  ? "grid-cols-1"
                  : mediaUrl.length === 2
                  ? "grid-cols-2"
                  : mediaUrl.length === 3
                  ? "grid-cols-2"
                  : "grid-cols-2 grid-rows-2"
              }
            `}
          >
            {mediaUrl.slice(0, 4).map((src, i) => (
              <div
                key={i}
                className={`relative w-full`}
              >
                <ImageCard src={src} />
              </div>
            ))}
          </div>

            <div className="flex flex-row px-2 pt-2 justify-between border-t border-default-200">
                <div className="flex flex-row z-15 gap-2 w-full h-fit items-center">
                    <Button 
                        isIconOnly 
                        variant="light" 
                        size="sm"
                        onPress={() => setIsLiked(!isLiked)}
                    >
                        <LikeIcon filled={isLiked} className={isLiked ? "text-red-500" : ""} />
                    </Button>
                    <Button 
                        isIconOnly 
                        variant="light" 
                        size="sm"
                    >
                        <CommentIcon filled={false} />
                    </Button>
                    <Button 
                        isIconOnly 
                        variant="light" 
                        size="sm"
                    >
                        <ShareIcon filled={false} />
                    </Button>
                </div>
                <div className="flex flex-row rounded-xl gap-4 w-fit h-fit  items-center">
                    <Button 
                        isIconOnly 
                        variant="light" 
                        size="sm"
                        onPress={() => setIsBookmarked(!isBookmarked)}
                    >
                        <BookmarkIcon filled={isBookmarked} />
                    </Button>
                </div>
            </div>
            <div className="flex flex-row px-4 -mt-1 pb-8 items-center ">
              <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="album1"   className="size-5 mr-2"/>
              <p className="text-sm font-bold">100 likes</p>
            </div>

    
        </div>
    );
}