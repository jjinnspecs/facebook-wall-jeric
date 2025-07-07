// components/ImagePreview.tsx
import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react'; // We'll install lucide-react for icons

type ImagePreviewProps = {
  image: { url: string; file?: File }; // file is optional for external URLs
  onRemove: () => void;
};

export function ImagePreview({ image, onRemove }: ImagePreviewProps) {
  return (
    <div className="relative w-24 h-24 rounded-md overflow-hidden border border-gray-200">
      <Image
        src={image.url}
        alt="Preview"
        layout="fill"
        objectFit="cover"
        className="rounded-md"
      />
      <Button
        type="button"
        onClick={onRemove}
        variant="ghost"
        size="icon"
        className="absolute top-0 right-0 -mt-2 -mr-2 h-6 w-6 rounded-full bg-white/70 hover:bg-white text-red-500 hover:text-red-600 border border-red-300"
      >
        <XCircle className="h-4 w-4" />
        <span className="sr-only">Remove image</span>
      </Button>
    </div>
  );
}