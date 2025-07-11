import { convertToSlug } from "$lib/utils";

const pages = [
  { title: "/" },
  { title: "/chat" },
  { title: "/compare" },
  { title: "/reddit-tracker" },
  { title: "/list/most-shorted-stocks" },
  { title: "/stocks" },
  { title: "/etf" },
  { title: "/etf/etf-providers" },
  { title: "/etf/new-launches" },
  { title: "/price-alert" },
  { title: "/insider-tracker" },
  { title: "/industry" },
  { title: "/industry/sectors" },
  { title: "/industry/all" },
  { title: "/newsletter" },
  { title: "/options-flow" },
  { title: "/ipos" },
  { title: "/ipos/news" },
  { title: "/list" },
  { title: "/list/monthly-dividend-stocks" },
  { title: "/list/dividend/dividend-kings" },
  { title: "/list/dividend/dividend-aristocrats" },
  { title: "/list/magnificent-seven" },
  { title: "/list/most-buybacks" },
  { title: "/list/market-cap/mega-cap-stocks" },
  { title: "/list/market-cap/large-cap-stocks" },
  { title: "/list/market-cap/mid-cap-stocks" },
  { title: "/list/market-cap/small-cap-stocks" },
  { title: "/list/market-cap/micro-cap-stocks" },
  { title: "/list/market-cap/nano-cap-stocks" },
  { title: "/list/highest-open-interest" },
  { title: "/list/highest-open-interest-change" },
  { title: "/list/highest-option-iv-rank" },
  { title: "/list/highest-option-premium" },
  { title: "/list/bitcoin-etfs" },
  { title: "/stock-screener" },
  { title: "/market-news" },
  { title: "/advertise" },
  { title: "/data-disclaimer" },
  { title: "/market-news/general" },
  { title: "/earnings-calendar" },
  { title: "/economic-calendar" },
  { title: "/dividends-calendar" },
  { title: "/market-mover/gainers" },
  { title: "/market-mover/losers" },
  { title: "/market-mover/active" },
  { title: "/market-mover/premarket/gainers" },
  { title: "/market-mover/premarket/losers" },
  { title: "/market-mover/afterhours/gainers" },
  { title: "/market-mover/afterhours/losers" },
  { title: "/hedge-funds" },
  { title: "/login" },
  { title: "/register" },
  { title: "/watchlist/stocks" },
  { title: "/watchlist/options" },
  { title: "/pricing" },
  { title: "/terms-of-use" },
  { title: "/privacy-policy" },
  { title: "/imprint" },
  { title: "/about" },
  { title: "/contact" },
  { title: "/blog" },
  { title: "/politicians" },
  { title: "/politicians/flow-data" },
  { title: "/analysts" },
  { title: "/analysts/top-stocks" },
  { title: "/analysts/analyst-flow" },
  { title: "/heatmap" },
  { title: "/market-flow" },
  { title: "/market-flow/sector-flow" },
  { title: "/affiliate-program" },
  { title: "/dark-pool-flow" },
  { title: "/potus-tracker" },
  { title: "/options-calculator" },
  { title: "/faq" }
];

const website = "https://stocknear.com";

// Helper to ensure lastmod is in "YYYY-MM-DD" format
function formatLastmod(dateString) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString().split("T")[0];
}

// Escape XML special characters
function escapeXml(unsafe) {
  return unsafe
    ?.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const createUrlElement = (loc, { lastmod, changefreq, priority } = {}) => {
  let lastmodTag = "";
  if (lastmod) {
    const formattedDate = formatLastmod(lastmod);
    if (formattedDate) {
      lastmodTag = `<lastmod>${formattedDate}</lastmod>`;
    }
  }
  return `
  <url>
    <loc>${escapeXml(loc)}</loc>
    ${lastmodTag}
    ${changefreq ? `<changefreq>${changefreq}</changefreq>` : ""}
    ${priority ? `<priority>${priority}</priority>` : ""}
  </url>
  `;
};

// Default settings for pages
const defaultStaticPageSettings = { changefreq: "daily", priority: "1.0" };
const homePageSettings = { changefreq: "daily", priority: "1.0" };
const articleSettings = { changefreq: "daily", priority: "1.0" };
const tutorialSettings = { changefreq: "daily", priority: "1.0" };
const stockSettings = { changefreq: "daily", priority: "1.0" };

/** @type {import('./$types').RequestHandler} */
export async function GET({ locals }) {
  const { apiKey, apiURL, pb } = locals;

  // Fetch stocks data
  const rawData = await fetch(`${apiURL}/full-searchbar`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey
    }
  });
  const outputStocks = await rawData.json();
  const stocks = outputStocks?.map(item => ({ id: item?.symbol, type: item?.type }));

  // Fetch articles and tutorials
  const articles = await pb.collection("articles").getFullList({ sort: "-created" });
  const tutorials = await pb.collection("tutorials").getFullList({ sort: "-created" });

  // Build sitemap XML
  const body = sitemap(stocks, articles, pages, tutorials);
  return new Response(body, { headers: { "Content-Type": "application/xml" } });
}

// Sitemap generator
const sitemap = (stocks, articles, pages, tutorials) => `<?xml version="1.0" encoding="UTF-8" ?>
<urlset
  xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
  xmlns:xhtml="https://www.w3.org/1999/xhtml"
  xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
  xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
  xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
>
  ${pages
    .map(page => {
      const loc = `${website}${page.title}`;
      const settings = page.title === "/" ? homePageSettings : defaultStaticPageSettings;
      return createUrlElement(loc, settings);
    })
    .join("")}
  ${articles
    .map(item => {
      const loc = `${website}/blog/article/${convertToSlug(item?.title)}`;
      return createUrlElement(loc, { ...articleSettings, lastmod: item.created });
    })
    .join("")}
  ${tutorials
    .map(item => {
      const loc = `${website}/learning-center/article/${convertToSlug(item?.title)}`;
      return createUrlElement(loc, { ...tutorialSettings, lastmod: item.created });
    })
    .join("")}
  ${stocks
    .map(ticker => {
      const basePath = ticker.type === "Stock"
        ? "/stocks/"
        : ticker.type === "ETF"
        ? "/etf/"
        : "/index/";
      return createUrlElement(`${website}${basePath}${ticker.id}`, stockSettings);
    })
    .join("")}
</urlset>`;
