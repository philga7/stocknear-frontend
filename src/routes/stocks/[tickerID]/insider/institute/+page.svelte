<script lang="ts">
  import {
    displayCompanyName,
    numberOfUnreadNotification,
    stockTicker,
  } from "$lib/store";

  import ShareHolders from "$lib/components/ShareHolders.svelte";
  import SEO from "$lib/components/SEO.svelte";

  export let data;
</script>



<SEO title={`${$displayCompanyName} (${$stockTicker}) 13F Institute Ownership · Stocknear`}
  description={`Get the latest 13F Institute Ownership of ${$displayCompanyName} (${$stockTicker}).`}
/>

<section class="w-full bg-default overflow-hidden text-white h-full">
  <div class="w-full flex h-full overflow-hidden">

    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <div class="sm:pl-7 sm:pb-7 sm:pt-7 w-full m-auto mt-2 sm:mt-0">
        <div class="w-full mb-6">
          <h1 class="text-xl sm:text-2xl text-white font-bold mb-4">
            13F Institute Ownership
          </h1>
        </div>

        <ShareHolders {data} />
      </div>
    </div>
  </div>
</section>
