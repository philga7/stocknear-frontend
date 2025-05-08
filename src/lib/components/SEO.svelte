<script lang="ts">
  export let title = "Free Online Stock Analysis for Investors";
  export let description =
    "Stocknear gives you realtime market insights for your stock analysis with up-to-date financials, news, and interactive charts.";

  export let image: string | null = null;

  import { page } from "$app/stores";
  const baseURL = "https://stocknear.com";
  const canonical = baseURL + ($page?.url?.pathname || "");
  const defaultImage = `${baseURL}/img/astronaut.png`;
  const shareImage = image ?? defaultImage;
  const siteName = "Stocknear";
  const twitterHandle = "@stocknear"; // your Twitter handle
</script>

<svelte:head>
  <!-- Character set & viewport -->
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="index, follow" />

  <!-- Canonical URL -->
  <link rel="canonical" href={canonical} />

  <!-- Title & description -->
  <title>{title} - {siteName}</title>
  <meta name="description" content={description} />

  <!-- Favicons & theme -->
  <link rel="icon" href="/favicon.ico" />
  <link
    rel="apple-touch-icon"
    sizes="180x180"
    href={baseURL + "/apple-touch-icon.png"}
  />
  <meta name="theme-color" content="#09090B" />

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
    {JSON?.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "url": baseURL,
      "name": siteName,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${baseURL}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    })}
  </script>

  <!-- Open Graph -->
  <meta property="og:locale" content="en_US" />
  <meta property="og:site_name" content={siteName} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={canonical} />
  <meta property="og:title" content={`${title} - ${siteName}`} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={shareImage} />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content={twitterHandle} />
  <meta name="twitter:creator" content={twitterHandle} />
  <meta name="twitter:title" content={`${title} - ${siteName}`} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={shareImage} />

  <!-- Apple mobile web-app -->
  <meta name="apple-mobile-web-app-title" content={siteName} />
</svelte:head>
