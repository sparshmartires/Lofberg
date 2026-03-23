"use client"

import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { Loader2, Plus } from "lucide-react"

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
import styles from "./UserDialogForm.module.css"

export interface DialogRoleOption {
  id: string
  name: string
}

export interface UserFormValues {
  firstName: string
  lastName: string
  email: string
  role: string
  phone: string
  language: string
  password: string
  notes: string
}

interface UserDialogFormProps {
  mode: "add" | "edit"
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues?: UserFormValues
  roleOptions?: DialogRoleOption[]
  isSubmitting?: boolean
  submitError?: string
  onSubmit: (data: UserFormValues) => void
}

const EMPTY_VALUES: UserFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  role: "",
  phone: "",
  language: "",
  password: "",
  notes: "",
}

export function UserDialogForm({
  mode,
  open,
  onOpenChange,
  defaultValues,
  roleOptions = [],
  isSubmitting = false,
  submitError,
  onSubmit,
}: UserDialogFormProps) {
  const values = defaultValues ?? EMPTY_VALUES

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    defaultValues: values,
  })

  useEffect(() => {
    if (open) {
      reset(values)
    }
  }, [open, values, reset])

  const isAddMode = mode === "add"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={styles.dialogContent}
      >
        <div className={styles.header}>
          <DialogTitle className={styles.title}>
            {isAddMode ? "Add new user" : "Edit user details"}
          </DialogTitle>

          <DialogDescription className={styles.description}>
            Enter the user details below.
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.grid}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>First Name *</label>
              <Input
                placeholder="Enter first name"
                {...register("firstName", {
                  required: "First name is required",
                })}
              />
              {errors.firstName && (
                <p className={styles.error}>{errors.firstName.message}</p>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Last Name *</label>
              <Input
                placeholder="Enter last name"
                {...register("lastName", {
                  required: "Last name is required",
                })}
              />
              {errors.lastName && (
                <p className={styles.error}>{errors.lastName.message}</p>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Email</label>
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
              {errors.email && <p className={styles.error}>{errors.email.message}</p>}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Role *</label>
              <Controller
                name="role"
                control={control}
                rules={{ required: "Role is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <SelectTrigger className={styles.selectTrigger}>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>

                    <SelectContent>
                      {roleOptions.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && <p className={styles.error}>{errors.role.message}</p>}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Phone Number</label>
              <Input type="tel" placeholder="+46 70 123 4567" {...register("phone")} />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Preferred Language</label>
              <Controller
                name="language"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <SelectTrigger className={styles.selectTrigger}>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="swedish">Swedish</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Password</label>
            <Input type="password" placeholder="Enter password" {...register("password")} />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Notes/Comments</label>
            <textarea
              rows={4}
              placeholder="Internal notes about this user"
              className={styles.notes}
              {...register("notes")}
            />
          </div>

          {submitError ? <p className={styles.error}>{submitError}</p> : null}

          <div className={styles.actions}>
            <div className={styles.actionWrap}>
              <Button
                type="button"
                variant="outlineBrand"
                onClick={() => onOpenChange(false)}
                className={styles.actionButton}
              >
                Cancel
              </Button>
            </div>

            <div className={styles.actionWrap}>
              <Button type="submit" variant="primary" className={styles.actionButton} disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                {isSubmitting ? "Saving..." : isAddMode ? "Create user" : "Save changes"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}