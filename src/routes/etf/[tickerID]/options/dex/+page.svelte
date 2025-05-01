<script lang="ts">
  import Infobox from "$lib/components/Infobox.svelte";
  import GreekExposure from "$lib/components/Options/GreekExposure.svelte";
  import SEO from "$lib/components/SEO.svelte";
  import { etfTicker, displayCompanyName } from "$lib/store";

  export let data;
</script>

<SEO
  title="Daily Delta Exposure"
  description={`Analyze daily delta exposure for ${$displayCompanyName} (${$etfTicker}). Access historical volume, open interest trends, and save options contracts for detailed analysis and insights.`}
/>

<section class="w-full overflow-hidden min-h-screen pb-40">
  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      {#if data?.getData?.length > 0}
        {#key $etfTicker}
          <GreekExposure {data} title="Delta" ticker={$etfTicker} />
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
