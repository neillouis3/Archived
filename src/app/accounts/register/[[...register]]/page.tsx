import { SignUp } from '@clerk/nextjs'


export default function Home() {
  return (
      <div className="flex flex-col items-center mt-20 w-full h-full">
        <SignUp />

      </div>
    

  );
}
