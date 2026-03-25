import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"

type PageHeaderWithActionProps = {
  title: string
  description?: string
  actionLabel?: string
  onActionClick?: () => void
  className?: string
}

export function PageHeaderWithAction({
  title,
  description,
  actionLabel,
  onActionClick,
  className,
}: PageHeaderWithActionProps) {
  return (
    <div
      className={cn(
        "page-header-with-action",
        className,
      )}
    >
      <div>
        <h1 className="page-header-with-action-title">
          {title}
        </h1>

        <p className="page-header-with-action-description">
          {description}
        </p>
      </div>

      {actionLabel && onActionClick ? (
        <Button
          variant="primary"
          onClick={onActionClick}
          className="page-header-with-action-button"
        >
          <Plus className="page-header-with-action-icon" />
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}