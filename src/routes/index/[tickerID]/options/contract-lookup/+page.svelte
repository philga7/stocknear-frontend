<script lang="ts">
  import { indexTicker, displayCompanyName } from "$lib/store";

  import SEO from "$lib/components/SEO.svelte";
  import ContractLookup from "$lib/components/Options/ContractLookup.svelte";
  import Infobox from "$lib/components/Infobox.svelte";

  export let data;
</script>

<SEO
  title={`${$displayCompanyName} (${$indexTicker}) | In-Depth Options Contract Analysis`}
  description={`Explore detailed options contract data for ${$displayCompanyName} (${$indexTicker}). Analyze historical volume, open interest, and trends to uncover actionable trading insights.`}
/>

<section class="w-full overflow-hidden min-h-screen pb-40">
  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      {#if Object?.keys(data?.getData)?.length > 0}
        <ContractLookup {data} ticker={$indexTicker} />
      {:else}
        <div class="sm:pl-7 sm:pb-7 sm:pt-7 w-full m-auto">
          <Infobox text="No data is available" />
        </div>
      {/if}
    </div>
  </div>
</section>
