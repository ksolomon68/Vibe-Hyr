"use client";

export const dynamic = "force-dynamic";

import { ComingSoonModule } from '@/components/shared/ComingSoonModule'
import { PlayerTopbar } from '@/components/shared/PlayerTopbar'

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <PlayerTopbar 
        vertical="personal"
        verticalLabel="SYSTEM"
        contentTitle="Reality Under Construction"
        completionPct={0}
        onToggleSidebar={() => {}}
        breadcrumb={{
          label: 'System',
          href: '/'
        }}
      />
      <main className="flex-1 flex flex-col justify-center">
        <ComingSoonModule 
          title="Module Mapping in Progress"
          subtitle="We are currently architecting this portion of the platform. Check back soon for the full expansion."
          backLink="/"
        />
      </main>
    </div>
  )
}
