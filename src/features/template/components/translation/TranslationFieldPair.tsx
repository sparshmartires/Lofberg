"use client"

import DOMPurify from "dompurify"
import { RichTextEditor } from "../RichTextEditor"

type FieldType = "richtext" | "input"

interface TranslationFieldPairProps {
  label: string
  englishHtml: string
  translationHtml: string
  onChange: (html: string) => void
  fieldType?: FieldType
}

const readOnlyBase =
  "w-full min-w-0 rounded-xl border border-[#EDEDED] bg-[#F9F9F9] overflow-hidden p-3 text-sm leading-6 opacity-70"

const isEmpty = (html: string) => !html || html.trim() === "" || html.trim() === "<p></p>"

export function TranslationFieldPair({
  label,
  englishHtml,
  translationHtml,
  onChange,
  fieldType = "richtext",
}: TranslationFieldPairProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
      {/* English reference (read-only) */}
      <div className="min-w-0">
        <p className="text-sm mb-2">{label}</p>
        {fieldType === "richtext" ? (
          <div className={readOnlyBase}>
            <div
              className="[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  isEmpty(englishHtml)
                    ? '<p class="text-gray-400 italic">N/A</p>'
                    : englishHtml
                ),
              }}
            />
          </div>
        ) : (
          <input
            readOnly
            value={isEmpty(englishHtml) ? "N/A" : englishHtml}
            className={`w-full min-w-0 h-[40px] rounded-full border border-[#EDEDED] bg-[#F9F9F9] px-4 text-sm opacity-70 ${
              isEmpty(englishHtml) ? "text-gray-400 italic" : ""
            }`}
          />
        )}
      </div>

      {/* Translation (editable) */}
      <div className="min-w-0">
        <p className="text-sm mb-2">{label} translation</p>
        {fieldType === "richtext" ? (
          <RichTextEditor
            value={translationHtml}
            onChange={onChange}
            placeholder="Enter translation"
            className="min-h-[200px]"
          />
        ) : (
          <input
            placeholder="Enter translation"
            value={translationHtml}
            onChange={(e) => onChange(e.target.value)}
            className="w-full min-w-0 h-[40px] rounded-full border border-[#EDEDED] px-4 text-sm"
          />
        )}
      </div>
    </div>
  )
}
