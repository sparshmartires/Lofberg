"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts"

const data = [
  { country: "Sweden", reports: 70 },
  { country: "Norway", reports: 78 },
  { country: "Denmark", reports: 70 },
  { country: "Finland", reports: 42 },
  { country: "Poland", reports: 28 },
]

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null

  return (
    <div className="relative flex flex-col items-center">
      <div className="bg-[#2A0E37] text-white px-4 py-2 rounded-lg text-sm shadow-md">
        {payload[0].value}
      </div>

      {/* arrow */}
      <div className="w-3 h-3 bg-[#2A0E37] rotate-45 -mt-1"></div>
    </div>
  )
}

export function ReportsByMarkets() {
  return (
    <div className="w-full bg-white border border-[#EDEDED] rounded-[28px] px-[32px] py-[24px]">

      <h3 className="text-[18px] mb-[28px] font-semibold text-[#1F1F1F]">
        Reports by markets
      </h3>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          margin={{ top: 0, right: 0, bottom: 0, left: -38 }}
        >
          {/* GRID */}
          <CartesianGrid
            stroke="#EAE6EF"
            vertical={false}
          />

          {/* X AXIS */}
          <XAxis
            dataKey="country"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#747474", fontSize: 12 }}
          />

          {/* Y AXIS */}
          <YAxis
            axisLine={{
                stroke: "#3C10531A",
            }}
            tickLine={false}
            tick={{ fill: "#747474", fontSize: 12 }}
          />

          <Tooltip
            cursor={{ fill: "transparent" }}
            content={<CustomTooltip />}
          />

          <Bar
            dataKey="reports"
            radius={[6, 6, 0, 0]}
            barSize={56}
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  entry.country === "Norway"
                    ? "#734687"
                    : "#CAB8D2"
                }
              />
            ))}
          </Bar>

        </BarChart>
      </ResponsiveContainer>

    </div>
  )
}