// ── contentJson schemas per page type ────────────────────────────────
// Each interface defines the JSON shape stored in TemplatePageContent.contentJson

/** CoverPage (PageType 0) */
export interface CoverPageContent {
  headerText: string // HTML from TipTap rich text editor
  cover_image?: string // URL from uploaded background image
}

/** AboutSustainability (PageType 2) */
export interface AboutSustainabilityContent {
  headerText: string
  introText: string
  intro_hero_image?: string   // Banner image URL
  intro_circle_image?: string // Graph/chart image URL
}

/** LofbergsUSPs (PageType 3) */
export interface UspContent {
  headerText: string
  introText: string
  sectionText1: string
  sectionImage1?: string
  sectionText2: string
  sectionImage2?: string
  sectionText3: string
  sectionImage3?: string
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
