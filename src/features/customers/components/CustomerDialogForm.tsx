"use client"

import { Control, Controller, FieldErrors, UseFormRegister, UseFormTrigger, useWatch } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatPhoneDisplay } from "@/lib/phone"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Save, Upload, X } from "lucide-react"
import Image from "next/image"
import { useGetCustomersQuery } from "@/store/services/customersApi"

export interface CustomerFormValues {
  customerName: string
  accountCode: string
  industry: string
  serviceTier: string
  region: string
  isSubCustomer: boolean
  parentCustomerId: string
  contactPerson: string
  contactEmail: string
  contactPhone: string
  address: string
  status: string
  notes: string
  logo: FileList | null
}

interface CustomerDialogFormProps {
  mode: "add" | "edit"
  control: Control<CustomerFormValues>
  register: UseFormRegister<CustomerFormValues>
  errors: FieldErrors<CustomerFormValues>
  trigger?: UseFormTrigger<CustomerFormValues>
  segmentOptions: Array<{ id: string; name: string }>
  regionOptions: Array<{ id: string; name: string }>
  logoPreview?: string | null
  onLogoRemove?: () => void
  submitError?: string
  isSubmitting?: boolean
  onCancel: () => void
  hideActions?: boolean
}

const fieldClass =
  "w-full !h-[44px] rounded-[99px] border border-[#F0F0F0] py-[12px] px-[20px] shadow-[0px_2px_4px_0px_#0000000A] text-body focus:ring-0 focus:outline-none"

