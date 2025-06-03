'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Menu, 
  Home, 
  Plus, 
  User, 
  LogIn, 
  LogOut, 
  Sun, 
  Moon,
} from 'lucide-react'
import Link from 'next/link'

export default function HamburgerMenu() {
  const { data: session, status } = useSession()
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark)
    setDarkMode(isDark)
  }, [])

  const toggleTheme = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    
    // Update document class
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        {/* Navigation Items */}
        <DropdownMenuItem asChild>
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <Home className="h-4 w-4" />
            Home
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href="/add" className="flex items-center gap-2 cursor-pointer">
            <Plus className="h-4 w-4" />
            Add Recipe
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* User Section */}
        {status === 'loading' ? (
          <DropdownMenuItem disabled>
            <User className="h-4 w-4 mr-2" />
            Loading...
          </DropdownMenuItem>
        ) : session ? (
          <>
            <DropdownMenuItem disabled className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="font-medium">{session.user?.name}</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => signOut()}
              className="flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem 
              onClick={() => signIn()}
              className="flex items-center gap-2 cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/auth/signup" className="flex items-center gap-2 cursor-pointer">
                <User className="h-4 w-4" />
                Sign up
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />

        {/* Theme Toggle */}
        <DropdownMenuItem 
          onClick={toggleTheme}
          className="flex items-center gap-2 cursor-pointer"
        >
          {darkMode ? (
            <>
              <Sun className="h-4 w-4" />
              Light mode
            </>
          ) : (
            <>
              <Moon className="h-4 w-4" />
              Dark mode
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
