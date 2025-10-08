import ImageCard from "@/components/cards/imageCards";
import { Avatar, Button } from "@heroui/react";
import { SVGProps } from "react";


export const LikeIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" {...props}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
</svg>
  );
};

export const CommentIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" {...props}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
</svg>
  );
};

export const BookmarkIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
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


export default function AlbumPost({ title, description, mediaUrl, username, imageUrl }: { title: string; description: string; mediaUrl: string[]; username: string; imageUrl: string }) {

    const resolvedImageUrl = imageUrl ?? "https://i.pravatar.cc/150?u=placeholder";
    const resolvedUsername = username ? `${username}` : "@username";


    return (

        <div className="bg-white dark:bg-[#27272a] pt-2 flex flex-col gap-4 w-full rounded-xl ">
            <div className="px-4">
                <div className="flex flex-row items-center justify-between mb-2 -mr-2">
                    
                        <p className="text-xs font-medium text-default-400 "> Febuary 16, 2024 at 2:34 AM</p>
                    
                    <Button isIconOnly variant="light"  size="sm"><DotIcon /></Button>
                </div>
                
                <div className="flex flex-row items-center gap-2 mb-4">
                    <Avatar src={resolvedImageUrl}/>
                    <p className="text-sm font-bold">{resolvedUsername}</p>
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
            <div className="columns-2 gap-1 px-2 pb-8">
                {mediaUrl.slice(0, 4).map((src, i) => (
                    <ImageCard  key={i} src={src} />
                ))}
            </div>
            <div className="flex flex-row px-4 pb-4 justify-between border-t border-default-200">
                <div className="flex flex-row rounded-xl gap-2 w-full h-12  items-center">
                    <Button isIconOnly variant="light"  size="sm"><LikeIcon /></Button>
                    <Button isIconOnly variant="light"  size="sm"><CommentIcon /></Button>
                </div>
                <div className="flex flex-row rounded-xl gap-4 w-fit h-12  items-center">
                    <Button isIconOnly variant="light"  size="sm"><BookmarkIcon /></Button>
                </div>
            </div>

    
        </div>
    );
}