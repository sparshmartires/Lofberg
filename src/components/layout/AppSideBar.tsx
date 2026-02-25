"use client"

import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetClose,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function AppSidebar() {
    const pathname = usePathname()

    const menuItems = [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Generate Report/Receipt", href: "#" },
        { label: "Historical reports", href: "#" },
        { label: "Customer Management", href: "/customers" },
        { label: "Sales Representative", href: "/sales" },
        { label: "User Management", href: "/users" },
        { label: "Report receipt template", href: "#" },
        { label: "Useful resources", href: "#" },
        { label: "Conversion logic", href: "#" },
    ]

    return (
        <Sheet>
            {/* Hamburger Trigger */}
            <SheetTrigger asChild>
                <button
                    aria-label="Open menu"
                    className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary/90 transition"
                >
                    <Menu className="w-6 h-6 text-accent" />
                </button>
            </SheetTrigger>

            <SheetContent
                side="left"
                showCloseButton={false}
                className="
  w-full
  md:w-[423px]
  md:min-w-[423px]
  bg-[#3C1053]
  text-white
  border-none
  p-0
"

            >
                <SheetHeader>
    <SheetTitle className="sr-only">
      Main Navigation
    </SheetTitle>
  </SheetHeader>
                {/* HEADER (no separator) */}
                <div className="flex items-center gap-6 px-8 ">

                    {/* Custom Close Button */}
                    <SheetClose asChild>
                        <button
                            aria-label="Close menu"
                            className="flex items-center justify-center w-8 h-8"
                        >
                            <X className="w-6 h-6 text-accent" />
                        </button>
                    </SheetClose>

                    {/* Coffee Logo */}
                    <img
                        src="/coffee.png"
                        alt="Löfbergs Logo"
                        width={125}
                        height={40}
                    />
                </div>

                {/* MENU */}
                <div className="px-8 py-8">
                    <nav className="flex flex-col gap-4">

                        {menuItems.map((item) => {
                            const isActive = pathname === item.href

                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={`
                    flex items-center
                    ${isActive
                                            ? `
                          w-full md:w-[356px]
                          h-[53px]
                          rounded-[8px]
                          px-[16px]
                          gap-[10px]
                          bg-accent
                          text-primary
                          font-medium
                        `
                                            : `
                          text-white
                          px-[16px]
                          py-[8px]
                          hover:text-accent
                        `
                                        }
                  `}
                                >
                                    {item.label}
                                </Link>
                            )
                        })}

                    </nav>
                </div>

            </SheetContent>
        </Sheet>
    )
}
