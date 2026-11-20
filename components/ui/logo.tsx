import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  /** Size the mark with width/height classes; defaults to h-8 w-8. */
  className?: string;
}

/** The NomNoms "NN" mark (decorative: always shown next to the name). Dark mode gets a lighter tile. */
export default function Logo({ className }: LogoProps) {
  const size = cn('h-8 w-8 shrink-0', className);
  return (
    <>
      <Image
        src="/images/logo-mark.svg"
        alt=""
        width={64}
        height={64}
        className={cn(size, 'dark:hidden')}
        priority
      />
      <Image
        src="/images/logo-mark-dark.svg"
        alt=""
        width={64}
        height={64}
        className={cn(size, 'hidden dark:block')}
        priority
      />
    </>
  );
}
