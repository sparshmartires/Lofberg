"use client"

import { useState } from "react"
import { Upload, Plus } from "lucide-react"

export default function IncreasingImpactSection() {
  const [steps, setSteps] = useState([
    { id: 1, name: "", text: "" },
  ])

  const addStep = () => {
    if (steps.length >= 10) return

    setSteps([
      ...steps,
      { id: steps.length + 1, name: "", text: "" },
    ])
  }

  return (
    <div className="space-y-8">
      <h3 className="font-sans font-normal text-[16px] leading-[24px] tracking-[0]">
       Increasing positive impact section
      </h3>

      {/* HEADER TEXT */}
      <div>
        <p className="text-sm mb-2">Header text</p>

        <textarea
          placeholder="Enter header text"
          className="w-full min-w-0 h-[90px] rounded-xl border border-[#EDEDED] p-3 resize-none"
        />
      </div>

      {/* INTRO TEXT */}
      <div>
        <p className="text-sm mb-2">Intro text</p>

        <textarea
          placeholder="Enter introduction text"
          className="w-full min-w-0 h-[110px] rounded-xl border border-[#EDEDED] p-3 resize-none"
        />
      </div>

      {/* STEP SECTION HEADER */}
      <div className="flex items-center justify-between max-[799px]:flex-col max-[799px]:items-start max-[799px]:gap-6">
        <div>
          <p className="text-sm font-medium">
            Report / Receipt template
          </p>
          <p className="text-xs text-[#8A8A8A]">
            Configure multiple impact steps. Users are taken to a landing report generation.
          </p>
        </div>

        <button
          onClick={addStep}
          className="flex items-center gap-1 bg-[#4A145F] text-white text-sm px-[20px] py-[10px] rounded-[99px] max-[799px]:w-full max-[799px]:justify-center"
        >
          <Plus size={14} /> Add step
        </button>
      </div>

      {/* STEPS */}
      <div className="space-y-6">

        {steps.map((step, index) => (
          <div
            key={step.id}
            className="border border-[#EDEDED] rounded-[24px] p-6 space-y-4"
          >
            <p className="text-sm font-medium">
              Step {index + 1}
            </p>

            {/* SECTION NAME */}
            <div>
              <p className="text-sm mb-2">
                Section name (for selection)
              </p>

              <input
                placeholder="Eg. Reduce waste"
                className="w-full min-w-0 h-[40px] rounded-full border border-[#EDEDED] px-4 text-sm"
              />
            </div>

            {/* IMAGE + TEXT */}
            <div className="grid lg:grid-cols-2 gap-8">

              {/* IMAGE */}
              <div className="min-w-0">
                <p className="text-sm mb-2">Section image</p>

                <div className="w-full min-w-0 h-[110px] border-2 border-dashed border-[#D8B4F8] rounded-xl flex flex-col items-center justify-center gap-2">
                  <Upload className="text-[#5B2D91]" />

                  <p className="text-sm text-[#4E4E4E]">
                    Upload a file or drag and drop
                  </p>
                </div>
              </div>

              {/* TEXT */}
              <div className="min-w-0">
                <p className="text-sm mb-2">Section text</p>

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