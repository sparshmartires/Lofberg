export function ReportsByMarketSegments() {
  const rows = [
    { segment: "Hotel", count: 45, percent: "29%" },
    { segment: "Restaurant", count: 38, percent: "24%" },
    { segment: "Coffee shop", count: 32, percent: "21%" },
    { segment: "Retail chain", count: 25, percent: "19%" },
    { segment: "Other", count: 16, percent: "10%" },
  ]

  return (
    <div className="w-full bg-white border border-[#EDEDED] rounded-[28px] px-[32px] py-[24px]">

      <h3 className="text-[18px] mb-[20px] font-semibold text-[#1F1F1F]">
        Reports by market segments
      </h3>

      <table className="w-full text-sm">

        <thead className="text-left border-b border-dashed border-[#E6CAF5]">
          <tr>
            <th className="pb-3 text-[#1F1F1F] pl-[12px]">Market segment</th>
            <th className="pb-3 text-[#1F1F1F]">Count</th>
            <th className="pb-3 text-[#1F1F1F] pr-[12px]">Percentage</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr
              key={row.segment}
              className="border-b border-[#DFDFDF]"
            >
              <td className="py-3 pl-[12px] text-[#4E4E4E]">{row.segment}</td>
              <td className="text-[#4E4E4E]">{row.count}</td>
              <td className="pr-[12px] text-[#4E4E4E]">{row.percent}</td>
            </tr>
          ))}
        </tbody>

      </table>

    </div>
  )
}