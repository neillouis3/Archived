import ImageCard from "@/components/cards/imageCards";


export default function Home() {
  return (
    <div className="flex flex-row w-full h-screen gap-4">
      <div className="flex-1/3 bg-black">

      </div>
      <div className="flex-2/3 bg-gray h-full w-full">
        <div>
          <p className="font-black text-gray-500"> Febuary 16 2024 </p>
          <h1 className="text-4xl font-bold -mt-1">
            ANNIVERSARY
          </h1>
          
        </div>
        <div className="mt-4 grid grid-cols-3 gap-10">
          <div className="flex flex-col gap-4">
            <div className="w-fit h-[250px]">
              <ImageCard />
            </div>
            <div className="w-fit h-fit">
              <ImageCard />
            </div>
            <div className="w-fit h-fit">
              <ImageCard />
            </div>
            <div className="w-fit h-fit">
              <ImageCard />
            </div>
            <div className="w-fit h-fit">
              <ImageCard />
            </div>
            <div className="w-fit h-fit">
              <ImageCard />
            </div>
            <div className="w-fit h-fit">
              <ImageCard />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="w-fit h-[250px]">
              <ImageCard />
            </div>
            <div className="w-fit h-fit">
              <ImageCard />
            </div>
            <div className="w-fit h-fit">
              <ImageCard />
            </div>
            <div className="w-fit h-fit">
              <ImageCard />
            </div>
            <div className="w-fit h-fit">
              <ImageCard />
            </div>
            <div className="w-fit h-fit">
              <ImageCard />
            </div>
            <div className="w-fit h-fit">
              <ImageCard />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="w-fit h-[250px]">
              <ImageCard />
            </div>
            <div className="w-fit h-[250px]">
              <ImageCard />
            </div>
            <div className="w-fit h-fit">
              <ImageCard />
            </div>
            <div className="w-fit h-fit">
              <ImageCard />
            </div>
            <div className="w-fit h-fit">
              <ImageCard />
            </div>
            <div className="w-fit h-fit">
              <ImageCard />
            </div>
            <div className="w-fit h-fit">
              <ImageCard />
            </div>
          </div>
        </div>
        
        
      </div>
    </div>
  );
}
