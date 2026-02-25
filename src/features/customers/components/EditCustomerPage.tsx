"use client"

import { useEffect, useState } from "react"
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

import { Checkbox } from "@/components/ui/checkbox"

import { useForm, Controller } from "react-hook-form"
import { Save, Upload } from "lucide-react"

interface Customer {
  id: string
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
  logoUrl?: string
}

interface FormValues {
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

interface EditCustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer | null
  onCustomerUpdated: (updated: Customer) => void
}

export function EditCustomerDialog({
  open,
  onOpenChange,
  customer,
  onCustomerUpdated,
}: EditCustomerDialogProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      status: "active",
      isSubCustomer: false,
      logo: null,
    },
  })

  const fieldClass =
    "w-full !h-[44px] rounded-[99px] border border-[#F0F0F0] py-[12px] px-[20px] shadow-[0px_2px_4px_0px_#0000000A] text-body focus:ring-0 focus:outline-none"

  useEffect(() => {
    if (customer) {
      reset({
        customerName: customer.customerName,
        accountCode: customer.accountCode,
        industry: customer.industry,
        serviceTier: customer.serviceTier,
        region: customer.region,
        isSubCustomer: customer.isSubCustomer,
        contactPerson: customer.contactPerson,
        contactEmail: customer.contactEmail,
        contactPhone: customer.contactPhone,
        address: customer.address,
        status: customer.status,
        notes: customer.notes,
        logo: null,
      })
      setLogoPreview(customer.logoUrl || null)
    }
  }, [customer, reset])

  const logoFile = watch("logo")

  useEffect(() => {
    if (logoFile && logoFile.length > 0) {
      const file = logoFile[0]
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [logoFile])

  const onSubmit = (data: FormValues) => {
    const { logo, ...rest } = data

    const updatedCustomer = {
      ...customer,
      ...rest,
    }

    console.log("Customer Updated:", updatedCustomer)
    onCustomerUpdated(updatedCustomer)
    onOpenChange(false)
  }

  if (!customer) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[900px] rounded-[32px] p-10 bg-white max-h-[90vh] overflow-y-auto"
      >
        <div className="space-y-2">
          <DialogTitle className="text-[24px] font-normal">
            Edit Customer
          </DialogTitle>
          <DialogDescription className="text-[14px] text-[#747474]">
            Update customer information in your system
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 mt-6">
          {/* ========================= */}
          {/* CUSTOMER INFORMATION */}
          {/* ========================= */}

          <div className="space-y-6">
            <h3 className="text-lg font-medium">Customer Information</h3>

            <div className="space-y-2">
              <label>Customer Name *</label>
              <Input
                placeholder="Eg. cafe Aroma oslo"
                className={fieldClass}
                {...register("customerName", {
                  required: "Customer name is required",
                })}
              />
              {errors.customerName && (
                <p className="text-xs text-red-500">
                  {errors.customerName.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label>Account Code / ERP ID</label>
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
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="horeca">HoReCa</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <label>Service Tier</label>
                <Controller
                  name="serviceTier"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={fieldClass}>
                        <SelectValue placeholder="Select tier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Type A</SelectItem>
                        <SelectItem value="B">Type B</SelectItem>
                        <SelectItem value="C">Type C</SelectItem>
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
                        <SelectItem value="north">North</SelectItem>
                        <SelectItem value="south">South</SelectItem>
                        <SelectItem value="east">East</SelectItem>
                        <SelectItem value="west">West</SelectItem>
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

          {/* ========================= */}
          {/* CONTACT INFO */}
          {/* ========================= */}

          <div className="space-y-6">
            <h3 className="text-lg font-medium">Contact Information</h3>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label>Contact Person</label>
                <Input
                  placeholder="Add name"
                  className={fieldClass}
                  {...register("contactPerson")}
                />
              </div>

              <div className="space-y-2">
                <label>Contact Email</label>
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

              <div className="space-y-2 col-span-2">
                <label>Contact Phone</label>
                <Input
                  placeholder="Enter phone number"
                  className={fieldClass}
                  {...register("contactPhone")}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <label>Address</label>
                <Input
                  placeholder="Add Address"
                  className={fieldClass}
                  {...register("address")}
                />
              </div>
            </div>
          </div>

          {/* ========================= */}
          {/* ADMIN CONTROLS */}
          {/* ========================= */}

          <div className="space-y-6">
            <h3 className="text-lg font-medium">
              Admin controls / Metadata
            </h3>

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
                <p className="text-xs text-red-500">
                  {errors.status.message}
                </p>
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
          </div>

          {/* ========================= */}
          {/* CUSTOMER LOGO */}
          {/* ========================= */}

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

                  <div
                    className="
                      flex
                      flex-col
                      items-center
                      justify-center
                      text-center
                      px-6
                      py-12
                      rounded-[28px]
                      border-2
                      border-dashed
                      border-[#D9C2F3]
                      bg-[#FAF7FF]
                      transition-colors
                      hover:bg-[#F5EDFF]
                    "
                  >
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo Preview"
                        className="h-20 object-contain mb-4"
                      />
                    ) : (
                      <>
                        <div
                          className="
                            w-14
                            h-14
                            flex
                            items-center
                            justify-center
                            rounded-xl
                            bg-[#F3E8FF]
                            mb-4
                          "
                        >
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
              <Button type="submit" variant="primary" className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Customer
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}