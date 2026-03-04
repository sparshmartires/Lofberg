"use client"

import { Upload } from "lucide-react"

export default function CertificationsSection() {

  const certifications = [
    "Organic certification",
    "Fairtrade certification",
    "Rainforest alliance certification",
    "CO2 certification",
  ]

  return (
    <div className="space-y-8">
      <h3 className="font-sans font-normal text-[16px] leading-[24px] tracking-[0]">
        Certifications report section
      </h3>

      {/* HEADER */}
      <div>
        <p className="text-sm mb-2">Header Text</p>

        <textarea
          placeholder="Enter header text"
          className="w-full min-w-0 h-[90px] rounded-xl border border-[#EDEDED] p-3 resize-none"
        />
      </div>

      <div className="border-t border-[#EDEDED]" />

      {/* CERTIFICATION TYPES */}
      <div className="space-y-6">

        {certifications.map((title, index) => (
          <div
            key={index}
            className="border border-[#EADCF6] rounded-[24px] p-6 space-y-4"
          >

            {/* TITLE */}
            <p className="text-sm font-medium">
              {title}
            </p>

            {/* IMAGES */}
            <div className="grid lg:grid-cols-2 gap-8">

              {/* LOGO */}
              <div className="min-w-0">
                <p className="text-sm mb-2">
                  Certification logo
                </p>

                <div className="w-full min-w-0 h-[110px] border-2 border-dashed border-[#D8B4F8] rounded-xl flex flex-col items-center justify-center gap-2">
                  <Upload className="text-[#5B2D91]" />

                  <p className="text-sm text-[#4E4E4E]">
                    Upload a file or drag and drop
                  </p>
                </div>
              </div>

              {/* BACKGROUND */}
              <div className="min-w-0">
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

            </div>

            {/* HEADER TEXT */}
            <div>
              <p className="text-sm mb-2">
                Header text
              </p>

              <input
                placeholder="Organic coffee"
                className="w-full min-w-0 h-[40px] rounded-full border border-[#EDEDED] px-4 text-sm"
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <p className="text-sm mb-2">
                Description text
              </p>

              <textarea
                placeholder="Keep placeholders like {Quantity}, for dynamic values"
                className="w-full min-w-0 h-[90px] rounded-xl border border-[#EDEDED] p-3 resize-none"
              />
            </div>

            {/* WARNING */}
            <p className="text-xs text-[#7B3EBE]">
              ⚠ Keep placeholders like {"{Quantity}"}, {"{TimePeriod}"} in the text
            </p>

          </div>
        ))}

      </div>

    </div>
  )
}