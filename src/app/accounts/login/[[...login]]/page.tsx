import AlbumPost from "@/components/albumPost";
import { SignIn } from '@clerk/nextjs'


export default function Home() {
  return (
      <div className="flex flex-col items-center pt-20 w-full h-full">
        <SignIn />

      </div>
    

  );
}
