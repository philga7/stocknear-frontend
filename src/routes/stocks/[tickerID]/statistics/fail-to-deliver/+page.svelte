<script lang="ts">
  import { displayCompanyName, stockTicker } from "$lib/store";
  import { abbreviateNumber, removeCompanyStrings } from "$lib/utils";
  import Infobox from "$lib/components/Infobox.svelte";
  import FailToDeliver from "$lib/components/FailToDeliver.svelte";
  import SEO from "$lib/components/SEO.svelte";

  export let data;

  let rawData = data?.getData || [];
  let changePercentageYearAgo = 0;
  let relativeFTD =
    data?.getStockQuote?.avgVolume > 0
      ? (
          (rawData?.slice(-1)?.at(0)?.failToDeliver /
            data?.getStockQuote?.avgVolume) *
          100
        )?.toFixed(2)
      : "n/a";

  function computeYearOverYearChange(rawData) {
    if (rawData.length < 2) {
      return null; // Not enough rawData to compute change
    }

    // Step 1: Get the last entry in the list
    const lastEntry = rawData[rawData.length - 1];
    const lastDate = new Date(lastEntry.date);
    const lastValue = rawData?.slice(-1)?.at(0).failToDeliver;

    // Step 2: Find the entry closest to one year before the last date
    let closestEntry = null;
    for (let i = rawData.length - 2; i >= 0; i--) {
      const entryDate = new Date(rawData[i].date);
      const oneYearAgo = new Date(lastDate);
      oneYearAgo.setFullYear(lastDate.getFullYear() - 1);

      // Check if the entry is close to one year ago
      if (entryDate <= oneYearAgo) {
        closestEntry = rawData[i];
        break;
      }
    }

    if (!closestEntry) {
      return null; // No suitable entry found for comparison
    }

    const prevValue = closestEntry?.failToDeliver;

    // Step 3: Calculate the percentage change
    const change = ((lastValue - prevValue) / prevValue) * 100;

    return change;
  }

  changePercentageYearAgo = computeYearOverYearChange(rawData);
</script>

<SEO
  title={`${$displayCompanyName} (${$stockTicker}) Fail-to-Deliver Shares`}
  description={`Historical Fail-to-Deliver shares of ${$displayCompanyName}.`}
/>

<section class="bg-default w-full overflow-hidden text-white h-full">
  <div class="w-full flex justify-center w-full sm-auto h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <main class="w-full">
        <div class="sm:pl-7 sm:pb-7 sm:pt-7 m-auto mt-2 sm:mt-0">
          <div class="mb-3">
            <h1 class="text-xl sm:text-2xl text-white font-bold">
              {removeCompanyStrings($displayCompanyName)} Fail-to-Deliver
            </h1>
          </div>

          {#if rawData?.length !== 0}
            <div
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
            >
              <div
                class="bg-gray-800/30 rounded-lg p-4 sm:hover:bg-gray-800/40 transition-colors"
              >
                <div class="text-[#c3c6d0] text-sm mb-2 flex items-center">
                  <span>Total FTD Shares</span>
                </div>
                <div class="flex items-baseline">
                  <span class="text-xl font-bold text-white">
                    {abbreviateNumber(
                      rawData?.slice(-1)?.at(0)?.failToDeliver,
                      false,
                    )}</span
                  >
                  <div class="flex flex-col ml-2">
                    <span class="text-sm text-violet-400">
                      {rawData?.slice(-1)?.at(0)?.failToDeliver > 1e5
                        ? "Above Average"
                        : "Below Average"}
                    </span>
                  </div>
                </div>
              </div>

              <div
                class="bg-gray-800/30 rounded-lg p-4 sm:hover:bg-gray-800/40 transition-colors"
              >
                <div class="text-[#c3c6d0] text-sm mb-2 flex items-center">
                  <span>FTD / Avg. Volume</span>
                </div>
                <div class="flex items-baseline">
                  <span class="text-xl font-bold text-white"
                    >{relativeFTD > 0.01
                      ? relativeFTD + "%"
                      : relativeFTD !== "n/a"
                        ? "< 0.01%"
                        : "n/a"}</span
                  >
                  <div class="flex flex-col ml-2">
                    <span class="text-sm text-red-400">
                      {relativeFTD > 20 ? "High Impact" : "Low Impact"}
                    </span>
                  </div>
                </div>
              </div>

              <div
                class="bg-gray-800/30 rounded-lg p-4 sm:hover:bg-gray-800/40 transition-colors"
              >
                <div class="text-[#c3c6d0] text-sm mb-2 flex items-center">
                  <span>1-Year Change</span>
                </div>
                <div class="flex items-baseline">
                  <span class="text-xl font-bold text-white"
                    >{changePercentageYearAgo > 100
                      ? "> 100"
                      : changePercentageYearAgo?.toFixed(1)}%</span
                  >
                  <div class="flex flex-col ml-2">
                    <span
                      class="text-sm {changePercentageYearAgo >= 0 &&
                      changePercentageYearAgo !== null
                        ? "before:content-['+'] text-[#00FC50]"
                        : changePercentageYearAgo < 0 &&
                            changePercentageYearAgo !== null
                          ? 'text-[#FF2F1F]'
                          : 'text-white'}"
                    >
                      {changePercentageYearAgo >= 0 ? "Positive" : "Negative"} Trend
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-2">
              <FailToDeliver {data} {rawData} />
            </div>
          {:else}
            <Infobox text="No data available" />
          {/if}
        </div>
      </main>
    </div>
  </div>
</section>
