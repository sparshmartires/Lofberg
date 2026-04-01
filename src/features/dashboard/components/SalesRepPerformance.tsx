"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface SalesRepPerformanceProps {
  data: { name: string; profileImageUrl?: string; reportCount: number }[]
}

export function SalesRepPerformance({ data }: SalesRepPerformanceProps) {
  return (
    <div className="w-full bg-white border border-[#EDEDED] rounded-[28px] px-[32px] py-[24px]">
      <h3 className="text-[18px] mb-[20px] font-semibold text-[#1F1F1F]">Salesperson performance</h3>

      <Table>
        <TableHeader>
          <TableRow className="border-b border-dashed border-[#E6CAF5] hover:bg-transparent">
            <TableHead className="pb-3 text-[#1F1F1F] pl-[12px]">Salesperson</TableHead>
            <TableHead className="pb-3 text-[#1F1F1F] pr-[12px]">No.</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={2} className="py-6 text-center text-[#747474]">No data available</TableCell>
            </TableRow>
          ) : (
            data.map((rep) => (
              <TableRow key={rep.name} className="border-b border-[#DFDFDF] hover:bg-transparent">
                <TableCell className="py-3 pl-[12px] text-[#4E4E4E]">
                  <div className="flex items-center gap-2">
                    {rep.profileImageUrl ? (
                      <img
                        src={rep.profileImageUrl}
                        alt={rep.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#F4ECFB] flex items-center justify-center text-[11px] font-medium text-[#5B2D91]">
                        {rep.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                      </div>
                    )}

                    <span className="truncate max-w-[150px]">{rep.name}</span>
                  </div>
                </TableCell>

                <TableCell className="py-3 pr-[12px] text-[#4E4E4E]">{rep.reportCount}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}