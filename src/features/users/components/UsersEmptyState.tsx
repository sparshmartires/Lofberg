import { UserPlus } from "lucide-react"

export function UsersEmptyState() {
  return (
    <div className="empty-state-container">

      <div className="empty-state-icon-wrap">
        <UserPlus className="empty-state-icon" />
      </div>

      <p
        className="empty-state-message"
      >
        No users found. Click add “user” to create one
      </p>

    </div>
  )
}
