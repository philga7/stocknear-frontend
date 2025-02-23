
const N = 100; // Change this value as needed
const sitemapPages = Array?.from({ length: N }, (_, i) => ({
  title: `/sitemaps/sitemap${i + 1}.xml`
}));

const website = "https://stocknear.com";

// Helper function to create an XML URL element with optional SEO tags.
const createUrlElement = (loc, { lastmod, changefreq, priority } = {}) => {
  return `
  <url>
    <loc>${loc}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}
    ${changefreq ? `<changefreq>${changefreq}</changefreq>` : ""}
    ${priority ? `<priority>${priority}</priority>` : ""}
  </url>
  `;
};

/** @type {import('./$types').RequestHandler} */
export async function GET({ locals }) {


  

  const body = sitemap(sitemapPages);
  const response = new Response(body);
  response.headers.set("Content-Type", "application/xml");
  return response;
}

// Default settings for different content types.
const defaultStaticPageSettings = { changefreq: "daily", priority: "1.0" };



const sitemap = (sitemapPages) => `<?xml version="1.0" encoding="UTF-8" ?>
<urlset
  xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
  xmlns:xhtml="https://www.w3.org/1999/xhtml"
  xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
  xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
  xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
>
  ${sitemapPages
    ?.map((page) => {
      const loc = `${website}${page.title}`;
      const settings = defaultStaticPageSettings;
      return createUrlElement(loc, settings);
    })
    ?.join("")}
</urlset>
`;

