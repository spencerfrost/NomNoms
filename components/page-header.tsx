import { ReactNode } from 'react';
import HamburgerMenu from '@/components/common/hamburger-menu';

interface PageHeaderProps {
  children: ReactNode;
}

export default function PageHeader({ children }: PageHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="min-w-0 flex-1">{children}</div>

      <div className="flex items-center gap-4 ml-4">
        <HamburgerMenu />
      </div>
    </div>
  );
}
