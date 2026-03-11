"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Image from "next/image"

export function SalesRepPerformance() {
  const reps = [
    {
      name: "Karin Bergstrom",
      region: "Norway",
      reports: 92,
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      name: "Cecilia Holm",
      region: "Poland",
      reports: 88,
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    },
    {
      name: "Helena Sjöberg",
      region: "Sweden",
      reports: 76,
      avatar: "https://randomuser.me/api/portraits/women/32.jpg",
    },
    {
      name: "Anna Neilson",
      region: "Finland",
      reports: 56,
      avatar: "https://randomuser.me/api/portraits/women/21.jpg",
    },
    {
      name: "Maya Olsson",
      region: "Denmark",
      reports: 48,
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    },
    {
      name: "Ingrid Larsson",
      region: "Sweden",
      reports: 44,
      avatar: "https://randomuser.me/api/portraits/women/17.jpg",
    },
  ]

  return (
    <div className="w-full bg-white border border-[#EDEDED] rounded-[28px] px-[32px] py-[24px]">
      <h3 className="text-[18px] mb-[20px] font-semibold text-[#1F1F1F]">Sales rep performance</h3>

      <Table>
        <TableHeader>
          <TableRow className="border-b border-dashed border-[#E6CAF5] hover:bg-transparent">
            <TableHead className="pb-3 text-[#1F1F1F] pl-[12px]">Sales rep</TableHead>
            <TableHead className="pb-3 text-[#1F1F1F]">Region</TableHead>
            <TableHead className="pb-3 text-[#1F1F1F] pr-[12px]">Reports</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {reps.map((rep) => (
            <TableRow key={rep.name} className="border-b border-[#DFDFDF] hover:bg-transparent">
              <TableCell className="py-3 pl-[12px] text-[#4E4E4E]">
                <div className="flex items-center gap-2">
                  <Image
                    src={rep.avatar}
                    alt={rep.name}
                    width={28}
                    height={28}
                    className="rounded-full"
                  />

                  {rep.name}
                </div>
              </TableCell>

              <TableCell className="py-3 text-[#4E4E4E]">{rep.region}</TableCell>

              <TableCell className="py-3 pr-[12px] text-[#4E4E4E]">{rep.reports}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}