'use client'

import { ThemeProvider, useTheme } from 'next-themes'
import { Toaster } from 'sonner'

function ToasterWithTheme() {
  const { resolvedTheme } = useTheme()
  return (
    <Toaster
      theme={resolvedTheme as 'light' | 'dark'}
      position="bottom-right"
      toastOptions={{
        style: { fontFamily: 'var(--font-inter, system-ui)' },
      }}
    />
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {children}
      <ToasterWithTheme />
    </ThemeProvider>
  )
}
