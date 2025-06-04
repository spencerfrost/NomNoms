import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

const textSizeClasses = {
  sm: 'text-lg font-display',
  md: 'text-xl font-display',
  lg: 'text-3xl font-display',
  xl: 'text-4xl font-display',
};

export default function Logo({ size = 'md', showText = true, className }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Image
        src="/images/NomNomsLogo.webp"
        alt="NomNoms Logo"
        width={size === 'xl' ? 64 : size === 'lg' ? 48 : size === 'md' ? 32 : 24}
        height={size === 'xl' ? 64 : size === 'lg' ? 48 : size === 'md' ? 32 : 24}
        className={cn('object-contain', sizeClasses[size])}
        priority
      />
    </div>
  );
}
