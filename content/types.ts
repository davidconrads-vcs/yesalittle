// Static content pages — the crawlable surface that sits alongside the SPA.
//
// A page DEFINES ITS OWN prompt selection, ordering and grouping (see `sections`).
// This is deliberate: inclusion is a presentation concern, so it never leaks into
// prompts.json as a flag, and multiple pages can draw on the same scenario.

/** Authored prose. Rendered as raw HTML, so inline <em>/<strong> are allowed. */
type Html = string

export interface ContentSection {
  /** Rendered as the <h2>. Also the key `midHook.after` refers to. */
  heading: string
  /** One-line framing under the heading. */
  note?: Html
  /** Prompt ids from prompts.json, in the order they should appear. */
  prompts: string[]
}

export interface ContentPage {
  /** URL path with no leading slash, e.g. 'spain/restaurant'. Also the output dir. */
  slug: string
  /** Locale the page teaches. Prompts must be drillable in it. */
  target: string
  /** Locale the reader already speaks — drives context/translation resolution. */
  native: string
  /** Scenario id in prompts.json. Scopes prompt lookup and the unused-prompt warning. */
  scenario: string

  title: string
  metaDescription: string
  /** ISO date. Drives the byline and JSON-LD dateModified. */
  updated: string
  /** ISO date. JSON-LD datePublished. */
  published: string

  eyebrow: string
  h1: string
  standfirst: Html
  lead: Html[]
  headsUp?: { title: string; items: Html[] }

  sections: ContentSection[]
  /** Inline asides keyed by prompt id. Every key must appear in `sections`. */
  notes?: Record<string, Html>

  /** Appears after the named section. `after` must match a section heading. */
  midHook?: { after: string; text: Html; linkText: string; href: string }
  cta: { heading: string; body: Html; buttonText: string; href: string }
  /** Internal hrefs to pages that aren't built yet are dropped with a warning. */
  related?: { title: string; links: { href: string; text: string }[] }
}
