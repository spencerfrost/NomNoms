"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComponentSection } from "../ComponentSection";
import { Search, Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { useState } from "react";

export function InputShowcase() {
  const [showPassword, setShowPassword] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const codeExample = `import { Input } from "@/components/ui/input";

// Basic input
<Input type="text" placeholder="Enter text..." />

// With label
<label htmlFor="email">Email</label>
<Input id="email" type="email" placeholder="email@example.com" />

// Disabled state
<Input disabled placeholder="Disabled input" />

// With icon (custom implementation)
<div className="relative">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  <Input className="pl-10" placeholder="Search..." />
</div>`;

  return (
    <ComponentSection
      title="Input"
      description="Input component for collecting user input in forms."
      codeExample={codeExample}
    >
      <div className="space-y-8">
        {/* Basic Inputs */}
        <div>
          <h4 className="font-medium mb-4">Basic Inputs</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="text-input" className="text-sm font-medium">
                Text Input
              </label>
              <Input 
                id="text-input"
                type="text" 
                placeholder="Enter some text..." 
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email-input" className="text-sm font-medium">
                Email Input
              </label>
              <Input 
                id="email-input"
                type="email" 
                placeholder="email@example.com" 
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password-input" className="text-sm font-medium">
                Password Input
              </label>
              <Input 
                id="password-input"
                type="password" 
                placeholder="Enter password..." 
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="number-input" className="text-sm font-medium">
                Number Input
              </label>
              <Input 
                id="number-input"
                type="number" 
                placeholder="0" 
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>

        {/* Input States */}
        <div>
          <h4 className="font-medium mb-4">Input States</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Normal State</label>
              <Input placeholder="Normal input" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Disabled State</label>
              <Input disabled placeholder="Disabled input" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">With Value</label>
              <Input defaultValue="Pre-filled value" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Read Only</label>
              <Input readOnly value="Read-only value" />
            </div>
          </div>
        </div>

        {/* Input with Icons */}
        <div>
          <h4 className="font-medium mb-4">Input with Icons</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Input</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  className="pl-10" 
                  placeholder="Search recipes..." 
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Email with Icon</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  className="pl-10" 
                  type="email"
                  placeholder="your@email.com" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Password with Toggle</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  className="pl-10 pr-10" 
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password..." 
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  className="pl-10" 
                  type="tel"
                  placeholder="+1 (555) 000-0000" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Examples */}
        <div>
          <h4 className="font-medium mb-4">Form Examples</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Login Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Login Form</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="login-email" className="text-sm font-medium">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="login-email"
                      className="pl-10" 
                      type="email"
                      placeholder="your@email.com" 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="login-password" className="text-sm font-medium">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="login-password"
                      className="pl-10" 
                      type="password"
                      placeholder="Enter password..." 
                    />
                  </div>
                </div>
                
                <Button className="w-full">Sign In</Button>
              </CardContent>
            </Card>

            {/* Recipe Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recipe Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="recipe-title" className="text-sm font-medium">
                    Recipe Title
                  </label>
                  <Input 
                    id="recipe-title"
                    placeholder="Enter recipe title..." 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="prep-time" className="text-sm font-medium">
                      Prep Time (min)
                    </label>
                    <Input 
                      id="prep-time"
                      type="number"
                      placeholder="15"
                      min="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="servings" className="text-sm font-medium">
                      Servings
                    </label>
                    <Input 
                      id="servings"
                      type="number"
                      placeholder="4"
                      min="1"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="recipe-tags" className="text-sm font-medium">
                    Tags (comma separated)
                  </label>
                  <Input 
                    id="recipe-tags"
                    placeholder="italian, pasta, quick, easy" 
                  />
                </div>
                
                <Button className="w-full">Save Recipe</Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Input Validation States */}
        <div>
          <h4 className="font-medium mb-4">Validation States</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-green-700">
                Valid Input
              </label>
              <Input 
                className="border-green-500 focus:ring-green-500" 
                placeholder="valid@email.com"
                defaultValue="valid@email.com"
              />
              <p className="text-xs text-green-600">✓ Valid email address</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-red-700">
                Invalid Input
              </label>
              <Input 
                className="border-red-500 focus:ring-red-500" 
                placeholder="invalid-email"
                defaultValue="invalid-email"
              />
              <p className="text-xs text-red-600">✗ Please enter a valid email address</p>
            </div>
          </div>
        </div>

        {/* Size Variations */}
        <div>
          <h4 className="font-medium mb-4">Size Variations</h4>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Small Input</label>
              <Input 
                className="h-8 text-sm" 
                placeholder="Small input..." 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Default Input</label>
              <Input 
                placeholder="Default input..." 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Large Input</label>
              <Input 
                className="h-12 text-lg" 
                placeholder="Large input..." 
              />
            </div>
          </div>
        </div>
      </div>
    </ComponentSection>
  );
}
