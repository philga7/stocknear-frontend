<script lang="ts">
  import { stockTicker, displayCompanyName } from "$lib/store";
  import SEO from "$lib/components/SEO.svelte";

  import Infobox from "$lib/components/Infobox.svelte";

  import GreekByStrike from "$lib/components/Options/GreekByStrike.svelte";

  export let data;
</script>

<SEO
  title={`${$displayCompanyName} (${$stockTicker}) Delta Exposure by Strike Price`}
  description={`Discover detailed Delta Exposure analysis by strike price for ${$displayCompanyName} (${$stockTicker}). Explore historical volume, open interest, and save individual options contracts for in-depth insights.`}
/>

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
