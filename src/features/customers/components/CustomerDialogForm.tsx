"use client"

import { Control, Controller, FieldErrors, UseFormRegister } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Save, Upload } from "lucide-react"
import Image from "next/image"

export interface CustomerFormValues {
  customerName: string
  accountCode: string
  industry: string
  serviceTier: string
  region: string
  isSubCustomer: boolean
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
  segmentOptions: Array<{ id: string; name: string }>
  regionOptions: Array<{ id: string; name: string }>
  logoPreview?: string | null
  submitError?: string
  isSubmitting?: boolean
  onCancel: () => void
}

const fieldClass =
  "w-full !h-[44px] rounded-[99px] border border-[#F0F0F0] py-[12px] px-[20px] shadow-[0px_2px_4px_0px_#0000000A] text-body focus:ring-0 focus:outline-none"

export function CustomerDialogForm({
  mode,
  control,
  register,
  errors,
  segmentOptions,
  regionOptions,
  logoPreview,
  submitError,
  isSubmitting = false,
  onCancel,
}: CustomerDialogFormProps) {
  return (
    <div className="space-y-8 mt-6">
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Customer information</h3>

        <div className="space-y-2">
          <label>Customer name *</label>
          <Input
            placeholder="Eg. cafe Aroma oslo"
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
            <label>Industry / Segment</label>
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
          <label>Enable as subcustomer</label>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-medium">Contact Information</h3>

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
              placeholder="Enter email id"
              className={fieldClass}
              {...register("contactEmail", {
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.contactEmail && (
              <p className="text-xs text-red-500">
                {errors.contactEmail.message}
              </p>
            )}
          </div>

          <div className="space-y-2 min-[700px]:col-span-2">
            <label>Contact phone</label>
            <Input
              placeholder="Enter phone number"
              className={fieldClass}
              {...register("contactPhone")}
            />
          </div>

          <div className="space-y-2 min-[700px]:col-span-2">
            <label>Address</label>
            <Input
              placeholder="Add Address"
              className={fieldClass}
              {...register("address")}
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-medium">Admin controls / Metadata</h3>

        <div className="space-y-2">
          <label>Status *</label>
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
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.status && (
            <p className="text-xs text-red-500">{errors.status.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label>Notes / Comments</label>
          <textarea
            rows={4}
            placeholder="Internal admin notes"
            className="w-full rounded-[24px] border border-[#F0F0F0] py-[12px] px-[20px] shadow-[0px_2px_4px_0px_#0000000A] text-body resize-none focus:outline-none"
            {...register("notes")}
          />
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-[#1F1F1F]">
              Customer logo
            </h3>
            <p className="text-sm text-[#747474] mt-1">Upload Logo</p>
          </div>

          <Controller
            name="logo"
            control={control}
            render={({ field }) => (
              <div className="relative">
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.svg"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => field.onChange(e.target.files)}
                />

                <div className="flex flex-col items-center justify-center text-center px-6 py-12 rounded-[28px] border-2 border-dashed border-[#D9C2F3] bg-[#FAF7FF] transition-colors hover:bg-[#F5EDFF]">
                  {logoPreview ? (
                    <Image
                      src={logoPreview}
                      alt="Logo Preview"
                      width={160}
                      height={80}
                      className="h-20 w-auto object-contain mb-4"
                      unoptimized
                    />
                  ) : (
                    <>
                      <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-[#F3E8FF] mb-4">
                        <Upload className="h-6 w-6 text-[#6B21A8]" />
                      </div>
                      <p className="text-[15px] font-medium text-[#374151]">
                        Upload a File or Drag and Drop
                      </p>
                      <p className="text-sm text-[#9CA3AF] mt-1">
                        PNG, JPG or SVG recommended
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          />
        </div>
      </div>

      {submitError ? (
        <p className="text-sm text-destructive">{submitError}</p>
      ) : null}

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
                Add Customer
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Customer
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
