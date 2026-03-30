"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-[#F4F1F6] p-8">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#EDEDED] p-8 text-center">
          <h2 className="text-2xl font-semibold text-[#1F1F1F] mb-4">
            Something went wrong
          </h2>
          <p className="text-[#747474] mb-6">
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-[#1F1F1F] text-white rounded-full text-sm hover:bg-[#333]"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
