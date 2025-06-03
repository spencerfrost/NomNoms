import { ReactNode } from 'react'
import HamburgerMenu from '@/components/hamburger-menu'

interface PageHeaderProps {
  children: ReactNode
}

export default function PageHeader({ children }: PageHeaderProps) {
  return (
    <div className="flex justify-between items-start mb-8">
      <div className="flex-1">
        {children}
      </div>
      
      <div className="flex items-center gap-4 ml-4">
        <HamburgerMenu />
      </div>
    </div>
  )
}
