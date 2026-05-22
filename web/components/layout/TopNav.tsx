"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/report", label: "Game Report" },
  { href: "/simulator", label: "Simulator" },
  { href: "/methodology", label: "Methodology" },
]

export function TopNav() {
  const pathname = usePathname()

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center gap-6">
          <Link href="/" className="font-semibold text-sm whitespace-nowrap">
            Steam 할인 분석
          </Link>
          <nav className="flex items-center gap-1 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap ${
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
