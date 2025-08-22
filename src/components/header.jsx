'use client'

import Link from "next/link"
import { Button } from "./ui/button"
import { ModeToggle } from "./ui/theme-toggle"
import { useTheme } from "next-themes"

const Header = () => {
     const { theme } = useTheme()
  return (
    <header className={`${theme == "dark" ? "navbar-dark" : "navbar-light"} w-full flex justify-between items-center z-40 py-3.5 border-b`}>
      <div className="my-container mx-auto flex justify-between items-center">
        <h1 className="text-[13px] font-semibold">
          <Link href="/" className="flex gap-1 items-center">
            <img src="/images/logo.png" alt="" className="w-16 ms-5" />
            <span className="rounded-sm py-1">
              MEDICRYPT
            </span>
          </Link>
        </h1>

        <div className="flex -ml-40 lg:gap-5 items-center">
          <nav className="hidden lg:flex space-x-5 text-xs">
            <Link href="/" className="hover:text-gray-200">Home</Link>
            <Link href="/dashboard" className="hover:text-gray-200">Dashboard</Link>
            <Link href="/statistics" className="hover:text-gray-200">Statistics</Link>
            <Link href="/students" className="hover:text-gray-200">Students</Link>
          </nav>
          |
          <div className="flex gap-2  items-center">
            <Link href="/login" className="hover:text-gray-200">
              <Button variant='outline'>Login</Button>
            </Link>
            <Link href="/signup" className="hover:text-gray-200">
              <Button>Sign Up</Button>
            </Link>
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
