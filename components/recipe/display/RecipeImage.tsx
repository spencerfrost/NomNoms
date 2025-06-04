import Image from 'next/image';
import { cn } from '@/lib/utils';

interface RecipeImageProps {
  src?: string;
  alt: string;
  title: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const sizeClasses = {
  small: 'h-32',
  medium: 'h-48',
  large: 'h-64',
};

export function RecipeImage({ src, alt, title, size = 'medium', className }: RecipeImageProps) {
  if (!src) {
    return null;
  }

  return (
    <div className={cn('relative w-full overflow-hidden', sizeClasses[size], className)}>
      <Image
        src={src}
        alt={alt}
        title={title}
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 33vw"
      />
    </div>
  );
}
