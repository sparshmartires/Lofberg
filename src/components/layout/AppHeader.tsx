"use client"

import * as React from "react"
import { FileText, User } from "lucide-react"
import AppSidebar from "@/components/layout/AppSideBar"
import { Button } from "@/components/ui/button"

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"

const languages = [
  { label: "English", code: "EN" },
  { label: "Swedish", code: "SV" },
  { label: "Norwegian", code: "NO" },
  { label: "Danish", code: "DA" },
  { label: "Finnish", code: "FI" },
  { label: "Polish", code: "PL" },
]


export default function AppHeader() {
  const [language, setLanguage] = React.useState("EN")

  return (
    <header className="w-full bg-primary text-primary-foreground px-10 flex items-center justify-between py-4">

      {/* LEFT SECTION */}
      <div className="flex items-center gap-6">
        <AppSidebar />

        <img
          src="/coffee.png"
          alt="Löfbergs Logo"
          width={125}
          height={40}
        />
      </div>

      {/* RIGHT SECTION (hidden on mobile) */}
      <div className="hidden md:flex items-center gap-4">

        {/* Generate report */}
        <Button
          variant="accent"
          size="md"
          className="gap-2 font-medium px-5 py-3"
        >
          <FileText className="w-4 h-4" />
          Generate report
        </Button>

        {/* Language Select */}
     <Select value={language} onValueChange={setLanguage}>
 <SelectTrigger
  className="
    w-[98px]
    !h-[48px]
    px-[20px]
    py-[14px]
    rounded-[99px]
    border
    border-white
    bg-white
    text-primary
    focus:ring-0
  "
>
 <SelectValue>
  {language}
</SelectValue>

</SelectTrigger>


  <SelectContent
    align="end"
    className="w-[116px] rounded-[10px] p-[10px]"
  >
    {languages.map((lang) => (
      <SelectItem
        key={lang.code}
        value={lang.code}
        className="
          h-[37px]
          rounded-[10px]
          px-[10px]
          py-[10px]
          data-[state=checked]:bg-[#EADCF6]
          data-[state=checked]:text-[#5B2D91]
        "
      >
        {lang.label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>



        {/* User Button (kept simple) */}
        <Button
          variant="outlineBrand"
          size="md"
          className="gap-2 bg-white text-primary hover:bg-white/90 px-5 py-3"
        >
          <User className="w-4 h-4" />
          Admin User
        </Button>

      </div>
    </header>
  )
}
