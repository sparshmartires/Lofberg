"use client"

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { SuccessIcon } from "@/icons/success"
import { DisclaimerIcon } from "@/icons/disclaimer"


type FeedbackDialogType = "success" | "error"

interface FeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: FeedbackDialogType
  title: string
  description?: string
  primaryActionLabel?: string
  onPrimaryAction?: () => void
  primaryActionLoading?: boolean
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  secondaryActionLoading?: boolean
}

export function UserFeedbackDialog({
  open,
  onOpenChange,
  type,
  title,
  description,
  primaryActionLabel,
  onPrimaryAction,
  primaryActionLoading = false,
  secondaryActionLabel,
  onSecondaryAction,
  secondaryActionLoading = false,
}: FeedbackDialogProps) {
  const isSuccess = type === "success"

  return (
   <Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent
    className="
      max-w-[440px]
      rounded-[32px]
      p-12
      text-center
      border-none
    "
    showCloseButton={false}
  >
    {/* ICON */}
    <div className="flex justify-center">
      <div
        className={`flex items-center justify-center h-20 w-20 rounded-full
          `}
      >
        {isSuccess ? (
           <SuccessIcon className="h-20 w-20 text-[#6CBA4D]" />
        ) : (
          <DisclaimerIcon className="h-20 w-20 text-[#E8C12B]" />
        )}
      </div>
    </div>

    {/* TITLE (Accessible) */}
    <DialogTitle
  className={`
    leading-[120%]
    text-display-lg
    text-foreground
    text-center
    mx-auto
    ${isSuccess ? "" : "max-w-[520px]"}
  `}
>
  {title}
</DialogTitle>

    {/* DESCRIPTION (Accessible) */}
    {description && (
      <DialogDescription className="text-body text-muted-foreground max-w-[520px] mx-auto">
        {description}
      </DialogDescription>
    )}

    {/* ACTIONS */}
    <div
      className={`flex justify-center gap-6 ${
        secondaryActionLabel ? "flex-row" : "flex-col items-center"
      }`}
    >
      {secondaryActionLabel && onSecondaryAction && (
        <Button
        style={{width:"147px"}}
          variant="outlineBrand"
           className="px-[20px] py-[10px]"
          onClick={onSecondaryAction}
          disabled={secondaryActionLoading}
        >
          {secondaryActionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          {secondaryActionLabel}
        </Button>
      )}

    {primaryActionLabel && (
      <Button
        variant="primary" size="sm"
        className="px-[20px] py-[10px]"
        onClick={onPrimaryAction}
        disabled={primaryActionLoading}
      >
        {primaryActionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
        {primaryActionLabel}
      </Button>
    )}

    {!primaryActionLabel && (
      <Button
        variant="primary" size="sm"
        className="px-[20px] py-[10px]"
        onClick={() => onOpenChange(false)}
      >
        Ok
      </Button>
    )}
    </div>
  </DialogContent>
</Dialog>
  )
}
