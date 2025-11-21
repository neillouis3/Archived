"use client";
import {Card, Image} from "@heroui/react";

interface ImageCardProps {
  src?: string;
  alt?: string;
}

export default function ImageCard({ 
  src = "https://heroui.com/images/hero-card.jpeg",
  alt = "Not loading"
}: ImageCardProps) {
  return (
    <div className="h-fit   w-full">

        <Image
          alt={alt}
          className="aspect-square object-cover"
          radius="md"
          src={src}

        />

    </div>
    
  );
}
