import  AppHeader  from "@/components/layout/AppHeader"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">

      {/* Persistent Header */}
      <AppHeader />

      {/* Page Content */}
      <main className="px-10 py-10">
        {children}
      </main>

    </div>
  )
}
