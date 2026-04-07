"use client";

import { SignIn, useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

// Ambient photo tiles shown behind the sign-in form
const ambientImages = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=70",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=70",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=70",
  "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=400&q=70",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&q=70",
  "https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=400&q=70",
  "https://images.unsplash.com/photo-1434725039720-aaad6dd32dfe?w=400&q=70",
  "https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?w=400&q=70",
  "https://images.unsplash.com/photo-1490750967868-88df5691cc40?w=400&q=70",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&q=70",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=70",
  "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&q=70",
];

export default function LandingPage() {
  const { user } = useUser();
  if (user) redirect("/home");

  return (
    <div
      className="relative flex w-full h-screen overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif", background: "#F7F6F2" }}
    >
      {/* Left panel — mosaic */}
      <div className="hidden lg:grid lg:flex-1 grid-cols-3 gap-0.5 overflow-hidden">
        {ambientImages.map((src, i) => (
          <div
            key={i}
            className="relative overflow-hidden bg-stone-200"
            style={{
              animationName: "fadeSlideIn",
              animationDuration: "0.8s",
              animationTimingFunction: "ease",
              animationFillMode: "both",
              animationDelay: `${i * 60}ms`,
            }}
          >
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover"
              style={{
                filter: "brightness(0.92) saturate(0.75) contrast(1.04)",
              }}
            />
          </div>
        ))}

        {/* Fade-right vignette */}
        <div
          className="absolute inset-y-0 left-0 pointer-events-none"
          style={{
            width: "66.666%",
            background:
              "linear-gradient(to right, transparent 60%, #F7F6F2 100%)",
          }}
        />
      </div>

      {/* Right panel — sign in */}
      <div className="flex flex-col items-center justify-center w-full lg:w-[480px] flex-shrink-0 px-10 py-12 relative z-10">
        {/* Wordmark */}
        <div className="mb-10 text-center">
          <h1
            className="text-3xl font-light tracking-[0.35em] uppercase text-stone-800 mb-1"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Archive
          </h1>
          <p className="text-[10px] tracking-[0.25em] uppercase text-stone-400">
            A place for your moments
          </p>
        </div>

        <SignIn
          appearance={{
            variables: {
              colorPrimary: "#44403c",
              colorBackground: "#F7F6F2",
              colorInputBackground: "#EDEAE3",
              colorInputText: "#3a3530",
              colorTextSecondary: "#a09890",
              fontFamily: "'DM Sans', sans-serif",
              borderRadius: "0.5rem",
              fontSize: "13px",
            },
            elements: {
              card: "shadow-none border border-stone-200/60 bg-[#F7F6F2]",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton:
                "border border-stone-200 bg-[#EDEAE3] hover:bg-stone-200 text-stone-700 text-xs tracking-wide",
              formButtonPrimary:
                "bg-stone-800 hover:bg-stone-700 text-white text-xs tracking-[0.1em] uppercase",
              footerActionLink: "text-stone-600 hover:text-stone-800",
            },
          }}
        />

        <p className="mt-8 text-[9px] tracking-[0.15em] uppercase text-stone-300">
          Archive © 2025
        </p>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: scale(1.04); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}