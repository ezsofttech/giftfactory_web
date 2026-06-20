"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageGalleryProps {
  images: string[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div>
      <div className="relative aspect-square mb-4 rounded-lg overflow-hidden bg-gray-100">
        <Image
          src={images[selectedImage]}
          alt="Product image"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="grid grid-cols-4 gap-2">
        {images.map((image, index) => (
          <button
            key={index}
            className={`relative aspect-square rounded overflow-hidden border-2 ${
              selectedImage === index ? "border-primary" : "border-transparent"
            }`}
            onClick={() => setSelectedImage(index)}
          >
            <Image
              src={image}
              alt={`Thumbnail ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
