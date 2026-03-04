"use client"

import { Upload } from "lucide-react"

export default function CompiledReceiptSection() {

  const boxes = [1, 2, 3]

  return (
    <div className="space-y-8 mt-6">

      {/* SECTION HEADER */}
      <div>
        <p className="text-sm font-medium">
          Compiled receipt section
        </p>

        <p className="text-xs text-[#8A8A8A]">
          Configure the compiled receipt that combines all certification data into one receipt page
        </p>
      </div>

      {/* HEADER + INTRO */}
      <div className="grid lg:grid-cols-2 gap-8">

        <div className="min-w-0">
          <p className="text-sm mb-2">Header text</p>

          <input
            placeholder="Enter header text"
            className="w-full min-w-0 h-[40px] rounded-full border border-[#EDEDED] px-4 text-sm"
          />
        </div>

        <div className="min-w-0">
          <p className="text-sm mb-2">Intro text</p>

          <input
            placeholder="Enter introduction text"
            className="w-full min-w-0 h-[40px] rounded-full border border-[#EDEDED] px-4 text-sm"
          />
        </div>

      </div>

      {/* TEXT BOX SECTION */}
      <div>
        <p className="text-sm font-medium">
          Certification text boxes (1 min – 3 max)
        </p>

        <p className="text-xs text-[#8A8A8A] mb-4">
          Configure text boxes repeatable per certification type. Data based on retrieved values from conversion logic.
        </p>
      </div>

      {/* BOXES */}
      <div className="space-y-6">

        {boxes.map((box) => (
          <div
            key={box}
            className="border border-[#EADCF6] rounded-[24px] p-6 space-y-4"
          >

            <p className="text-sm font-medium">
              Certification text box {box}
            </p>

            {/* SECTION NAME */}
            <div>
              <p className="text-sm mb-2">
                Section name (for report creation)
              </p>

              <input
                placeholder="Eg. Organic impact"
                className="w-full min-w-0 h-[40px] rounded-full border border-[#EDEDED] px-4 text-sm"
              />
            </div>

            {/* IMAGE + TEXT */}
            <div className="grid lg:grid-cols-2 gap-8">

              {/* IMAGE */}
              <div className="min-w-0">
                <p className="text-sm mb-2">
                  Section image
                </p>

                <div className="w-full min-w-0 h-[110px] border-2 border-dashed border-[#D8B4F8] rounded-xl flex flex-col items-center justify-center gap-2">
                  <Upload className="text-[#5B2D91]" />

                  <p className="text-sm text-[#4E4E4E]">
                    Upload a file or drag and drop
                  </p>
                </div>
              </div>

              {/* TEXT */}
              <div className="min-w-0">
                <p className="text-sm mb-2">
                  Section text
                </p>

                <textarea
                  placeholder="Enter section text"
                  className="w-full min-w-0 h-[110px] rounded-xl border border-[#EDEDED] p-3 resize-none"
                />
              </div>

            </div>

            {/* INFO TEXT */}
            <p className="text-xs text-[#7B3EBE]">
              Based on retrieved values. Keep placeholders like {"{Certification type}"}, {"{Quantity}"}, {"{Percentage}"} in the text
            </p>

          </div>
        ))}

      </div>

    </div>
  )
}