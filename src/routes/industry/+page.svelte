<script lang="ts">
  import { screenWidth } from "$lib/store";
  import IndustryTable from "$lib/components/IndustryTable.svelte";
  import { industryList, sectorList, sectorNavigation } from "$lib/utils";
  import SEO from "$lib/components/SEO.svelte";
  import Infobox from "$lib/components/Infobox.svelte";

  export let data;
  let rawData = data?.getSectorIndustryOverview;

  $: charNumber = $screenWidth < 640 ? 20 : 30;
</script>

<SEO
  title="Stock Sectors & Industries"
  description={`A list of ${sectorList?.length} sectors and ${industryList?.length} industries used to categorize stocks based on the company's primary business activity.`}
/>

<section class="w-full overflow-hidden m-auto">
  <Infobox
    text={`We categorize stocks into ${sectorList?.length} sectors and ${industryList?.length}
    industries, based on the company's primary business activity.`}
  />

  <!-- Page wrapper -->
  <div class="flex justify-center w-full m-auto h-full overflow-hidden">
    <!-- Content area -->
    <div class="w-full">
      {#each sectorList as sector}
        <div class="mt-4">
          <a
            href={sectorNavigation?.find((item) => item?.title === sector)
              ?.link}
            class=" cursor-pointer sm:hover:underline font-semibold text-lg sm:text-xl"
          >
            Sector: {sector}
            <svg
              class="inline-block h-6 w-6 -mt-1"
              viewBox="0 0 20 20"
              fill="currentColor"
              style="max-width:40px"
              ><path
                fill-rule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clip-rule="evenodd"
              ></path></svg
            >
          </a>
        </div>

        <div class="border-t border-gray-300 dark:border-gray-600 mt-5" />

        <IndustryTable {charNumber} industryList={rawData[sector]} />
        <div class="border-t border-gray-300 dark:border-gray-600 mt-5" />
      {/each}
    </div>
  </div>
</section>
