"use client";
import {Card, CardFooter, Image, Button} from "@heroui/react";

interface ImageCardProps {
  src?: string;
  alt?: string;
}

export default function ImageCard({ 
  src = "https://heroui.com/images/hero-card.jpeg",
  alt = "Not loading"
}: ImageCardProps) {
  return (
    <div className="h-fit w-full">
      <Card isFooterBlurred className="border-none" radius="none">
        <Image
          alt={alt}
          className=""
          radius="none"
          src={src}
        />
      </Card>
    </div>
    
  );
}
