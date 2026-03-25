"use client"

import { useCallback, useEffect, useRef, useState } from "react"
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
import { useGetTemplateLanguagesQuery } from "@/store/services/templatesApi"
import { CustomerItem, useGetCustomerSegmentsQuery } from "@/store/services/customersApi"
import { CustomerSearchCombobox } from "../CustomerSearchCombobox"
import { SalespersonSearchCombobox } from "../SalespersonSearchCombobox"
import { FileDropZone } from "../FileDropZone"
import { getCustomerLogoFile, setCustomerLogoFile } from "../../customerLogoRef"
import type { Step1Data } from "../../types"

const fieldClass =
  "w-full !h-[44px] rounded-[99px] border border-[#F0F0F0] py-[12px] px-[20px] shadow-[0px_2px_4px_0px_#0000000A] text-body focus:ring-0 focus:outline-none"

export function Step1CustomerDetails() {
  const dispatch = useAppDispatch()
  const step1 = useAppSelector((state) => state.reportWizard.step1)
  const editingReportId = useAppSelector((state) => state.reportWizard.editingReportId)
  const authUser = useAppSelector((state) => state.auth.user)

  const [isManualEntry, setIsManualEntry] = useState(false)

  const isSalesperson = authUser?.roles?.includes("Salesperson") ?? false


  const { data: languagesData } = useGetTemplateLanguagesQuery()
  const { data: segments = [] } = useGetCustomerSegmentsQuery()

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

  // Auto-set language: user preference → English fallback
  useEffect(() => {
    if (step1.languageId) return
    if (authUser?.preferredLanguageId) {
      dispatch(updateStep1({ languageId: authUser.preferredLanguageId }))
    } else if (languagesData?.length) {
      const english = languagesData.find((l) => l.name?.toLowerCase() === "english")
      if (english) dispatch(updateStep1({ languageId: english.id }))
    }
  }, [authUser?.preferredLanguageId, step1.languageId, languagesData, dispatch])

  const handleCustomerSelect = useCallback(
    (customer: CustomerItem) => {
      dispatch(updateStep1({
        customerId: customer.id,
        customerName: customer.name,
        customerAccountCode: customer.accountCode ?? "",
        customerEmail: customer.contactEmail ?? "",
        customerPhone: customer.contactPhone ?? "",
        customerSegment: customer.segmentName ?? "",
        customerSegmentId: customer.segmentId ?? null,
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
      customerSegmentId: null,
      customerType: "",
      customerLogoUrl: null,
    }))
  }, [dispatch])

  const prevLogoUrlRef = useRef<string | null>(null)

  const handleLogoChange = useCallback(
    (file: File | null) => {
      // Revoke the previous object URL to prevent memory leaks
      if (prevLogoUrlRef.current) {
        URL.revokeObjectURL(prevLogoUrlRef.current)
        prevLogoUrlRef.current = null
      }
      setCustomerLogoFile(file)
      const logoUrl = file ? URL.createObjectURL(file) : null
      prevLogoUrlRef.current = logoUrl
      dispatch(updateStep1({ customerLogoUrl: logoUrl }))
    },
    [dispatch]
  )

  // Revoke the object URL on unmount
  useEffect(() => {
    return () => {
      if (prevLogoUrlRef.current) {
        URL.revokeObjectURL(prevLogoUrlRef.current)
      }
    }
  }, [])

  const languages = languagesData ?? []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#1F1F1F]">Customer and report details</h2>
      </div>

      {/* Customer Name + Salesperson */}
      <div className="grid grid-cols-1 min-[700px]:grid-cols-2 gap-6">
        <div className="space-y-2">
          {editingReportId ? (
            <>
              <label className="text-sm font-medium text-[#1F1F1F]">Customer</label>
              <Input
                value={step1.customerName}
                disabled
                className={fieldClass}
              />
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#1F1F1F]">Customer</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsManualEntry(!isManualEntry)
                    if (!isManualEntry) {
                      // Switching to manual: clear customerId but keep name
                      dispatch(updateStep1({ customerId: null }))
                    } else {
                      // Switching back to search: clear manual fields
                      handleCustomerClear()
                    }
                  }}
                  className="text-sm font-medium text-primary underline"
                >
                  {isManualEntry ? "Search existing" : "Enter manually"}
                </button>
              </div>
              {isManualEntry ? (
                <Input
                  value={step1.customerName}
                  onChange={(e) => dispatch(updateStep1({ customerName: e.target.value }))}
                  placeholder="Enter customer name"
                  className={fieldClass}
                />
              ) : (
                <CustomerSearchCombobox
                  value={step1.customerName}
                  selectedCustomerId={step1.customerId}
                  onSelect={handleCustomerSelect}
                  onClear={handleCustomerClear}
                />
              )}
            </>
          )}
        </div>

        {/* Segment (manual entry only) */}
        {isManualEntry && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1F1F1F]">Customer segment</label>
            <Select
              value={step1.customerSegmentId ?? ""}
              onValueChange={(val) => {
                const seg = segments.find((s) => s.id === val)
                dispatch(updateStep1({
                  customerSegmentId: val,
                  customerSegment: seg?.name ?? "",
                }))
              }}
            >
              <SelectTrigger className={fieldClass}>
                <SelectValue placeholder="Select segment" />
              </SelectTrigger>
              <SelectContent>
                {segments.map((seg) => (
                  <SelectItem key={seg.id} value={seg.id}>
                    {seg.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

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
            <SalespersonSearchCombobox
              value={step1.salesRepresentativeName || ""}
              selectedId={step1.salesRepresentativeId || null}
              onSelect={(rep) => {
                dispatch(updateStep1({
                  salesRepresentativeId: rep.id,
                  salesRepresentativeName: `${rep.firstName} ${rep.lastName}`,
                }))
              }}
              onClear={() => {
                dispatch(updateStep1({
                  salesRepresentativeId: "",
                  salesRepresentativeName: "",
                }))
              }}
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
function toDateInputValue(ddmmyyyy: string | undefined): string {
  if (!ddmmyyyy) return ""
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
