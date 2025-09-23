import ImageCard from "@/components/cards/imageCards";
import DetailedChip from "@/components/chip";
import { desc } from "framer-motion/client";

export default function AlbumPost({ title, description, imgUrl }: { title: string; description: string; imgUrl: string[] }) {
    return (
        <div className="bg-white pt-4 flex flex-col gap-4 w-full rounded-xl shadow-md">
            <div className="px-4">
                <p className="text-xs font-medium text-default-400 mb-4"> Febuary 16, 2024 at 2:34 AM</p>
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
                {imgUrl.map((src, i) => (
                    <ImageCard key={i} src={src} />
                ))}
            </div>

    
        </div>
    );
}