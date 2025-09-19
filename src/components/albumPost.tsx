import ImageCard from "@/components/cards/imageCards";
import DetailedChip from "@/components/chip";

export default function AlbumPost() {
    return (
        <div className="bg-white pt-4 flex flex-col gap-4 w-ful rounded-xl shadow-md">
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
            <div className="grid grid-cols-3 gap-2 pb-12">
                <div className="flex flex-col gap-2">
                    <ImageCard src="https://pcfbhb4t7x.ufs.sh/f/eZVMbLJgNkHVxD4tBMINDcEKrpdZsY3RHkTwXufh2mgotzMA"/>
                    <ImageCard src="https://pcfbhb4t7x.ufs.sh/f/eZVMbLJgNkHVzOroLQC8gTtEwVN95vXrofQdu3CiekBYShLs"/>
                    <ImageCard src="https://pcfbhb4t7x.ufs.sh/f/eZVMbLJgNkHVe1i6Y69LJgNkHVTmsMS1UBp03P8i9qohXyAr"/>


                </div>
                <div className="flex flex-col gap-2">
                    <ImageCard src="https://pcfbhb4t7x.ufs.sh/f/eZVMbLJgNkHVKuxFatSPLnvSzXAbr7uk8DwW5B4IUaFygHhR"/>
                    <ImageCard src="https://pcfbhb4t7x.ufs.sh/f/eZVMbLJgNkHVJFrbWyvOzxYnT5CfXeVvoltNU7KHS3r0qMPB"/>

                </div>
                <div className="flex flex-col gap-2">

                    <ImageCard src="https://pcfbhb4t7x.ufs.sh/f/eZVMbLJgNkHVvtdeP2s8suMnekE7R1VwdItvWlABbo3N9ScO"/>
                </div>

            </div>
    
        </div>
    );
}