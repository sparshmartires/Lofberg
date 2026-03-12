// ── contentJson schemas per page type ────────────────────────────────
// Each interface defines the JSON shape stored in TemplatePageContent.contentJson

/** CoverPage (PageType 0) */
export interface CoverPageContent {
  headerText: string // HTML from TipTap rich text editor
}

/** AboutSustainability (PageType 2) */
export interface AboutSustainabilityContent {
  headerText: string
  introText: string
}

/** LofbergsUSPs (PageType 3) */
export interface UspContent {
  headerText: string
  introText: string
  sections: { text: string }[] // up to 3
}

/** IncreasingPositiveImpact (PageType 4) */
export interface IncreasingImpactContent {
  headerText: string
  introText: string
  steps: { name: string; text: string }[] // up to 10
}

/** CertificationsOverview (PageType 5) */
export interface CertificationsContent {
  headerText: string
  certifications: {
    type: string // "Organic", "Fairtrade", "Rainforest alliance", "CO2"
    headerText: string
    descriptionText: string
  }[]
}

/** Receipt pages (PageTypes 6–9) — one per certification */
export interface ReceiptContent {
  textBox1: string
  textBox2: string
}

/** CompiledReceiptSummary (PageType 10) */
export interface CompiledReceiptContent {
  headerText: string
  introText: string
  boxes: { sectionName: string; text: string }[] // 1–3
}

// ── Helper ───────────────────────────────────────────────────────────

export function parseContentJson<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}
