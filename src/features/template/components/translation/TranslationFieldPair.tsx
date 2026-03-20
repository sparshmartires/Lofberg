"use client"

import { RichTextEditor } from "../RichTextEditor"

type FieldType = "richtext" | "textarea" | "input"

interface TranslationFieldPairProps {
  label: string
  englishHtml: string
  translationHtml: string
  onChange: (html: string) => void
  fieldType?: FieldType
}

const readOnlyBase =
  "w-full min-w-0 rounded-xl border border-[#EDEDED] bg-[#F9F9F9] overflow-hidden p-3 text-sm leading-6 opacity-70"

export function TranslationFieldPair({
  label,
  englishHtml,
  translationHtml,
  onChange,
  fieldType = "richtext",
}: TranslationFieldPairProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* English reference (read-only) */}
      <div className="min-w-0">
        <p className="text-sm mb-2">{label}</p>
        {fieldType === "richtext" ? (
          <div className={readOnlyBase}>
            <div
              className="[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5"
              dangerouslySetInnerHTML={{ __html: englishHtml || "<p></p>" }}
            />
          </div>
        ) : fieldType === "textarea" ? (
          <textarea
            readOnly
            value={englishHtml}
            className={`${readOnlyBase} h-[125px] resize-none`}
          />
        ) : (
          <input
            readOnly
            value={englishHtml}
            className="w-full min-w-0 h-[40px] rounded-full border border-[#EDEDED] bg-[#F9F9F9] px-4 text-sm opacity-70"
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
        ) : fieldType === "textarea" ? (
          <textarea
            placeholder="Enter translation"
            value={translationHtml}
            onChange={(e) => onChange(e.target.value)}
            className="w-full min-w-0 h-[125px] rounded-xl border border-[#EDEDED] p-3 resize-none"
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
