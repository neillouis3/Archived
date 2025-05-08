import ImageCard from "@/components/cards/imageCards";
import DetailedChip from "@/components/chip";


export default function Home() {
  return (
    <div className="flex flex-row w-full h-[200vh] overflow-x-hidden gap-4 relative">
      <div className="flex-1/3 flex flex-col bg-white h-screen sticky top-0">
  
        <div className="mt-32 ">
          <h1 className="text-4xl font-bold text-gray-500">milestones</h1>
          <p className="text-gray-500">Febuary 16 2024</p>
        </div>
      </div>
      <div className="flex-2/3 bg-gray h-fit pt-32">
        <div>
          <p className="font-black text-gray-500"> Febuary 16 2024 </p>
          <h1 className="text-4xl font-bold -mt-1 mb-2">
            ANNIVERSARY
          </h1>

          <DetailedChip title="Jeddah, Saudi Arabia"/>
          <p className="mt-4 text-gray-600">
            A vibrant coastal city where ancient traditions meet modern architecture. 
            The Red Sea's gentle waves whisper stories of centuries-old trade routes, 
            while the city's skyline reaches for the stars.
          </p>
          
        </div>
        <div className="mt-12 grid grid-cols-4 gap-4">
          <div className="flex flex-col gap-4">
            <ImageCard src="https://pcfbhb4t7x.ufs.sh/f/eZVMbLJgNkHVxD4tBMINDcEKrpdZsY3RHkTwXufh2mgotzMA"/>
            <ImageCard src="https://pcfbhb4t7x.ufs.sh/f/eZVMbLJgNkHVzOroLQC8gTtEwVN95vXrofQdu3CiekBYShLs"/>
            <ImageCard src="https://pcfbhb4t7x.ufs.sh/f/eZVMbLJgNkHVe1i6Y69LJgNkHVTmsMS1UBp03P8i9qohXyAr"/>


          </div>
          <div className="flex flex-col gap-4">
            <ImageCard src="https://pcfbhb4t7x.ufs.sh/f/eZVMbLJgNkHVKuxFatSPLnvSzXAbr7uk8DwW5B4IUaFygHhR"/>
            <ImageCard src="https://pcfbhb4t7x.ufs.sh/f/eZVMbLJgNkHVJFrbWyvOzxYnT5CfXeVvoltNU7KHS3r0qMPB"/>

          </div>
          <div className="flex flex-col gap-4">
            <ImageCard src="https://pcfbhb4t7x.ufs.sh/f/eZVMbLJgNkHVmQxuv8qO6AcE8hgCjySZNf1as7rLv24lFUmR"/>
            <ImageCard src="https://pcfbhb4t7x.ufs.sh/f/eZVMbLJgNkHVvtdeP2s8suMnekE7R1VwdItvWlABbo3N9ScO"/>
          </div>
          <div className="flex flex-col gap-4">
            <ImageCard src="https://pcfbhb4t7x.ufs.sh/f/eZVMbLJgNkHVxD4tBMINDcEKrpdZsY3RHkTwXufh2mgotzMA"/>
            <ImageCard src="https://pcfbhb4t7x.ufs.sh/f/eZVMbLJgNkHVzOroLQC8gTtEwVN95vXrofQdu3CiekBYShLs"/>
            <ImageCard src="https://pcfbhb4t7x.ufs.sh/f/eZVMbLJgNkHVe1i6Y69LJgNkHVTmsMS1UBp03P8i9qohXyAr"/>


          </div>
        </div>
        
        
      </div>
    </div>
  );
}
