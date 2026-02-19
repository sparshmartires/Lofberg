"use client"

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"

import { useForm, Controller } from "react-hook-form"
import { Plus } from "lucide-react"

interface AddSalesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FormValues {
  fullName: string
 
  email: string
  role: string
  phone: string
  status: string
  notes: string
}

export function AddSalesDialog({ open, onOpenChange }: AddSalesDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>()

  const onSubmit = (data: FormValues) => {
    console.log("Sale Created:", data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[880px] rounded-[32px] p-10 bg-white"
      >
        {/* HEADER */}
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
            Add Sales Representative
          </DialogTitle>

          <DialogDescription
            className="
              text-[14px]
              leading-[120%]
              tracking-[-0.04em]
              text-[#747474]
            "
          >
            Add a new sales representative
          </DialogDescription>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          {/* GRID */}
           <div className="space-y-2">
              <label className="text-body text-foreground">
                Full Name *
              </label>

              <Input
                placeholder="Enter full name"
                {...register("fullName", {
                  required: "Full name is required",
                })}
              />

              {errors.fullName && (
                <p className="text-xs text-red-500">
                  {errors.fullName.message}
                </p>
              )}
            </div>
          <div className="grid grid-cols-2 gap-6">

            {/* Full Name */}
           

            {/* Last Name */}
        

            {/* Email */}
            <div className="space-y-2">
              <label className="text-body text-foreground">
                Email
              </label>

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

  {errors.email && (
    <p className="text-xs text-red-500">
      {errors.email.message}
    </p>
  )}
            </div>


    {/* Phone */}
            <div className="space-y-2">
              <label className="text-body text-foreground">
                Phone Number
              </label>

              <Input
                type="tel"
                placeholder="+46 70 123 4567"
                {...register("phone")}
              />
            </div>


            {/* Role */}
            <div className="space-y-2">
              <label className="text-body text-foreground">
                Role *
              </label>

              <Controller
                name="role"
                control={control}
                rules={{ required: "Role is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange}>
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
                      <SelectItem value="salesperson">
                        Salesperson
                      </SelectItem>
                      <SelectItem value="admin">
                        Admin
                      </SelectItem>
                      <SelectItem value="manager">
                        Manager
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />

              {errors.role && (
                <p className="text-xs text-red-500">
                  {errors.role.message}
                </p>
              )}
            </div>

        

            {/* Preferred Language */}
            <div className="space-y-2">
              <label className="text-body text-foreground">
                Status
              </label>

              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange}>
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
                      <SelectItem value="active">
                        Active
                      </SelectItem>
                      <SelectItem value="inactive">
                        Inactive
                      </SelectItem>
                    
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

          </div>

         

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-body text-foreground">
              Notes/Comments
            </label>

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

          {/* ACTIONS */}
          <div className="flex justify-center gap-6 pt-6">

            <div className="w-[200px]">
              <Button
                type="button"
                variant="outlineBrand"
                onClick={() => onOpenChange(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </div>

            <div className="w-[200px]">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Sale
              </Button>
            </div>

          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
