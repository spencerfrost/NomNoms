import { useEffect, useRef } from 'react';

interface InfiniteScrollTriggerProps {
  onIntersect: () => void;
  threshold?: number;
  rootMargin?: string;
  disabled?: boolean;
}

export function InfiniteScrollTrigger({
  onIntersect,
  threshold = 0.1,
  rootMargin = '100px',
  disabled = false,
}: InfiniteScrollTriggerProps) {
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          onIntersect();
        }
      },
      { threshold, rootMargin }
    );

    const currentRef = triggerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [onIntersect, threshold, rootMargin, disabled]);

  return <div ref={triggerRef} className="h-4" aria-hidden="true" />;
}
