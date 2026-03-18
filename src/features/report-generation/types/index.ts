// Enums matching backend
export enum ReportType {
  ReportPlusReceipt = 0,
  ReceiptOnly = 1,
}

export enum ReportStatus {
  Draft = 0,
  Generating = 1,
  Completed = 2,
  Failed = 3,
}

export enum OutputFormat {
  PDF = 0,
  JPEG = 1,
}

export enum OutputSize {
  A4 = 0,
  A3 = 1,
}

export enum CertificationType {
  RainforestAlliance = 0,
  Fairtrade = 1,
  FTPremierCooperativePremium = 2,
  FTPremierOrganicFarming = 3,
  Organic = 4,
  CO2 = 5,
}

export enum AddOnBlock {
  WaterConservation = 0,
  FairWages = 1,
  BiodiversityProtection = 2,
  CommunityDevelopment = 3,
  SustainableFarming = 4,
  ClimateAction = 5,
  EducationalPrograms = 6,
  HealthSafety = 7,
  WomenEmpowerment = 8,
  ForestProtection = 9,
}

export const ADD_ON_BLOCK_LABELS: Record<AddOnBlock, string> = {
  [AddOnBlock.WaterConservation]: "Water conservation",
  [AddOnBlock.FairWages]: "Fair wages",
  [AddOnBlock.BiodiversityProtection]: "Biodiversity protection",
  [AddOnBlock.CommunityDevelopment]: "Community development",
  [AddOnBlock.SustainableFarming]: "Sustainable farming",
  [AddOnBlock.ClimateAction]: "Climate action",
  [AddOnBlock.EducationalPrograms]: "Educational programs",
  [AddOnBlock.HealthSafety]: "Health & safety",
  [AddOnBlock.WomenEmpowerment]: "Women empowerment",
  [AddOnBlock.ForestProtection]: "Forest protection",
}

export const CERTIFICATION_LABELS: Record<CertificationType, string> = {
  [CertificationType.RainforestAlliance]: "Rainforest Alliance",
  [CertificationType.Fairtrade]: "Fairtrade",
  [CertificationType.FTPremierCooperativePremium]: "FT Premier Cooperative Premium",
  [CertificationType.FTPremierOrganicFarming]: "FT Premier - Organic Farming Income",
  [CertificationType.Organic]: "Organic",
  [CertificationType.CO2]: "CO2",
}

// FT Premier rows only have currency, CO2 has N/A for football fields and cups
export const FT_PREMIER_TYPES = [
  CertificationType.FTPremierCooperativePremium,
  CertificationType.FTPremierOrganicFarming,
]

export interface CertificationDataRow {
  certificationType: CertificationType
  name: string
  quantityKg: number | null
  footballFields: number | null
  cupsOfCoffee: number | null
  currencyAmount: number | null
}

export const DEFAULT_DATA_ROWS: CertificationDataRow[] = [
  { certificationType: CertificationType.RainforestAlliance, name: "Rainforest Alliance", quantityKg: null, footballFields: null, cupsOfCoffee: null, currencyAmount: null },
  { certificationType: CertificationType.Fairtrade, name: "Fairtrade", quantityKg: null, footballFields: null, cupsOfCoffee: null, currencyAmount: null },
  { certificationType: CertificationType.FTPremierCooperativePremium, name: "FT Premier Cooperative Premium", quantityKg: null, footballFields: null, cupsOfCoffee: null, currencyAmount: null },
  { certificationType: CertificationType.FTPremierOrganicFarming, name: "FT Premier - Organic Farming Income", quantityKg: null, footballFields: null, cupsOfCoffee: null, currencyAmount: null },
  { certificationType: CertificationType.Organic, name: "Organic", quantityKg: null, footballFields: null, cupsOfCoffee: null, currencyAmount: null },
  { certificationType: CertificationType.CO2, name: "CO2", quantityKg: null, footballFields: null, cupsOfCoffee: null, currencyAmount: null },
]

// Step data interfaces
export interface Step1Data {
  customerId: string | null
  customerName: string
  customerAccountCode: string
  customerEmail: string
  customerPhone: string
  customerSegment: string
  customerSegmentId: string | null
  customerType: string
  customerLogoUrl: string | null
  salesRepresentativeId: string
  salesRepresentativeName: string
  reportDate: string
  languageId: string
}

export interface Step2Data {
  dataFileName: string | null
  rows: CertificationDataRow[]
  timePeriod: string | null
}

export interface Step3Data {
  reportType: ReportType
  generateCompiledReceipt: boolean
  generateMediaScreens: boolean
}

export type QuantityUnit = "cups_of_coffee" | "kilograms"

export interface Step4Data {
  includeTableOfContents: boolean
  includeThirdPartyLogo: boolean
  quantityUnit: QuantityUnit
  selectedAddOnBlocks: AddOnBlock[]
  selectedSegmentConversionId: string | null
  selectedCO2ConversionId: string | null
}

export interface Step5Data {
  outputFormat: OutputFormat
  outputSize: OutputSize
}

export interface ReportWizardState {
  currentStep: number
  draftId: string | null
  step1: Step1Data
  step2: Step2Data
  step3: Step3Data
  step4: Step4Data
  step5: Step5Data
  isGenerating: boolean
  generatedReportId: string | null
  editingReportId: string | null
}

// API DTOs
export type StatusLabel = "Draft" | "Latest" | "Past" | "Archived" | "In Progress" | "Failed"

export interface ReportDto {
  id: string
  title: string
  customerName: string
  customerId: string
  salesRepresentativeId: string
  salesRepresentative: string
  reportDate: string
  reportType: ReportType
  status: ReportStatus
  statusLabel: StatusLabel
  outputFormat: OutputFormat
  outputSize: OutputSize
  generatedFileUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface SaveDraftRequest {
  draftId?: string | null
  wizardState: Omit<ReportWizardState, "isGenerating" | "generatedReportId">
}

export interface GenerateReportRequest {
  draftId?: string | null
  step1: Step1Data
  step2: { rows: CertificationDataRow[]; timePeriod?: string | null }
  step3: Step3Data
  step4: Step4Data
  step5: Step5Data
}

export interface GetReportsParams {
  pageNumber: number
  pageSize: number
  searchTerm?: string
  customerId?: string
  salesRepresentativeId?: string
  status?: string
  type?: string
  dateFrom?: string
  dateTo?: string
}

export interface PaginatedReportsResponse {
  items: ReportDto[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export const STEP_LABELS = [
  "Customer & report details",
  "Data source",
  "Report type",
  "Content selection",
  "Output & export",
] as const
