<script lang="ts">
  import Infobox from "$lib/components/Infobox.svelte";
  import GreekExposure from "$lib/components/Options/GreekExposure.svelte";
  import SEO from "$lib/components/SEO.svelte";

  export let data;
</script>

<SEO
  title="Daily Gamma Exposure"
  description="Analyze daily gamma exposure with historic options volume and open interest data. Save individual contracts for future reference and optimize your trading strategy."
/>

<section
  class="w-full bg-default overflow-hidden text-white min-h-screen pb-40"
>
  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      {#if data?.getData?.length > 0}
        <GreekExposure {data} title="Gamma" />
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
