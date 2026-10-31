# EN Translation Brief — TakRah articles (READ FULLY BEFORE WRITING)

You are translating Persian (Farsi) tech-blog articles to English for takrah.top's /en version. Quality bar: natural, human tech-blog English — NOT machine-translation word order. The reader is a global English speaker.

## Files to read first (in this order)
1. `/home/z/my-project/src/lib/blog-types.ts` — the exact `Article`/`Block` TypeScript types
2. `/home/z/my-project/src/data/en/what-is-ai-beginners-guide.ts` — GOLD STANDARD example of tone/format
3. Your assigned Persian source file(s) under `/home/z/my-project/src/data/`

## Output contract (STRICT)
- ONE file per article: `/home/z/my-project/src/data/en/<same-slug-as-fa>.ts`
- Uniform export (this exact name, no exceptions):
  ```ts
  import type { Article } from "@/lib/blog-types";

  // English version of "<fa-title>" — editorial translation
  export const EN_ARTICLE: Article = { ... };
  ```
- Keep `slug` IDENTICAL to the Persian slug (string unchanged).
- Keep `cover` IDENTICAL (same image path).
- Keep `readMinutes` IDENTICAL (number).
- Keep `category` IDENTICAL (the id string, e.g. "ai").
- If the source article has `featured: true`, include `featured: true`. If it has `book: "<slug>"`, include `book: "<slug>"` unchanged. Otherwise omit both fields.
- `date`: use the EXACT English date string given in your task assignment (do not compute it yourself).
- `title`: fully rewritten English SEO title (max ~65 chars), not a literal translation.
- `excerpt`: 1–2 sentence English summary (max ~30 words), compelling, no Persian.
- `tags`: 4–6 English tags (lowercase, translate the concepts).
- `blocks`: translate EVERY block 1:1 — the number and order of blocks MUST match the source exactly, and each block's `type` must match (p, h2, h3, list with same `ordered` value, quote, tip with translated optional `title`, table with translated `headers` and every cell of `rows`).
- Do NOT shorten, merge, drop, or add blocks. Full translation of every sentence. Content coverage = source.

## Style rules
- Idiomatic, active-voice tech writing; short sentences; jargon explained on first use (like the gold-standard file).
- Money: keep amounts, write "18 million toman" style. Never use "$" for toman amounts.
- Persian-specific concepts (e.g. Iranian exchanges, shekan DNS, Iranian banks) stay but are explained naturally for an international reader where needed (one short clause max — do not add new paragraphs).
- Use proper typography: curly quotes “ ” ’ and em dashes — are fine. NO Persian/Arabic characters anywhere in the output.
- Escape backticks/quotes correctly for TS double-quoted strings; avoid line breaks inside strings.
- No markdown symbols, no HTML, no links inside block text.

## Hard constraints
- ONLY create files under `/home/z/my-project/src/data/en/`. Do NOT edit any existing file. Do NOT run git commands. Do NOT run builds.
- Each file must be valid TypeScript that compiles against the `Article` type.
- Double-check JSON-like braces balance before finishing.

## Return in your final message
For each article: slug | block count | approx word count. Plus any source anomaly you noticed.
