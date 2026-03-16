import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import {
  ReportWizardState,
  Step1Data,
  Step2Data,
  Step3Data,
  Step4Data,
  Step5Data,
  ReportType,
  OutputFormat,
  OutputSize,
  DEFAULT_DATA_ROWS,
} from "@/features/report-generation/types"

const today = () => {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

const initialStep1: Step1Data = {
  customerId: null,
  customerName: "",
  customerAccountCode: "",
  customerEmail: "",
  customerPhone: "",
  customerSegment: "",
  customerType: "",
  customerLogoUrl: null,
  customerLogoFile: null,
  salesRepresentativeId: "",
  salesRepresentativeName: "",
  reportDate: today(),
  languageId: "",
}

const initialStep2: Step2Data = {
  dataFile: null,
  dataFileName: null,
  rows: DEFAULT_DATA_ROWS,
  timePeriod: null,
}

const initialStep3: Step3Data = {
  reportType: ReportType.ReportPlusReceipt,
  generateCompiledReceipt: false,
  generateMediaScreens: false,
}

const initialStep4: Step4Data = {
  includeTableOfContents: true,
  includeThirdPartyLogo: false,
  showCupsOfCoffee: true,
  selectedAddOnBlocks: [],
  conversionLogicId: null,
}

const initialStep5: Step5Data = {
  outputFormat: OutputFormat.PDF,
  outputSize: OutputSize.A4,
}

const initialState: ReportWizardState = {
  currentStep: 1,
  draftId: null,
  step1: initialStep1,
  step2: initialStep2,
  step3: initialStep3,
  step4: initialStep4,
  step5: initialStep5,
  isGenerating: false,
  generatedReportId: null,
}

const reportWizardSlice = createSlice({
  name: "reportWizard",
  initialState,
  reducers: {
    setStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload
    },
    updateStep1: (state, action: PayloadAction<Partial<Step1Data>>) => {
      state.step1 = { ...state.step1, ...action.payload }
    },
    updateStep2: (state, action: PayloadAction<Partial<Step2Data>>) => {
      state.step2 = { ...state.step2, ...action.payload }
    },
    updateStep3: (state, action: PayloadAction<Partial<Step3Data>>) => {
      state.step3 = { ...state.step3, ...action.payload }
    },
    updateStep4: (state, action: PayloadAction<Partial<Step4Data>>) => {
      state.step4 = { ...state.step4, ...action.payload }
    },
    updateStep5: (state, action: PayloadAction<Partial<Step5Data>>) => {
      state.step5 = { ...state.step5, ...action.payload }
    },
    setDraftId: (state, action: PayloadAction<string | null>) => {
      state.draftId = action.payload
    },
    setGenerating: (state, action: PayloadAction<boolean>) => {
      state.isGenerating = action.payload
    },
    setGeneratedReportId: (state, action: PayloadAction<string | null>) => {
      state.generatedReportId = action.payload
    },
    loadDraft: (state, action: PayloadAction<Partial<ReportWizardState>>) => {
      return { ...state, ...action.payload }
    },
    resetWizard: () => initialState,
  },
})

export const {
  setStep,
  updateStep1,
  updateStep2,
  updateStep3,
  updateStep4,
  updateStep5,
  setDraftId,
  setGenerating,
  setGeneratedReportId,
  loadDraft,
  resetWizard,
} = reportWizardSlice.actions

export default reportWizardSlice.reducer
