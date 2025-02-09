<script lang="ts">
  import { etfTicker, displayCompanyName } from "$lib/store";

  import Infobox from "$lib/components/Infobox.svelte";
  import SEO from "$lib/components/SEO.svelte";

  import Volatility from "$lib/components/Options/Volatility.svelte";

  export let data;
</script>

<SEO
  title={`${$displayCompanyName} (${$etfTicker}) Volatility · Stocknear`}
  description={`Track volatility and implied volatility trends with our interactive chart. Analyze price movements, 30-day implied volatility, and realized volatility to make data-driven trading decisions.`}
/>

<section
  class="w-full bg-default overflow-hidden text-white min-h-screen pb-40"
>
  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      {#if data?.getData?.length > 0}
        <Volatility {data} />
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
