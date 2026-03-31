"use client"

import { useRouter } from "next/navigation"

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#EDEDED] p-8 text-center">
        <h2 className="text-2xl font-semibold text-[#1F1F1F] mb-4">
          Something went wrong
        </h2>
        <p className="text-[#747474] mb-6">
          An error occurred while loading this page. Please try again.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-2.5 border border-[#EDEDED] rounded-full text-sm hover:bg-[#F9F9F9]"
          >
            Dashboard
          </button>
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-[#1F1F1F] text-white rounded-full text-sm hover:bg-[#333]"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  )
}
