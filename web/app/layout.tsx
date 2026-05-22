import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { TopNav } from "@/components/layout/TopNav"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Steam 할인 전략 분석 도구",
  description: "Steam 할인 데이터 기반 분석 대시보드 및 전략 진단 도구",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <TopNav />
        <main className="min-h-screen bg-background">{children}</main>
      </body>
    </html>
  )
}
