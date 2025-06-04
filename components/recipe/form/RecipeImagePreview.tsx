'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageIcon, XCircle } from 'lucide-react';

interface RecipeImagePreviewProps {
  src: string;
  alt: string;
  className?: string;
}

export default function RecipeImagePreview({ src, alt, className = '' }: RecipeImagePreviewProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gray-100 text-gray-500 rounded-md border border-dashed border-gray-300 ${className}`}
      >
        <XCircle className="h-8 w-8 mb-2" />
        <p className="text-sm text-center px-2">Failed to load image</p>
        <p className="text-xs text-center px-2 mt-1">
          Check if the URL is valid and publicly accessible
        </p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-gray-100 rounded-md border ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon className="h-8 w-8 text-gray-400" />
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={400}
        height={128}
        className="w-full h-full object-cover"
        onError={() => setHasError(true)}
        onLoad={() => setIsLoading(false)}
        unoptimized={true}
      />
    </div>
  );
}
