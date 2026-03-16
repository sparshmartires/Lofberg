"use client"

import { useCallback, useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { updateStep1 } from "@/store/slices/reportWizardSlice"
import { useGetSalesRepresentativesQuery, useGetLanguagesQuery } from "@/store/services/salesRepresentativesApi"
import { CustomerItem } from "@/store/services/customersApi"
import { CustomerSearchCombobox } from "../CustomerSearchCombobox"
import { FileDropZone } from "../FileDropZone"
import { getCustomerLogoFile, setCustomerLogoFile } from "../../customerLogoRef"
import type { Step1Data } from "../../types"

const fieldClass =
  "w-full !h-[44px] rounded-[99px] border border-[#F0F0F0] py-[12px] px-[20px] shadow-[0px_2px_4px_0px_#0000000A] text-body focus:ring-0 focus:outline-none"

export function Step1CustomerDetails() {
  const dispatch = useAppDispatch()
  const step1 = useAppSelector((state) => state.reportWizard.step1)
  const authUser = useAppSelector((state) => state.auth.user)

  const isSalesperson = authUser?.roles?.includes("Salesperson") ?? false

  const { data: salesRepsData } = useGetSalesRepresentativesQuery(
    { pageNumber: 1, pageSize: 100 },
    { skip: isSalesperson }
  )

  const { data: languagesData } = useGetLanguagesQuery()

  const { control } = useForm<Step1Data>({
    defaultValues: step1,
  })

  // Auto-set salesperson for salesperson role (once)
  useEffect(() => {
    if (isSalesperson && authUser && !step1.salesRepresentativeId) {
      dispatch(updateStep1({
        salesRepresentativeId: authUser.id,
        salesRepresentativeName: `${authUser.firstName} ${authUser.lastName}`,
      }))
    }
  }, [isSalesperson, authUser, step1.salesRepresentativeId, dispatch])

  // Auto-set language from user preference (once)
  useEffect(() => {
    if (authUser?.preferredLanguageId && !step1.languageId) {
      dispatch(updateStep1({ languageId: authUser.preferredLanguageId }))
    }
  }, [authUser?.preferredLanguageId, step1.languageId, dispatch])

  const handleCustomerSelect = useCallback(
    (customer: CustomerItem) => {
      dispatch(updateStep1({
        customerId: customer.id,
        customerName: customer.name,
        customerAccountCode: customer.accountCode ?? "",
        customerEmail: customer.contactEmail ?? "",
        customerPhone: customer.contactPhone ?? "",
        customerSegment: customer.segmentName ?? "",
        customerType: customer.serviceTier ? `Type ${customer.serviceTier === 1 ? "A" : "B"}` : "",
        customerLogoUrl: customer.logoUrl ?? null,
      }))
    },
    [dispatch]
  )

  const handleCustomerClear = useCallback(() => {
    dispatch(updateStep1({
      customerId: null,
      customerName: "",
      customerAccountCode: "",
      customerEmail: "",
      customerPhone: "",
      customerSegment: "",
      customerType: "",
      customerLogoUrl: null,
    }))
  }, [dispatch])

  const handleLogoChange = useCallback(
    (file: File | null) => {
      setCustomerLogoFile(file)
      const logoUrl = file ? URL.createObjectURL(file) : null
      dispatch(updateStep1({ customerLogoUrl: logoUrl }))
    },
    [dispatch]
  )

  const salesReps = salesRepsData?.items ?? []
  const languages = languagesData ?? []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#1F1F1F]">Customer and report details</h2>
        <p className="text-sm text-[#747474] mt-1">
          Fill in the form fields below to create a new sustainable offer!
        </p>
      </div>

      {/* Customer Name + Salesperson */}
      <div className="grid grid-cols-1 min-[700px]:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[#1F1F1F]">Customer name</label>
            <button type="button" className="text-sm font-medium text-primary underline">
              Add customer
            </button>
          </div>
          <CustomerSearchCombobox
            value={step1.customerName}
            selectedCustomerId={step1.customerId}
            onSelect={handleCustomerSelect}
            onClear={handleCustomerClear}
          />
        </div>

        {/* Salesperson */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#1F1F1F]">Salesperson</label>
          {isSalesperson ? (
            <Input
              value={step1.salesRepresentativeName}
              disabled
              className={fieldClass}
            />
          ) : (
            <Controller
              name="salesRepresentativeId"
              control={control}
              render={({ field }) => (
                <Select
                  value={step1.salesRepresentativeId || field.value}
                  onValueChange={(val) => {
                    field.onChange(val)
                    const rep = salesReps.find((r) => r.id === val)
                    if (rep) {
                      dispatch(updateStep1({
                        salesRepresentativeId: val,
                        salesRepresentativeName: `${rep.firstName} ${rep.lastName}`,
                      }))
                    }
                  }}
                >
                  <SelectTrigger className={fieldClass}>
                    <SelectValue placeholder="Select a salesperson" />
                  </SelectTrigger>
                  <SelectContent>
                    {salesReps.map((rep) => (
                      <SelectItem key={rep.id} value={rep.id}>
                        {rep.firstName} {rep.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          )}
        </div>

        {/* Report Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#1F1F1F]">Report date</label>
          <Controller
            name="reportDate"
            control={control}
            render={({ field }) => (
              <Input
                type="date"
                value={toDateInputValue(step1.reportDate || field.value)}
                onChange={(e) => {
                  const val = e.target.value
                  const formatted = fromDateInputValue(val)
                  field.onChange(formatted)
                  dispatch(updateStep1({ reportDate: formatted }))
                }}
                className={fieldClass}
              />
            )}
          />
        </div>

        {/* Language */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#1F1F1F]">Language</label>
          <Controller
            name="languageId"
            control={control}
            render={({ field }) => (
              <Select
                value={step1.languageId || field.value}
                onValueChange={(val) => {
                  field.onChange(val)
                  dispatch(updateStep1({ languageId: val }))
                }}
              >
                <SelectTrigger className={fieldClass}>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.id} value={lang.id}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {/* Customer Logo */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#1F1F1F]">Customer logo (optional)</label>
        <FileDropZone
          accept=".png,.jpg,.jpeg,.svg"
          acceptLabel="PNG, JPG or SVG recommended"
          file={getCustomerLogoFile()}
          previewUrl={step1.customerLogoUrl}
          onFileChange={handleLogoChange}
        />
      </div>
    </div>
  )
}

// Date helpers: convert between dd/mm/yyyy and yyyy-mm-dd
function toDateInputValue(ddmmyyyy: string): string {
  const parts = ddmmyyyy.split("/")
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`
  }
  return ddmmyyyy
}

function fromDateInputValue(yyyymmdd: string): string {
  const parts = yyyymmdd.split("-")
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return yyyymmdd
}
