"use client"

import { Upload } from "lucide-react"

export default function ReceiptSection() {

  const receipts = [
    "Organic receipt",
    "Fairtrade receipt",
    "Rainforest alliance receipt",
    "CO2 receipt",
  ]

  return (
    <div className="space-y-8">

      {/* SECTION HEADER */}
      <div>
        <p className="text-sm font-medium">
          Receipt section
        </p>

        <p className="text-xs text-[#8A8A8A]">
          Configure individual receipt pages for each certification type
        </p>
      </div>

      {/* RECEIPT TYPES */}
      <div className="space-y-6">

        {receipts.map((title, index) => (
          <div
            key={index}
            className="border border-[#EADCF6] rounded-[24px] p-6 space-y-6"
          >

            {/* TITLE */}
            <p className="text-sm font-medium">
              {title}
            </p>

            {/* BACKGROUND IMAGE */}
            <div>
              <p className="text-sm mb-2">
                Background image
              </p>

              <div className="w-full min-w-0 h-[110px] border-2 border-dashed border-[#D8B4F8] rounded-xl flex flex-col items-center justify-center gap-2">
                <Upload className="text-[#5B2D91]" />

                <p className="text-sm text-[#4E4E4E]">
                  Upload a file or drag and drop
                </p>
              </div>
            </div>

            {/* TEXT BOXES */}
            <div className="grid lg:grid-cols-2 gap-8">

              <div className="min-w-0">
                <p className="text-sm mb-2">
                  Receipt text box 1
                </p>

                <textarea
                  placeholder="Enter section text"
                  className="w-full min-w-0 h-[110px] rounded-xl border border-[#EDEDED] p-3 resize-none"
                />
              </div>

              <div className="min-w-0">
                <p className="text-sm mb-2">
                  Receipt text box 2
                </p>

                <textarea
                  placeholder="Enter section text"
                  className="w-full min-w-0 h-[110px] rounded-xl border border-[#EDEDED] p-3 resize-none"
                />
              </div>

            </div>

          </div>
        ))}

      </div>

    </div>
  )
}