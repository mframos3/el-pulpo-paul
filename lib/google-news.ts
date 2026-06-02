export type NewsArticle = {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  description: string;
};

const GOOGLE_NEWS_RSS =
  "https://news.google.com/rss/search?q=Tim+Payne&hl=en-US&gl=US&ceid=US:en";

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
}

function stripHtml(html: string): string {
  return decodeXmlEntities(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTag(block: string, tag: string): string {
  const cdata = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, "i");
  const plain = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = block.match(cdata) ?? block.match(plain);
  return match ? decodeXmlEntities(match[1].trim()) : "";
}

function parseSource(block: string, description: string): string {
  const sourceTag = extractTag(block, "source");
  if (sourceTag) return sourceTag;

  const fromDesc = description.match(/<a[^>]*>([^<]+)<\/a>/i);
  return fromDesc?.[1]?.trim() ?? "Google News";
}

export function parseGoogleNewsRss(xml: string): NewsArticle[] {
  const items = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];

  return items
    .map((block) => {
      const title = stripHtml(extractTag(block, "title"));
      const link = extractTag(block, "link");
      const pubDate = extractTag(block, "pubDate");
      const rawDescription = extractTag(block, "description");
      const description = stripHtml(rawDescription);
      const source = parseSource(block, rawDescription);

      if (!title || !link) return null;

      return { title, link, pubDate, source, description };
    })
    .filter((article): article is NewsArticle => article !== null);
}

export async function fetchTimPayneNews(): Promise<NewsArticle[]> {
  const res = await fetch(GOOGLE_NEWS_RSS, {
    next: { revalidate: 1800 },
    headers: {
      "User-Agent": "ElPulpoPaul/1.0 (news reader)",
    },
  });

  if (!res.ok) {
    throw new Error(`Google News RSS failed: ${res.status}`);
  }

  const xml = await res.text();
  return parseGoogleNewsRss(xml);
}
