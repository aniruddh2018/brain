"use client"

import { NavBar } from "@/components/ui/nav-bar"

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* NavBar is already included in the page component */}
      {children}
    </>
  )
} 