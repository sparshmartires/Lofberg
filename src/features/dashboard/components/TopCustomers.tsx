"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function TopCustomers() {
  const customers = [
    { name: "Hotel Nordic", volume: "4,500", reports: 12 },
    { name: "Café Chain AB", volume: "3,800", reports: 24 },
    { name: "Restaurant Group DK", volume: "3,200", reports: 18 },
    { name: "Nordic Hotels AS", volume: "2,900", reports: 15 },
    { name: "Coffee Central", volume: "2,600", reports: 20 },
    { name: "Hotel Dreams AS", volume: "1,020", reports: 12 },
  ]

  return (
    <div className="w-full bg-white border border-[#EDEDED] rounded-[28px] px-[32px] py-[24px]">
      <h3 className="text-[18px] mb-[20px] font-semibold text-[#1F1F1F]">Top 10 customers</h3>

      <Table>
        <TableHeader>
          <TableRow className="border-b border-dashed border-[#E6CAF5] hover:bg-transparent">
            <TableHead className="pb-3 text-[#1F1F1F] pl-[12px]">Customer</TableHead>
            <TableHead className="pb-3 text-[#1F1F1F]">Volume (kg)</TableHead>
            <TableHead className="pb-3 text-[#1F1F1F] pr-[12px]">Reports</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.name} className="border-b border-[#DFDFDF] hover:bg-transparent">
              <TableCell className="py-3 pl-[12px] text-[#4E4E4E]">{customer.name}</TableCell>

              <TableCell className="py-3 text-[#4E4E4E]">{customer.volume}</TableCell>

              <TableCell className="py-3 pr-[12px] text-[#4E4E4E]">{customer.reports}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}