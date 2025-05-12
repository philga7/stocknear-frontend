<script lang="ts">
  import { stockTicker, displayCompanyName } from "$lib/store";

  import Infobox from "$lib/components/Infobox.svelte";
  import SEO from "$lib/components/SEO.svelte";

  import MaxPain from "$lib/components/Options/MaxPain.svelte";

  export let data;
</script>

<SEO
  title={`${$displayCompanyName} (${$stockTicker?.toUpperCase()}) Options Max Pain Chart`}
  description={`View the Max Pain chart for ${$displayCompanyName} (${$stockTicker?.toUpperCase()}) to analyze options strike price pressure and market sentiment.`}
/>

<section class="w-full overflow-hidden min-h-screen">
  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      {#if data?.getData?.length > 0}
        <MaxPain {data} ticker={$stockTicker?.toUpperCase()} />
      {:else}
        <div class="sm:pl-7 sm:pb-7 sm:pt-7 w-full m-auto">
          <div class="">
            <Infobox text="No Max Pain data available for the company." />
          </div>
        </div>
      {/if}
    </div>
  </div>
</section>
