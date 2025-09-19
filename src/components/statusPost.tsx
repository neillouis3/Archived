import ImageCard from "@/components/cards/imageCards";
import DetailedChip from "@/components/chip";

export default function statusPost() {
    return (
        <div className="bg-white pt-4 pb-8 flex flex-col gap-4 rounded-xl shadow-md">
            <div className="px-4">
                <p className="text-xs font-medium text-default-400 mb-4"> Febuary 16, 2024 at 2:34 AM</p>
                <h1 className="text-xl font-bold">
                    ANNIVERSARY
                </h1>
                <p className="mt-1 text-sm">
                    A vibrant coastal city where ancient traditions meet modern architecture. 
                    The Red Sea's gentle waves whisper stories of centuries-old trade routes, 
                    while the city's skyline reaches for the stars.
                </p>
                <p className="text-primary text-sm">
                    #high
                </p>
            
            </div>

        </div>
    );
}