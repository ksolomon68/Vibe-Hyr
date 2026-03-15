

import { Navbar } from '@/components/layout/Navbar'

export const metadata = {
  title: 'Vibe Hyr — Account',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="pt-[68px] min-h-screen bg-black">
        {children}
      </main>
    </>
  )
}
