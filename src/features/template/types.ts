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
  // General (total volume)
  cert_general_header: string
  cert_general_text: string
  cert_general_image?: string
  cert_general_logo?: string
  // Rainforest Alliance
  cert_rainforest_header: string
  cert_rainforest_text: string
  cert_rainforest_image?: string
  cert_rainforest_logo?: string
  // Fairtrade
  cert_fairtrade_header: string
  cert_fairtrade_text: string
  cert_fairtrade_image?: string
  cert_fairtrade_logo?: string
  // Organic
  cert_organic_header: string
  cert_organic_text: string
  cert_organic_image?: string
  cert_organic_logo?: string
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
