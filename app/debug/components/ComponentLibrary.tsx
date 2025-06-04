"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Filter, Moon, Sun, Monitor, Smartphone, Tablet, MonitorSpeaker } from "lucide-react"
import { useTheme } from "next-themes"

// Import all showcase components
import { ButtonShowcase } from "./sections/ButtonShowcase"
import { BadgeShowcase } from "./sections/BadgeShowcase"
import { CardShowcase } from "./sections/CardShowcase"
import { InputShowcase } from "./sections/InputShowcase"
import { DropdownShowcase } from "./sections/DropdownShowcase"
import { AlertShowcase } from "./sections/AlertShowcase"
import { DialogShowcase } from "./sections/DialogShowcase"
import { LoadingShowcase } from "./sections/LoadingShowcase"
import { StateShowcase } from "./sections/StateShowcase"
import { ToastShowcase } from "./sections/ToastShowcase"

interface ShowcaseSection {
  id: string
  title: string
  description: string
  category: "UI Components" | "State Components" | "Feedback"
  component: React.ComponentType
}

const showcaseSections: ShowcaseSection[] = [
  // UI Components
  {
    id: "button",
    title: "Button",
    description: "Interactive button component with multiple variants and states",
    category: "UI Components",
    component: ButtonShowcase
  },
  {
    id: "badge",
    title: "Badge",
    description: "Small status indicators and labels",
    category: "UI Components", 
    component: BadgeShowcase
  },
  {
    id: "card",
    title: "Card",
    description: "Flexible content containers with headers and footers",
    category: "UI Components",
    component: CardShowcase
  },
  {
    id: "input",
    title: "Input",
    description: "Form input fields with validation states",
    category: "UI Components",
    component: InputShowcase
  },
  {
    id: "dropdown",
    title: "Dropdown Menu",
    description: "Context menus and selection dropdowns",
    category: "UI Components",
    component: DropdownShowcase
  },
  {
    id: "alert",
    title: "Alert",
    description: "Important messages and notifications",
    category: "UI Components",
    component: AlertShowcase
  },
  {
    id: "dialog",
    title: "Alert Dialog",
    description: "Modal dialogs for confirmations and alerts",
    category: "UI Components",
    component: DialogShowcase
  },
  // State Components
  {
    id: "loading",
    title: "Loading States",
    description: "Spinners, progress bars, and skeleton loaders",
    category: "State Components",
    component: LoadingShowcase
  },
  {
    id: "state",
    title: "State Messages",
    description: "Error, success, empty, and not found states",
    category: "State Components",
    component: StateShowcase
  },
  // Feedback
  {
    id: "toast",
    title: "Toast Notifications",
    description: "Temporary notification messages",
    category: "Feedback",
    component: ToastShowcase
  }
]

type ViewportSize = "desktop" | "tablet" | "mobile"

export function ComponentLibrary() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [viewportSize, setViewportSize] = useState<ViewportSize>("desktop")
  const { theme, setTheme } = useTheme()

  // Filter sections based on search and category
  const filteredSections = showcaseSections.filter(section => {
    const matchesSearch = section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         section.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(section.category)
    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(showcaseSections.map(s => s.category)))

  const viewportClasses = {
    desktop: "max-w-6xl",
    tablet: "max-w-4xl",
    mobile: "max-w-sm"
  }

  const viewportIcons = {
    desktop: MonitorSpeaker,
    tablet: Tablet, 
    mobile: Smartphone
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Component Library</h1>
              <p className="text-muted-foreground mt-1">
                Interactive showcase of NomNoms UI components and patterns
              </p>
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {theme === "light" ? <Sun className="h-4 w-4" /> : 
                     theme === "dark" ? <Moon className="h-4 w-4" /> : 
                     <Monitor className="h-4 w-4" />}
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuCheckboxItem 
                    checked={theme === "light"}
                    onCheckedChange={() => setTheme("light")}
                  >
                    Light
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem 
                    checked={theme === "dark"}
                    onCheckedChange={() => setTheme("dark")}
                  >
                    Dark
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem 
                    checked={theme === "system"}
                    onCheckedChange={() => setTheme("system")}
                  >
                    System
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Viewport Size Toggle */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {(() => {
                      const Icon = viewportIcons[viewportSize]
                      return <Icon className="h-4 w-4" />
                    })()}
                    <span className="sr-only">Change viewport size</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuCheckboxItem 
                    checked={viewportSize === "desktop"}
                    onCheckedChange={() => setViewportSize("desktop")}
                  >
                    Desktop
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem 
                    checked={viewportSize === "tablet"}
                    onCheckedChange={() => setViewportSize("tablet")}
                  >
                    Tablet
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem 
                    checked={viewportSize === "mobile"}
                    onCheckedChange={() => setViewportSize("mobile")}
                  >
                    Mobile
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Search and Filter */}
          <div className="flex flex-col gap-3 mt-6 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search components..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Categories {selectedCategories.length > 0 && `(${selectedCategories.length})`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {categories.map(category => (
                  <DropdownMenuCheckboxItem
                    key={category}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedCategories(prev => [...prev, category])
                      } else {
                        setSelectedCategories(prev => prev.filter(c => c !== category))
                      }
                    }}
                  >
                    {category}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`container ${viewportClasses[viewportSize]} mx-auto px-4 py-8`}>
        {/* Results Summary */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {filteredSections.length} component{filteredSections.length !== 1 ? 's' : ''}
            </span>
            {selectedCategories.length > 0 && (
              <div className="flex gap-1">
                {selectedCategories.map(category => (
                  <Badge key={category} variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {searchQuery && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSearchQuery("")}
            >
              Clear search
            </Button>
          )}
        </div>

        {/* Component Sections */}
        {filteredSections.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No components found matching your criteria</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategories([])
                }}
              >
                Clear filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-12">
            {filteredSections.map(section => {
              const Component = section.component
              return (
                <div key={section.id} className="scroll-mt-20" id={section.id}>
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-semibold">{section.title}</h2>
                      <Badge variant="outline">{section.category}</Badge>
                    </div>
                    <p className="text-muted-foreground">{section.description}</p>
                  </div>
                  <Component />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
