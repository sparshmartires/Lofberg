"use client"

import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { Plus } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface SalesFormValues {
  fullName: string
  email: string
  role: string
  phone: string
  status: string
  notes: string
}

interface SalesDialogFormProps {
  mode: "add" | "edit"
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues?: SalesFormValues
  onSubmit: (data: SalesFormValues) => void
}

const EMPTY_VALUES: SalesFormValues = {
  fullName: "",
  email: "",
  role: "",
  phone: "",
  status: "",
  notes: "",
}

export function SalesDialogForm({
  mode,
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
}: SalesDialogFormProps) {
  const values = defaultValues ?? EMPTY_VALUES
  const isAddMode = mode === "add"

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<SalesFormValues>({
    defaultValues: values,
  })

  useEffect(() => {
    if (open) {
      reset(values)
    }
  }, [open, values, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[calc(100%-2rem)] max-w-[880px] rounded-[32px] p-10 bg-white max-[600px]:p-8 max-[600px]:max-h-[calc(100vh-2rem)] max-[600px]:overflow-y-auto"
      >
        <div className="space-y-2">
          <DialogTitle
            className="
              text-[24px]
              leading-[120%]
              tracking-[-0.04em]
              font-normal
              text-[#1F1F1F]
            "
          >
            {isAddMode ? "Add Sales Representative" : "Edit Sales Representative"}
          </DialogTitle>

          <DialogDescription
            className="
              text-[14px]
              leading-[120%]
              tracking-[-0.04em]
              text-[#747474]
            "
          >
            {isAddMode
              ? "Add a new sales representative"
              : "Edit the details of the sales representative."}
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <div className="space-y-2">
            <label className="text-body text-foreground">Full Name *</label>

            <Input
              placeholder="Enter full name"
              {...register("fullName", {
                required: "Full name is required",
              })}
            />

            {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
          </div>

          <div className="grid grid-cols-2 max-[600px]:grid-cols-1 gap-6 [&>*]:min-w-0">
            <div className="space-y-2">
              <label className="text-body text-foreground">Email</label>

              <Input
                type="email"
                placeholder="email@lofberg.se"
                {...register("email", {
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please enter a valid email address",
                  },
                })}
              />

              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-body text-foreground">Phone Number</label>

              <Input type="tel" placeholder="+46 70 123 4567" {...register("phone")} />
            </div>

            <div className="space-y-2">
              <label className="text-body text-foreground">Role *</label>

              <Controller
                name="role"
                control={control}
                rules={{ required: "Role is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <SelectTrigger
                      className="
                        w-full
                        !h-[44px]
                        rounded-[99px]
                        border border-[#F0F0F0]
                        py-[12px]
                        px-[20px]
                        mb-0
                        shadow-[0px_2px_4px_0px_#0000000A]
                        text-body
                        focus:ring-0
                      "
                    >
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="salesperson">Salesperson</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />

              {errors.role && <p className="text-xs text-red-500">{errors.role.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-body text-foreground">Status</label>

              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <SelectTrigger
                      className="
                        w-full
                        !h-[44px]
                        rounded-[99px]
                        border border-[#F0F0F0]
                        py-[12px]
                        px-[20px]
                        mb-0
                        shadow-[0px_2px_4px_0px_#0000000A]
                        text-body
                        focus:ring-0
                      "
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-body text-foreground">Notes/Comments</label>

            <textarea
              rows={4}
              placeholder="Internal notes about this sale"
              className="
                w-full
                rounded-[20px]
                border border-[#F0F0F0]
                p-4
                shadow-[0px_2px_4px_0px_#0000000A]
                text-body
                resize-none
              "
              {...register("notes")}
            />
          </div>

          <div className="flex justify-center gap-6 pt-6 max-[600px]:gap-2">
            <div className="w-[200px] max-[600px]:w-auto max-[600px]:flex-1 min-w-0">
              <Button
                type="button"
                variant="outlineBrand"
                onClick={() => onOpenChange(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </div>

            <div className="w-[200px] max-[600px]:w-auto max-[600px]:flex-1 min-w-0">
              <Button type="submit" variant="primary" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                {isAddMode ? "Create Sale" : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
