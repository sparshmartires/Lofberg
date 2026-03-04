"use client"

import { PageHeaderWithAction } from "@/components/layout/PageHeaderWithAction"
import { useState } from "react"
import { TemplateConfiguration } from "../components/TemplateConfiguration"
import SustainabilitySection from "../components/TemplateContent"


export function TemplatePage() {
  const [templateType, setTemplateType] = useState("report-a4")
  const [language, setLanguage] = useState("en")
  return (
    <div className="min-h-screen bg-background py-10">
      <PageHeaderWithAction
        title="Report / Receipt template"
        description="Configure and customize report and receipt templates"
        actionLabel="Save changes"
        onActionClick={() => {}}
      />

      {/* <div className="rounded-[24px] bg-white py-[32px] px-[24px] shadow-sm">
        <div className="mb-[28px] gap-6">
          <PageSectionTitle title="Templates" />
        </div> */}

     <TemplateConfiguration
        templateType={templateType}
        language={language}
        onTemplateTypeChange={setTemplateType}
        onLanguageChange={setLanguage}
      />
      <SustainabilitySection templateType={templateType} />
      {/* </div> */}

   
    </div>
  )
}
