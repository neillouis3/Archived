import AlbumPost from "@/components/albumPost";


export default function Home() {
  return (
    <div className="flex flex-row w-full h-[200vh] overflow-x-hidden gap-16 relative">
      <div className="flex-1/3 flex flex-col h-screen sticky top-0">

        <div className="mt-16 ">
          <h1 className="text-4xl font-bold text-gray-500">milestones</h1>
          <p className="text-gray-500">Febuary 16 2024</p>
        </div>
      </div>
      <div className="flex-2/3 bg-gray h-fit pt-16 flex flex-col gap-52">
        <AlbumPost />

      </div>
    </div>
  );
}
