<script lang="ts">
  import { etfTicker, displayCompanyName } from "$lib/store";

  import Infobox from "$lib/components/Infobox.svelte";
  import SEO from "$lib/components/SEO.svelte";

  import OpenInterestByStrike from "$lib/components/Options/OpenInterestByStrike.svelte";

  export let data;
</script>

<SEO
  title="Open Interest by Strike Price"
  description={`Discover detailed Open Interest analysis by strike price for ${$displayCompanyName} (${$etfTicker}). Explore historical volume, open interest, and save individual options contracts for in-depth insights.`}
/>

<section class="w-full overflow-hidden min-h-screen pb-40">
  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      {#if data?.getData?.length > 0}
        {#key $etfTicker}
          <OpenInterestByStrike {data} ticker={$etfTicker?.toUpperCase()} />
        {/key}
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
