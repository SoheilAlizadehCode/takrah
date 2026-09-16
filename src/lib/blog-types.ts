export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "quote"; text: string }
  | { type: "tip"; title?: string; text: string }
  | { type: "table"; headers: string[]; rows: string[][] };

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string; // id from site.ts categories
  tags: string[];
  date: string; // نمایش فارسی، مثال: «۲۵ شهریور ۱۴۰۵»
  readMinutes: number;
  cover: string;
  featured?: boolean;
  blocks: Block[];
}
