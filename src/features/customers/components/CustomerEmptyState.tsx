import { UserPlus } from "lucide-react"

export function CustomerEmptyState() {
  return (
    <div className="empty-state-container">

      <div className="empty-state-icon-wrap">
        <UserPlus className="empty-state-icon" />
      </div>

      <p
        className="empty-state-message"
      >
        No customers found. Click add “customer” to create one
      </p>

    </div>
  )
}
