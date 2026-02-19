"use client"

import * as React from "react"
import Image from "next/image"
import { Menu, FileText, ChevronDown, User } from "lucide-react"
import coffeeLogo from "@/public/coffee.png"
import { Button } from "@/components/ui/button"

export default function AppHeader() {
  const [isLangOpen, setIsLangOpen] = React.useState(false)
  const [isUserOpen, setIsUserOpen] = React.useState(false)

  return (
    <header className="w-full bg-primary text-primary-foreground px-10 flex items-center justify-between" style={{ paddingTop: "16px", paddingBottom: "16px" }}>
      
      {/* LEFT SECTION */}
      <div className="flex items-center gap-6">
        
        {/* Hamburger */}
        <button
          aria-label="Open menu"
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary/90 transition"
        >
          <Menu className="w-6 h-6 text-accent" />
        </button>

        {/* Logo */}
    <img
  src="/coffee.png"
  alt="Löfbergs Logo"
   width={125}
  height={40}
/>

      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-4">

        {/* Generate report */}
        <Button
          variant="accent"
          size="md"
          className="gap-2 font-medium px-5 py-3"
        >
          <FileText className="w-4 h-4" />
          Generate report
        </Button>

        {/* Language selector */}
        <div className="relative">
          <Button
            variant="outlineBrand"
            size="md"
            className="gap-2 bg-white text-primary hover:bg-white/90 px-5 py-3"
            onClick={() => setIsLangOpen(!isLangOpen)}
          >
            EN
            <ChevronDown className="w-4 h-4" />
          </Button>

          {isLangOpen && (
            <div className="absolute right-0 mt-2 w-24 rounded-md bg-card shadow-lg border border-border overflow-hidden z-50">
              {["EN", "SV"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setIsLangOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 text-body hover:bg-muted"
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User dropdown */}
        <div className="relative">
          <Button
            variant="outlineBrand"
            size="md"
            className="gap-2 bg-white text-primary hover:bg-white/90 px-5 py-3"
            onClick={() => setIsUserOpen(!isUserOpen)}
          >
            <User className="w-4 h-4" />
            Admin User
            <ChevronDown className="w-4 h-4" />
          </Button>

          {isUserOpen && (
            <div className="absolute right-0 mt-2 w-40 rounded-md bg-card shadow-lg border border-border overflow-hidden z-50">
              <button className="w-full text-left px-4 py-2 text-body hover:bg-muted">
                Profile
              </button>
              <button className="w-full text-left px-4 py-2 text-body hover:bg-muted">
                Settings
              </button>
              <button className="w-full text-left px-4 py-2 text-body hover:bg-muted text-destructive">
                Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  )
}
