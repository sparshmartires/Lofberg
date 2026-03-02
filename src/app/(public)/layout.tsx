import PublicAppHeader from "@/components/layout/PublicAppHeader"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">

      {/* Persistent Header */}
      <PublicAppHeader />

      {/* Page Content */}
      <main className="px-10 py-10 max-[540px]:px-[5px]">
        {children}
      </main>

    </div>
  )
}
