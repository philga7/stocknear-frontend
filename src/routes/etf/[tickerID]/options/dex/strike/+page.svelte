<script lang="ts">
  import {
    etfTicker,
    numberOfUnreadNotification,
    displayCompanyName,
  } from "$lib/store";

  import Infobox from "$lib/components/Infobox.svelte";

  import GreekByStrike from "$lib/components/Options/GreekByStrike.svelte";

  export let data;
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""}
    {$displayCompanyName} ({$etfTicker}) Delta Exposure by Strike Price ·
    Stocknear
  </title>
  <meta
    name="description"
    content={`Discover detailed Delta Exposure analysis by strike price for ${$displayCompanyName} (${$etfTicker}). Explore historical volume, open interest, and save individual options contracts for in-depth insights.`}
  />

  <!-- Other meta tags -->
  <meta
    property="og:title"
    content={`${$displayCompanyName} (${$etfTicker}) Delta Exposure by Strike Price · Stocknear`}
  />
  <meta
    property="og:description"
    content={`Discover detailed Delta Exposure analysis by strike price for ${$displayCompanyName} (${$etfTicker}). Explore historical volume, open interest, and save individual options contracts for in-depth insights.`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={`${$displayCompanyName} (${$etfTicker}) Delta Exposure by Strike Price · Stocknear`}
  />
  <meta
    name="twitter:description"
    content={`Discover detailed Delta Exposure analysis by strike price for ${$displayCompanyName} (${$etfTicker}). Explore historical volume, open interest, and save individual options contracts for in-depth insights.`}
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<section class="w-full overflow-hidden min-h-screen pb-40">
  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      {#if data?.getData?.length > 0}
        <GreekByStrike {data} title="Delta" />
      {:else}
        <div class="sm:pl-7 sm:pb-7 sm:pt-7 w-full m-auto mt-2 sm:mt-0">
          <div class="mt-2">
            <Infobox text="No data is available" />
          </div>
        </div>
      {/if}
    </div>
  </div>
</section>
