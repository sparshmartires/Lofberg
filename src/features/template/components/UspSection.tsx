"use client"

import { Upload } from "lucide-react"

export default function UspSection() {
  return (
    <div className="space-y-8">
      <h3 className="font-sans font-normal text-[16px] leading-[24px] tracking-[0]">
        Lofbers USP's section
      </h3>

      <div>
        <p className="text-sm mb-2">Header text</p>
        <textarea
          placeholder="Enter header text"
          className="w-full min-w-0 h-[90px] rounded-xl border border-[#EDEDED] p-3 resize-none"
        />
      </div>

      <div>
        <p className="text-sm mb-2">Intro text</p>
        <textarea
          placeholder="Enter introduction text"
          className="w-full min-w-0 h-[110px] rounded-xl border border-[#EDEDED] p-3 resize-none"
        />
      </div>

      <div className="border-t border-[#EDEDED]" />

      <div className="space-y-6">
        {[1, 2, 3].map((section) => (
          <div key={section} className="border border-[#EDEDED] rounded-[24px] p-6 space-y-4">
            <p className="text-sm font-medium">
              {section === 1 ? "USP sections (up to 3)" : `Section ${section}`}
            </p>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="min-w-0">
                <p className="text-sm mb-2">Section image</p>

                <div className="w-full min-w-0 h-[120px] border-2 border-dashed border-[#D8B4F8] rounded-xl flex flex-col items-center justify-center gap-2">
                  <Upload className="text-[#5B2D91]" />

                  <p className="text-sm text-[#4E4E4E]">Upload a file or drag and drop</p>
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-sm mb-2">Section text</p>

                <textarea
                  placeholder="Enter section text"
                  className="w-full min-w-0 h-[120px] rounded-xl border border-[#EDEDED] p-3 resize-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
