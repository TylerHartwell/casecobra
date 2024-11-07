import type { Metadata } from "next"
import { Inter, Recursive } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { Toaster } from "@/components/ui/toaster"
import Providers from "@/components/Providers"
import { constructMetadata } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"] })
const recursive = Recursive({ subsets: ["latin"] })

export const metadata: Metadata = constructMetadata()

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={recursive.className}>
        <p className="text-red-600 font-bold text-center">
          Demo Site Notice: Orders placed here will not be processed, and payments will not be charged.
        </p>
        <Navbar />
        <main className="flex flex-col min-h-[calc(100vh-3.5rem-1px)] grainy-light">
          <div className="flex flex-1 flex-col h-full">
            <Providers>{children}</Providers>
          </div>
          <Footer />
        </main>

        <Toaster />
      </body>
    </html>
  )
}
