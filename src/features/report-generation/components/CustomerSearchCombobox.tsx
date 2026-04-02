"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useGetCustomersQuery, CustomerItem } from "@/store/services/customersApi"

interface CustomerSearchComboboxProps {
  value: string
  selectedCustomerId: string | null
  onSelect: (customer: CustomerItem) => void
  onClear: () => void
  className?: string
}

const fieldClass =
  "w-full !h-[44px] rounded-[99px] border border-[#F0F0F0] py-[12px] px-[20px] pr-[40px] shadow-[0px_2px_4px_0px_#0000000A] text-body focus:ring-0 focus:outline-none"

export function CustomerSearchCombobox({
  value,
  selectedCustomerId,
  onSelect,
  onClear,
  className = "",
}: CustomerSearchComboboxProps) {
  const [searchTerm, setSearchTerm] = useState(value)
  const [isOpen, setIsOpen] = useState(false)
  const [debouncedTerm, setDebouncedTerm] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)

  const { data } = useGetCustomersQuery(
    { pageNumber: 1, pageSize: 10, searchTerm: debouncedTerm, isActive: true },
    { skip: !debouncedTerm && !isOpen }
  )

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Sync external value
  useEffect(() => {
    setSearchTerm(value)
  }, [value])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      setSearchTerm(val)
      setIsOpen(true)
      if (selectedCustomerId && val !== value) {
        onClear()
      }
    },
    [selectedCustomerId, value, onClear]
  )

  const handleSelect = useCallback(
    (customer: CustomerItem) => {
      setSearchTerm(customer.name)
      setIsOpen(false)
      onSelect(customer)
    },
    [onSelect]
  )

  const customers = data?.items ?? []

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Input
          placeholder="Find by ID/name/email"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          className={fieldClass}
        />
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>

      {isOpen && customers.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-2xl border border-[#F0F0F0] shadow-lg max-h-[280px] overflow-y-auto">
          {customers.map((customer) => (
            <button
              key={customer.id}
              type="button"
              onClick={() => handleSelect(customer)}
              className={`w-full text-left px-4 py-3 hover:bg-[#F5F0FF] transition-colors border-b border-[#F0F0F0] last:border-b-0 ${
                selectedCustomerId === customer.id ? "bg-[#F0E6FF]" : ""
              }`}
            >
              <p className="text-sm font-medium text-[#1F1F1F]">{customer.name}</p>
              <p className="text-xs text-[#9CA3AF]">
                {customer.accountCode ?? customer.id}
                {customer.contactEmail ? `, ${customer.contactEmail}` : ""}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
