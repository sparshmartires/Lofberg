import { UserPlus } from "lucide-react"

export function SalesEmptyState() {
  return (
    <div className="empty-state-container">

      <div className="empty-state-icon-wrap">
        <UserPlus className="empty-state-icon" />
      </div>

      <p
        className="empty-state-message"
      >
        No sales rep found. Click add “sales rep” to create one
      </p>

    </div>
  )
}
