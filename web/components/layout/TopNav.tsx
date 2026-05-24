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
    <header className="sticky top-0 z-50 relative bg-white/95 backdrop-blur-sm">
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent 0%, #6366f1 25%, #3b82f6 50%, #8b5cf6 75%, transparent 100%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-6"
        style={{ background: "linear-gradient(0deg, rgba(99,102,241,0.04) 0%, transparent 100%)" }}
      />
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
