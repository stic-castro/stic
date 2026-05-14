'use client'

import Footer from '@/components/UI/Footer'
import '../styles/globals.css'
import Header from '@/components/UI/Header'
import { ReactNode } from 'react'
import { usePathname } from 'next/navigation' 

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup') 

  return (
    <html lang="es">
      <body>
      { <Header />}
      <main>{children}</main>
        {!isAuthPage && <Footer />}
      </body>
    </html>
  )
}
