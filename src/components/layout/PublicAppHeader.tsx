"use client"

import Link from "next/link"

export default function PublicAppHeader() {
  return (
   <header className="w-full bg-primary text-primary-foreground px-10 flex items-center justify-between" style={{ paddingTop: "16px", paddingBottom: "16px" }}>
      <Link href="/login">
        <img
          src="/coffee.png"
          alt="Löfbergs Logo"
          width={125}
          height={40}
        />
      </Link>
    </header>
  )
}
