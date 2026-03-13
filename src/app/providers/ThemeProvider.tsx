'use client'
import { createContext, useContext } from 'react'

// Light mode removed — site is dark-only.
const ThemeContext = createContext({ theme: 'dark' as const, toggleTheme: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeContext.Provider value={{ theme: 'dark', toggleTheme: () => {} }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
