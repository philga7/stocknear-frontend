<script lang="ts">
  import { indexTicker, displayCompanyName } from "$lib/store";
  import SEO from "$lib/components/SEO.svelte";

  import Infobox from "$lib/components/Infobox.svelte";
  import GreekByExpiry from "$lib/components/Options/GreekByExpiry.svelte";

  export let data;
  let rawData = data?.getData || [];
</script>

<SEO
  title="Gamma Exposure By Expiry"
  description={`Analyze gamma exposure for ${$displayCompanyName} (${$indexTicker}) by expiry. Access historical volume, open interest trends, and save options contracts for detailed analysis and insights.`}
/>

<section
  class="w-full bg-default overflow-hidden text-white min-h-screen pb-40"
>
  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      {#if rawData?.length > 0}
        <GreekByExpiry {data} title="Gamma" />
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
