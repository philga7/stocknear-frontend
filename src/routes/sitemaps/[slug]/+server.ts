import { convertToSlug } from "$lib/utils";

const pages = [
  { title: "/" },
  { title: "/reddit-tracker" },
  { title: "/list/most-shorted-stocks" },
  { title: "/stocks" },
  { title: "/etf" },
  { title: "/etf/etf-providers" },
  { title: "/etf/new-launches" },
  { title: "/price-alert" },
  { title: "/donation" },
  { title: "/insider-tracker" },
  { title: "/industry" },
  { title: "/industry/sectors" },
  { title: "/industry/all" },
  { title: "/newsletter" },
  { title: "/options-flow" },
  { title: "/ipos" },
  { title: "/ipos/news" },
  { title: "/list" },
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
  { title: "/faq" },
];

const N = 100; // Change this value as needed
const sitemapPages = Array.from({ length: N }, (_, i) => ({
  title: `/sitemaps/sitemap${i + 1}.xml`
}));

const website = "https://stocknear.com";

// Helper to ensure lastmod is in "YYYY-MM-DD" format
function formatLastmod(dateString) {
  // Make sure dateString is valid and parseable
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return ""; // or handle invalid date gracefully
  }
  // Return "YYYY-MM-DD" portion only (common for sitemaps)
  return date.toISOString().split("T")[0];
}

const createUrlElement = (loc, { lastmod, changefreq, priority } = {}) => {
  let lastmodTag = "";
  if (lastmod) {
    // Reformat the date to YYYY-MM-DD
    const formattedDate = formatLastmod(lastmod);
    if (formattedDate) {
      lastmodTag = `<lastmod>${formattedDate}</lastmod>`;
    }
  }
  return `
  <url>
    <loc>${loc}</loc>
    ${lastmodTag}
    ${changefreq ? `<changefreq>${changefreq}</changefreq>` : ""}
    ${priority ? `<priority>${priority}</priority>` : ""}
  </url>
  `;
};

// Default settings for different content types.
const defaultStaticPageSettings = { changefreq: "weekly", priority: "0.8" };
const homePageSettings = { changefreq: "daily", priority: "1.0" };
const articleSettings = { changefreq: "daily", priority: "0.7" };
const tutorialSettings = { changefreq: "daily", priority: "0.7" };
const stockSettings = { changefreq: "daily", priority: "0.6" };

// Define extra subdirectories for stocks.
const stockExtraSubPaths = [
  "/financials",
  "/financials/balance-sheet",
  "/financials/cash-flow",
  "/financials/ratios",
  "/statistics",
  "/statistics/market-cap",
  "/statistics/revenue",
  "/statistics/price-reaction",
  "/statistics/fail-to-deliver",
  "/metrics",
  "/forecast",
  "/forecast/analyst",
  "/forecast/ai",
  "/dark-pool",
  "/options",
  "/options/unusual-activity",
  "/options/contract-lookup",
  "/options/hottest-contracts",
  "/options/volatility",
  "/options/oi",
  "/insider",
  "/insider/institute",
  "/insider/congress-trading",
  "/insider/transcripts",
  "/dividends",
  "/history",
  "/profile",
  "/profile/employees"
];
const etfExtraSubPaths = [
  "/holdings",
  "/dark-pool",
  "/options",
  "/options/unusual-activity",
  "/options/contract-lookup",
  "/options/hottest-contracts",
  "/options/volatility",
  "/options/oi",
  "/insider",
  "/dividends",
  "/history"
];

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, locals }) {
  const { apiKey, apiURL, pb } = locals;

  // Fetch stocks data.
  const rawData = await fetch(apiURL + "/full-searchbar", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey,
    },
  });
  const outputStocks = await rawData.json();
  const stocks = outputStocks?.map((item) => ({
    id: item?.symbol,
    type: item?.type,
  }));

  // Fetch articles and tutorials.
  const articles = await pb.collection("articles").getFullList({
    sort: "-created",
  });
  const tutorials = await pb.collection("tutorials").getFullList({
    sort: "-created",
  });

  // Extract sitemap number from params.slug (e.g. "sitemap1.xml").
  const sitemapMatch = params.slug.match(/sitemap(\d+)\.xml/);
  if (!sitemapMatch) {
    return new Response("Not Found", { status: 404 });
  }
  const sitemapIndex = parseInt(sitemapMatch[1], 10) - 1;
  if (sitemapIndex < 0 || sitemapIndex >= sitemapPages.length) {
    return new Response("Not Found", { status: 404 });
  }

  // Split the stocks array into chunks based on the number of sitemaps.
  const totalSitemaps = sitemapPages.length;
  const chunkSize = Math.ceil(stocks.length / totalSitemaps);
  const chosenStocks = stocks.slice(
    sitemapIndex * chunkSize,
    (sitemapIndex + 1) * chunkSize
  );

  // Only include pages, articles, and tutorials in the first sitemap.
  let chosenPages = [];
  let chosenArticles = [];
  let chosenTutorials = [];
  if (sitemapIndex === 0) {
    chosenPages = pages;
    chosenArticles = articles;
    chosenTutorials = tutorials;
  }

  const body = sitemap(chosenStocks, chosenArticles, chosenPages, chosenTutorials);
  const response = new Response(body);
  response.headers.set("Content-Type", "application/xml");
  return response;
}

// Sitemap generation function.
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
    ?.map((page) => {
      const loc = `${website}${page.title}`;
      const settings = page.title === "/" ? homePageSettings : defaultStaticPageSettings;
      return createUrlElement(loc, settings);
    })
    ?.join("")}
  ${articles
    ?.map((item) => {
      const loc = `${website}/blog/article/${convertToSlug(item?.title)}`;
      return createUrlElement(loc, { ...articleSettings, lastmod: item.created });
    })
    ?.join("")}
  ${tutorials
    ?.map((item) => {
      const loc = `${website}/learning-center/article/${convertToSlug(item?.title)}`;
      return createUrlElement(loc, { ...tutorialSettings, lastmod: item.created });
    })
    ?.join("")}
  ${stocks
    ?.map((ticker) => {
      // Determine the base path.
      const basePath =
        ticker.type === "Stock"
          ? "/stocks/"
          : ticker.type === "ETF"
          ? "/etf/"
          : "/index/";
      // Main URL element for the ticker.
      let urlElements = createUrlElement(`${website}${basePath}${ticker.id}`, stockSettings);
      
      // For stocks only, add extra subdirectory URLs.
      if (ticker.type === "Stock") {
        stockExtraSubPaths?.forEach((subPath) => {
          urlElements += createUrlElement(`${website}${basePath}${ticker.id}${subPath}`, stockSettings);
        });
      } else if (ticker.type === "ETF") {
        etfExtraSubPaths?.forEach((subPath) => {
          urlElements += createUrlElement(`${website}${basePath}${ticker.id}${subPath}`, stockSettings);
        });
      }
      
      return urlElements;
    })
    ?.join("")}
</urlset>
`;
