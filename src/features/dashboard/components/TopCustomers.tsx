"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface TopCustomersProps {
  data: { name: string; logoUrl?: string; segment: string; reportCount: number }[]
}

export function TopCustomers({ data }: TopCustomersProps) {
  return (
    <div className="w-full bg-white border border-[#EDEDED] rounded-[28px] px-[32px] py-[24px]">
      <h3 className="text-[18px] mb-[20px] font-semibold text-[#1F1F1F]">Top 10 customers</h3>

      <Table>
        <TableHeader>
          <TableRow className="border-b border-dashed border-[#E6CAF5] hover:bg-transparent">
            <TableHead className="pb-3 text-[#1F1F1F] pl-[12px]">Customer</TableHead>
            <TableHead className="pb-3 text-[#1F1F1F]">Segment</TableHead>
            <TableHead className="pb-3 text-[#1F1F1F] pr-[12px]">Reports</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={3} className="py-6 text-center text-[#747474]">No data available</TableCell>
            </TableRow>
          ) : (
            data.map((customer) => (
              <TableRow key={customer.name} className="border-b border-[#DFDFDF] hover:bg-transparent">
                <TableCell className="py-3 pl-[12px] text-[#4E4E4E]">
                  <div className="flex items-center gap-2">
                    {customer.logoUrl ? (
                      <img
                        src={customer.logoUrl}
                        alt={customer.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#F4ECFB] flex items-center justify-center text-[11px] font-medium text-[#5B2D91]">
                        {customer.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    {customer.name}
                  </div>
                </TableCell>

                <TableCell className="py-3 text-[#4E4E4E]">{customer.segment}</TableCell>

                <TableCell className="py-3 pr-[12px] text-[#4E4E4E]">{customer.reportCount}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}