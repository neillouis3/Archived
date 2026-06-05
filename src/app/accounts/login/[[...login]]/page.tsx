import Link from "next/link";
import LoginForm from "@/components/loginForm";

export default function LoginPage() {
  return (
    <div
      className="min-h-[100dvh] w-full bg-white text-stone-800 flex flex-col"
     
    >
      <header className="shrink-0 flex flex-col items-center px-6 pt-10 pb-6 sm:pt-14">
        <Link
          href="/"
          className="font-normal text-stone-800 text-xl sm:text-2xl
                     hover:text-stone-600 transition-colors"
         
        >
          Archive
        </Link>
        <p className="mt-3 text-center text-xs text-stone-400 max-w-sm leading-relaxed">
          Sign in to continue
        </p>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start sm:justify-center px-4 pb-12 sm:pb-16 pt-2">
        <div className="w-full max-w-[420px]">
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
