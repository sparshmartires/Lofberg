"use client"

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"

import styles from "./TemplateConfiguration.module.css"

interface TemplateConfigurationProps {
  templateType: string
  language: string
  onTemplateTypeChange: (value: string) => void
  onLanguageChange: (value: string) => void
}

export function TemplateConfiguration({
  templateType,
  language,
  onTemplateTypeChange,
  onLanguageChange,
}: TemplateConfigurationProps) {

  const fieldClass =
    "w-full !h-[44px] rounded-[99px] border border-[#F0F0F0] py-[12px] px-[20px] shadow-[0px_2px_4px_0px_#0000000A] text-sm"

  return (
    <div className={styles.card}>

      {/* TITLE */}
      <h2 className={styles.title}>
        Template configuration
      </h2>

      {/* GRID */}
      <div className={styles.grid}>

        {/* Template Type */}
        <div className={styles.field}>
          <label className={styles.label}>
            Template type
          </label>

          <Select
            value={templateType}
            onValueChange={onTemplateTypeChange}
          >
            <SelectTrigger className={fieldClass}>
              <SelectValue placeholder="Report template (A4)" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="report-a4">
                Report template (A4)
              </SelectItem>
              <SelectItem value="receipt-a4">
                Receipt template (A4)
              </SelectItem>
            </SelectContent>
          </Select>

          <p className={styles.helper}>
            Configure sustainability report templates (A4 format)
          </p>
        </div>

        {/* Language */}
        <div className={styles.field}>
          <label className={styles.label}>
            Editing language
          </label>

          <Select
            value={language}
            onValueChange={onLanguageChange}
          >
            <SelectTrigger className={fieldClass}>
              <SelectValue placeholder="English" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="sv">Swedish</SelectItem>
              <SelectItem value="de">German</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>
    </div>
  )
}