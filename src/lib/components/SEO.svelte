<script lang="ts">
  export let title = "Free Online Stock Analysis for Investors";
  import { page } from "$app/stores";

  export let description =
    "Stocknear has everything you need to analyze stocks with help of AI, including detailed financial data, statistics, news and charts.";
  export let image = null;

  const baseURL = "https://stocknear.com";
  const canonical = baseURL + $page.url.pathname;
</script>

<svelte:head>
  <meta charset="utf-8" />
  <link rel="canonical" href={canonical} />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
  />
  <title>
    {title} - Stocknear
  </title>

  <meta name="description" content={description} />

  <!-- Open Graph meta tags -->
  <meta property="og:title" content={`${title} - Stocknear`} />
  <meta property="og:description" content={description} />
  <meta property="og:type" content="website" />
  {#if image}
    <meta property="og:image" content={image} />
    <meta property="og:image:alt" content={title} />
  {:else}
    <meta property="og:image" content="img/astronaut.png" />
  {/if}

  <!-- Twitter meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={`${title} - Stocknear`} />
  <meta name="twitter:description" content={description} />
  {#if image}
    <meta name="twitter:image" content={image} />
  {:else}
    <meta property="twitter:image" content="/img/astronaut.png" />
  {/if}
</svelte:head>
