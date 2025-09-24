import ImageCard from "@/components/cards/imageCards";
import { Avatar } from "@heroui/react";

export default function AlbumPost({ title, description, mediaUrl, username, imageUrl }: { title: string; description: string; mediaUrl: string[]; username: string; imageUrl: string }) {

    const resolvedImageUrl = imageUrl ?? "https://i.pravatar.cc/150?u=placeholder";
    const resolvedUsername = username ? `${username}` : "@username";


    return (

        <div className="bg-white pt-4 flex flex-col gap-4 w-full rounded-xl shadow-md">
            <div className="px-4">
                <p className="text-xs font-medium text-default-400 mb-4"> Febuary 16, 2024 at 2:34 AM</p>
                <div className="flex flex-row items-center gap-2 mb-4">
                    <Avatar src={resolvedImageUrl}/>
                    <p className="text-sm font-bold">{resolvedUsername}</p>
                </div>
                <h1 className="text-xl font-bold">
                    {title}
                </h1>
                <p className="mt-1 text-sm">
                    {description}
                </p>
                <p className="text-primary text-sm">
                    #high
                </p>
            
            </div>
            <div className="columns-3 gap-2 pb-12">
                {mediaUrl.map((src, i) => (
                    <ImageCard key={i} src={src} />
                ))}
            </div>

    
        </div>
    );
}