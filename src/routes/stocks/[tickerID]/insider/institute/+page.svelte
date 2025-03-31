<script lang="ts">
  import { displayCompanyName, stockTicker } from "$lib/store";

  import ShareHolders from "$lib/components/ShareHolders.svelte";
  import SEO from "$lib/components/SEO.svelte";

  export let data;
</script>

<SEO
  title={`${$displayCompanyName} (${$stockTicker}) 13F Institute Ownership`}
  description={`Get the latest 13F Institute Ownership of ${$displayCompanyName} (${$stockTicker}).`}
/>

<section class="w-full overflow-hidden h-full">
  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <div class="sm:pl-7 sm:pb-7 sm:pt-5 w-full m-auto mt-2 sm:mt-0">
        <div class="w-full">
          <h1 class="text-xl sm:text-2xl font-bold">13F Institute Ownership</h1>
        </div>

        <ShareHolders {data} />
      </div>
    </div>
  </div>
</section>
