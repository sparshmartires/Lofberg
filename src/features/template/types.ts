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
  intro_hero_image?: string    // Banner image URL
  intro_circle_image?: string  // Graph/chart image URL
  intro_icon_1?: string        // Icon 1 (right row 1)
  intro_textblock_1: string    // Textblock 1 (right row 1)
  intro_icon_2?: string        // Icon 2 (right row 2)
  intro_textblock_2: string    // Textblock 2 (right row 2)
  intro_icon_3?: string        // Icon 3 (bottom left)
  intro_textblock_3: string    // Textblock 3 (bottom left)
  intro_icon_4?: string        // Icon 4 (bottom right)
  intro_textblock_4: string    // Textblock 4 (bottom right)
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
  wantMoreText: string
  actionName1?: string
  actionText1: string
  actionImage1?: string
  actionName2?: string
  actionText2: string
  actionImage2?: string
  actionName3?: string
  actionText3: string
  actionImage3?: string
  actionName4?: string
  actionText4: string
  actionImage4?: string
  actionName5?: string
  actionText5: string
  actionImage5?: string
  actionName6?: string
  actionText6: string
  actionImage6?: string
  actionName7?: string
  actionText7: string
  actionImage7?: string
  actionName8?: string
  actionText8: string
  actionImage8?: string
  actionName9?: string
  actionText9: string
  actionImage9?: string
  actionName10?: string
  actionText10: string
  actionImage10?: string
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

/** Receipt pages (PageTypes 6–9) — one per certification.
 *  Keys match the HTML data-field-name attributes (different per receipt type). */
export type ReceiptContent = Record<string, string | undefined>

/** CompiledReceiptSummary (PageType 10).
 *  Keys match HTML data-field-name attributes:
 *  receipt_comp_header, receipt_comp_desc_text,
 *  receipt_comp_icon_1/2/3, receipt_comp_section_name_1/2/3 */
export interface CompiledReceiptContent {
  receipt_comp_header: string
  receipt_comp_desc_text: string
  receipt_comp_icon_1?: string
  receipt_comp_icon_2?: string
  receipt_comp_icon_3?: string
  receipt_comp_section_name_1?: string
  receipt_comp_section_name_2?: string
  receipt_comp_section_name_3?: string
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
