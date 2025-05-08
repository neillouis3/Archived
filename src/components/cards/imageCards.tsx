"use client";
import {Card, CardFooter, Image, Button} from "@heroui/react";

export default function ImageCard() {
  return (
    <Card isFooterBlurred className="border-none" radius="lg">
      <Image
        alt="Woman listing to music"
        className="object-cover"
        height={200}
        src="https://heroui.com/images/hero-card.jpeg"
        width={200}
      />
      
    </Card>
  );
}
