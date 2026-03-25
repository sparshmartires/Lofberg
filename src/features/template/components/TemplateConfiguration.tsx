"use client"

import { useState } from "react"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { useGetTemplateLanguagesQuery } from "@/store/services/templatesApi"

import styles from "./TemplateConfiguration.module.css"

interface TemplateConfigurationProps {
  templateType: string
  language: string
  templateName?: string
  onTemplateTypeChange: (value: string) => void
  onLanguageChange: (value: string) => void
  onTemplateNameChange?: (value: string) => void
}

const INVALID_FILENAME_REGEX = /[\/\\:*?"<>|\s]/

export function TemplateConfiguration({
  templateType,
  language,
  templateName = "",
  onTemplateTypeChange,
  onLanguageChange,
  onTemplateNameChange,
}: TemplateConfigurationProps) {
  const { data: languages = [] } = useGetTemplateLanguagesQuery()
  const [nameError, setNameError] = useState("")

  const fieldClass =
    "w-full !h-[44px] rounded-[99px] border border-[#F0F0F0] py-[12px] px-[20px] shadow-[0px_2px_4px_0px_#0000000A] text-sm"

  const handleNameChange = (value: string) => {
    if (INVALID_FILENAME_REGEX.test(value)) {
      setNameError("Name cannot contain spaces or special characters (/ \\ : * ? \" < > |)")
    } else {
      setNameError("")
    }
    onTemplateNameChange?.(value)
  }

  return (
    <div className={styles.card}>

      {/* GRID */}
      <div className={styles.grid}>

        {/* Template Name */}
        <div className={styles.field}>
          <label className={styles.label}>
            Version name <span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            value={templateName}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. SustainabilityReport2026"
            className={`${fieldClass} ${nameError ? "!border-red-500" : ""}`}
            required
          />
          {nameError && (
            <p className="text-[11px] text-red-500 mt-1 ml-5">{nameError}</p>
          )}
        </div>

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
              <SelectValue placeholder="Report" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="report">
                Report
              </SelectItem>
              <SelectItem value="receipt">
                Receipt
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Language */}
        <div className={styles.field}>
          <label className={styles.label}>
            Language
          </label>

          <Select
            value={language}
            onValueChange={onLanguageChange}
          >
            <SelectTrigger className={fieldClass}>
              <SelectValue placeholder="English" />
            </SelectTrigger>

            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.id} value={lang.id}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

      </div>
    </div>
  )
}
