"use client"

import { useRouter } from "next/navigation"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F1F6] p-8">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#EDEDED] p-8 text-center">
        <h2 className="text-2xl font-semibold text-[#1F1F1F] mb-4">
          Something went wrong
        </h2>
        <p className="text-[#747474] mb-6">
          An unexpected error occurred. Please try again or go back.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.back()}
            className="px-6 py-2.5 border border-[#EDEDED] rounded-full text-sm hover:bg-[#F9F9F9]"
          >
            Go back
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