export function CustomerDialogForm({
  mode,
  control,
  register,
  errors,
  trigger,
  segmentOptions,
  regionOptions,
  logoPreview,
  onLogoRemove,
  submitError,
  isSubmitting = false,
  onCancel,
  hideActions = false,
}: CustomerDialogFormProps) {
  const isSubCustomer = useWatch({ control, name: "isSubCustomer" })
  const { data: parentOptions } = useGetCustomersQuery(
    { pageNumber: 1, pageSize: 200, isActive: true },
    { skip: !isSubCustomer }
  )

  return (
    <div className="space-y-8 mt-6">
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Customer information</h3>

        <div className="space-y-2">
          <label>Customer name</label>
          <Input
            placeholder="Eg. Cafe Aroma Oslo"
            className={fieldClass}
            {...register("customerName", {
              required: "Customer name is required",
            })}
          />
          {errors.customerName && (
            <p className="text-xs text-red-500">{errors.customerName.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 min-[700px]:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label>Account code / ERP ID</label>
            <Input
              placeholder="CA-001"
              className={fieldClass}
              {...register("accountCode")}
            />
          </div>

          <div className="space-y-2">
            <label>Market segment</label>
            <Controller
              name="industry"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={fieldClass}>
                    <SelectValue placeholder="Select segment" />
                  </SelectTrigger>
                  <SelectContent>
                    {segmentOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <label>Service tier</label>
            <Controller
              name="serviceTier"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={fieldClass}>
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Type A</SelectItem>
                    <SelectItem value="2">Type B</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <label>Region</label>
            <Controller
              name="region"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={fieldClass}>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regionOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Controller
            name="isSubCustomer"
            control={control}
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <label>Sub-customer</label>
        </div>

        {isSubCustomer && (
          <div className="space-y-2">
            <label>Parent customer</label>
            <Controller
              name="parentCustomerId"
              control={control}
              rules={{ required: isSubCustomer ? "Parent customer is required" : false }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={fieldClass}>
                    <SelectValue placeholder="Select parent customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {(parentOptions?.items ?? [])
                      .filter((c) => !c.isSubCustomer)
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.parentCustomerId && (
              <p className="text-xs text-red-500">{errors.parentCustomerId.message}</p>
            )}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-medium">Contact information</h3>

        <div className="grid grid-cols-1 min-[700px]:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label>Contact person</label>
            <Input
              placeholder="Add name"
              className={fieldClass}
              {...register("contactPerson")}
            />
          </div>

          <div className="space-y-2">
            <label>Contact email</label>
            <Input
              type="email"
              placeholder="Enter email"
              className={fieldClass}
              {...register("contactEmail", {
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
              })}
              onBlur={() => trigger?.("contactEmail")}
            />
            {errors.contactEmail && (
              <p className="text-xs text-red-500">
                {errors.contactEmail.message}
              </p>
            )}
          </div>

          <div className="space-y-2 min-[700px]:col-span-2">
            <label>Contact phone</label>
            <Controller
              name="contactPhone"
              control={control}
              rules={{
                validate: (val) => {
                  if (!val) return true
                  const digits = val.replace(/\D/g, "")
                  return digits.length >= 10 || "Phone number must be at least 10 digits"
                },
              }}
              render={({ field }) => (
                <Input
                  type="tel"
                  placeholder="+XX XXXXX XXXXX"
                  className={fieldClass}
                  value={formatPhoneDisplay(field.value)}
                  onChange={(e) => field.onChange(e.target.value.replace(/\D/g, "").slice(0, 12))}
                  onBlur={() => trigger?.("contactPhone")}
                />
              )}
            />
            {errors.contactPhone && (
              <p className="text-xs text-red-500">{errors.contactPhone.message}</p>
            )}
          </div>

          <div className="space-y-2 min-[700px]:col-span-2">
            <label>Address</label>
            <Input
              placeholder="Add address"
              className={fieldClass}
              {...register("address")}
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label>Status</label>
          <Controller
            name="status"
            control={control}
            rules={{ required: "Status is required" }}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className={fieldClass}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Archived</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.status && (
            <p className="text-xs text-red-500">{errors.status.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label>Notes / comments</label>
          <textarea
            rows={4}
            placeholder="Internal admin notes"
            className="w-full rounded-[24px] border border-[#F0F0F0] py-[12px] px-[20px] shadow-[0px_2px_4px_0px_#0000000A] text-body resize-none focus:outline-none"
            {...register("notes")}
          />
        </div>

        <div className="space-y-4">
          <label>Customer logo</label>

          <Controller
            name="logo"
            control={control}
            render={({ field }) => (
              <div className="relative">
                {logoPreview ? (
                  <div className="relative inline-block">
                    <Image
                      src={logoPreview}
                      alt="Logo preview"
                      width={160}
                      height={80}
                      className="h-20 w-auto object-contain rounded-lg border border-[#F0F0F0] p-2"
                      unoptimized
                    />
                    {onLogoRemove && (
                      <button
                        type="button"
                        onClick={onLogoRemove}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full border border-[#D1D5DB] text-[#D1D5DB] flex items-center justify-center hover:border-[#9CA3AF] hover:text-[#9CA3AF] bg-white"
                      >
                        <X className="h-3 w-3" strokeWidth={2} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.svg"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={(e) => field.onChange(e.target.files)}
                    />
                    <div className="flex flex-col items-center justify-center text-center px-6 py-12 rounded-[28px] border-2 border-dashed border-[#D9C2F3] bg-[#FAF7FF] transition-colors hover:bg-[#F5EDFF]">
                      <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-[#F3E8FF] mb-4">
                        <Upload className="h-6 w-6 text-[#6B21A8]" />
                      </div>
                      <p className="text-[15px] font-medium text-[#374151]">
                        Upload a file or drag and drop
                      </p>
                      <p className="text-sm text-[#9CA3AF] mt-1">
                        PNG, JPG or SVG recommended
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          />
        </div>
      </div>

      {submitError ? (
        <p className="text-sm text-destructive">{submitError}</p>
      ) : null}

      {!hideActions && (
        <div className="flex justify-center gap-6 pt-6 max-[600px]:gap-2">
          <div className="w-[200px] max-[600px]:w-auto max-[600px]:flex-1 min-w-0">
            <Button
              type="button"
              variant="outlineBrand"
              onClick={onCancel}
              disabled={isSubmitting}
              className="w-full px-[20px] py-[10px]"
            >
              Cancel
            </Button>
          </div>

          <div className="w-[200px] max-[600px]:w-auto max-[600px]:flex-1 min-w-0">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="w-full px-[20px] py-[10px]"
            >
              {isSubmitting ? (
                mode === "add" ? "Adding..." : "Saving..."
              ) : mode === "add" ? (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add customer
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save changes
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
