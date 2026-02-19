import { UserPlus } from "lucide-react"

export function SalesEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">

      <div className="h-12 w-12 flex items-center justify-center rounded-full bg-[#59187B]/10">
        <UserPlus className="h-6 w-6 text-[#59187B]" />
      </div>

      <p
        className="
          text-[18px]
          leading-[120%]
          tracking-[0em]
          font-normal
          text-[#59187B]
          text-center
        "
      >
        No sales rep found. Click add “sales rep” to create one
      </p>

    </div>
  )
}
