"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useGetUsersQuery, type UserItem } from "@/store/services/usersApi"

interface SalespersonItem {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface SalespersonSearchComboboxProps {
  value: string
  selectedId: string | null
  onSelect: (rep: SalespersonItem) => void
  onClear: () => void
  className?: string
}

const fieldClass =
  "w-full !h-[44px] rounded-[99px] border border-[#F0F0F0] py-[12px] px-[20px] pr-[40px] shadow-[0px_2px_4px_0px_#0000000A] text-body focus:ring-0 focus:outline-none"

export function SalespersonSearchCombobox({
  value,
  selectedId,
  onSelect,
  onClear,
  className = "",
}: SalespersonSearchComboboxProps) {
  const [searchTerm, setSearchTerm] = useState(value)
  const [isOpen, setIsOpen] = useState(false)
  const [debouncedTerm, setDebouncedTerm] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch users with Salesperson role
  const { data } = useGetUsersQuery(
    { pageNumber: 1, pageSize: 20, searchTerm: debouncedTerm || undefined },
    { skip: false }
  )

  // Filter to salesperson role client-side
  const salesReps: SalespersonItem[] = (data?.items ?? [])
    .filter((u: UserItem) => u.roleName === "Salesperson")
    .map((u: UserItem) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
    }))

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Sync external value
  useEffect(() => { setSearchTerm(value) }, [value])

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
      if (selectedId && val !== value) onClear()
    },
    [selectedId, value, onClear]
  )

  const handleSelect = useCallback(
    (rep: SalespersonItem) => {
      setSearchTerm(`${rep.firstName} ${rep.lastName}`)
      setIsOpen(false)
      onSelect(rep)
    },
    [onSelect]
  )

  // Filter by search term locally for immediate feedback
  const filtered = debouncedTerm
    ? salesReps.filter((r) => {
        const term = debouncedTerm.toLowerCase()
        return (
          `${r.firstName} ${r.lastName}`.toLowerCase().includes(term) ||
          r.email.toLowerCase().includes(term)
        )
      })
    : salesReps

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Input
          placeholder="Find by name/email"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          className={fieldClass}
        />
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>

      {isOpen && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-2xl border border-[#F0F0F0] shadow-lg max-h-[280px] overflow-y-auto">
          {filtered.map((rep) => (
            <button
              key={rep.id}
              type="button"
              onClick={() => handleSelect(rep)}
              className={`w-full text-left px-4 py-3 hover:bg-[#F5F0FF] transition-colors border-b border-[#F0F0F0] last:border-b-0 ${
                selectedId === rep.id ? "bg-[#F0E6FF]" : ""
              }`}
            >
              <p className="text-sm font-medium text-[#1F1F1F]">
                {rep.firstName} {rep.lastName}
              </p>
              <p className="text-xs text-[#9CA3AF]">{rep.email}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
