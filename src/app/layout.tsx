import type { Metadata } from "next"
import { Fredoka } from "next/font/google"
import "./globals.css"
import type React from "react"

const fredoka = Fredoka({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Memory Match Game",
  description: "A fun memory game built with Next.js and React",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={fredoka.className}>{children}</body>
    </html>
  )
}
