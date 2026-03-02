import { UserPlus } from "lucide-react"

type EmptyStateProps = {
  description: string
}

export function EmptyState({ description }: EmptyStateProps) {
  return (
    <div className="empty-state-container">
      <div className="empty-state-icon-wrap">
        <UserPlus className="empty-state-icon" />
      </div>

      <p className="empty-state-message">{description}</p>
    </div>
  )
}