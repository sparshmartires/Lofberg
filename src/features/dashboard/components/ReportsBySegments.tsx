interface ReportsByMarketSegmentsProps {
  data: { segmentName: string; count: number; percentage: number }[]
}

export function ReportsByMarketSegments({ data }: ReportsByMarketSegmentsProps) {
  return (
    <div className="w-full bg-white border border-[#EDEDED] rounded-[28px] px-[32px] py-[24px]">

      <h3 className="text-[18px] mb-[20px] font-semibold text-[#1F1F1F]">
        Reports by market segment
      </h3>

      <table className="w-full text-sm">

        <thead className="text-left border-b border-dashed border-[#E6CAF5]">
          <tr>
            <th className="pb-3 text-[#1F1F1F] pl-[12px]">Segment</th>
            <th className="pb-3 text-[#1F1F1F]">No.</th>
            <th className="pb-3 text-[#1F1F1F] pr-[12px]">Percentage</th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={3} className="py-6 text-center text-[#747474]">No data available</td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={row.segmentName}
                className="border-b border-[#DFDFDF]"
              >
                <td className="py-3 pl-[12px] text-[#4E4E4E]">{row.segmentName}</td>
                <td className="text-[#4E4E4E]">{row.count}</td>
                <td className="pr-[12px] text-[#4E4E4E]">{row.percentage}%</td>
              </tr>
            ))
          )}
        </tbody>

      </table>

    </div>
  )
}