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
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-stretch gap-8">
          <div className="flex items-center shrink-0">
            <Link href="/" className="text-sm font-bold text-slate-900 whitespace-nowrap">
              Steam <span className="text-blue-600">할인 분석</span>
            </Link>
          </div>
          <nav className="flex items-stretch overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3 flex items-center text-sm transition-colors whitespace-nowrap ${
                  pathname === item.href
                    ? "text-slate-900 font-medium"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {item.label}
                {pathname === item.href && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
