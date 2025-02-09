<script lang="ts">
    import { indexTicker, stockTicker } from "$lib/store";
    import {
      formatString,
      abbreviateNumber,
      sectorNavigation,
    } from "$lib/utils";
  
    import { goto } from "$app/navigation";
  
    export let data;
  
    let info;
    let topHoldingList = [];
    let topSectorList = [];
    let description = "";
  
    let assetClass = "-";
    let totalAssetPercentage = 0;
  

    async function stockSelector(ticker: string) {
      if (ticker?.length !== 0 && !["BTCUSD", "USD"]?.includes(ticker)) {
        window?.scroll({ top: 0, left: 0, behavior: "smooth" });
        stockTicker.update((value) => ticker);
        goto("/stocks/" + ticker + "/");
      }
    }
  
    $: {
      if ($indexTicker) {
        info = data?.getIndexProfile?.at(0);
        topHoldingList = data?.getIndexHoldings?.holdings || [];
        topSectorList = data?.getIndexSectorWeighting || [];
        assetClass = info?.assetClass;
       
        description =
          info?.description ??
          "A detailed description of the company is not yet available.";
  
        totalAssetPercentage = topHoldingList
          ?.slice(0, 5)
          ?.reduce((acc, current) => acc + current?.weightPercentage, 0)
          ?.toFixed(2);
      }
    }
  </script>
  
  <div class="px-0.5 lg:px-0">
    <h2 class="mb-2 text-2xl text-white font-semibold">
      About {$indexTicker}
    </h2>
    <p class="text-gray-200">
      {description}
    </p>
  
    <div
      class="mt-3 grid grid-cols-2 gap-3 w-full border-b border-gray-600 lg:border-none pb-8 lg:pb-0"
    >
      <div class="col-span-1 text-gray-200">
        <span class="block font-semibold">Asset Class</span>
        <span class=" text-white">{assetClass}</span>
      </div>
      <div class="col-span-1 text-gray-200">
        <span class="block font-semibold">Ticker Symbol</span>
        {$indexTicker}
      </div>
     
     
  
   
    </div>
  </div>
  
  {#if topSectorList?.length !== 0}
    <div class="space-y-3 pt-5 {topSectorList?.length !== 0 ? '' : 'hidden'}">
      <div class="h-auto w-full">
        <!--Start Content-->
        <div class="w-auto lg:w-full flex flex-col m-auto">
          <h2
            class="mb-2 text-2xl text-white font-semibold flex flex-row items-center"
          >
            <span>Top Sectors</span>
          </h2>
  
          <div class="mt-2 w-full overflow-hidden">
            <table class="w-full table table-sm table table-compact w-full">
              <thead>
                <tr>
                  <th
                    class="text-white font-semibold text-sm text-start bg-default"
                    >Sector</th
                  >
  
                  <th class="text-white font-semibold text-sm text-end bg-default"
                    >Weight %</th
                  >
                </tr>
              </thead>
              <tbody>
                {#each topSectorList as item}
                  {#if item?.weightPercentage > 0}
                    <tr class="text-white border-b border-[#27272A]">
                      <td class="text-start text-sm sm:text-[1rem]">
                        <a
                          href={sectorNavigation?.find(
                            (listItem) => listItem?.title === item?.sector,
                          )?.link}
                          class="sm:hover:underline sm:hover:underline-offset-4 text-white truncate"
                        >
                          {item?.sector}
                        </a>
                      </td>
  
                      <td class="text-white font-semibold text-end">
                        {abbreviateNumber(item?.weightPercentage?.toFixed(2))}%
                      </td>
                    </tr>
                  {/if}
                {/each}
              </tbody>
            </table>
          </div>
  
          <a
            href={`/industry/sectors`}
            class="rounded cursor-pointer w-full m-auto py-2 h-full mt-6 text-[1rem] text-center font-semibold text-black sm:hover:hover:bg-gray-300 bg-[#ffff] transition duration-100"
          >
            All Sectors
          </a>
        </div>
      </div>
    </div>
  {/if}
  
  {#if topHoldingList?.length !== 0}
    <div
      class="space-y-3 pt-8 sm:pt-5 {topHoldingList?.length !== 0
        ? ''
        : 'hidden'}"
    >
      <div class="h-auto w-full">
        <!--Start Content-->
        <div class="w-auto lg:w-full flex flex-col m-auto">
          <h2
            class="mb-2 text-2xl text-white font-semibold flex flex-row items-center"
          >
            <span>Top Holdings</span>
            <span class="text-white font-semibold ml-auto text-sm">
              {totalAssetPercentage}% of assets
            </span>
          </h2>
  
          <div class="mt-2 w-full">
            <table class="table table-sm table-compact w-full">
              <thead>
                <tr>
                  <th
                    class="text-white font-semibold text-sm text-start bg-default"
                    >Company</th
                  >
  
                  <th class="text-white font-semibold text-sm text-end bg-default"
                    >Portfolio</th
                  >
                </tr>
              </thead>
              <tbody>
                {#each topHoldingList?.slice(0, 5) as item}
                  {#if item?.symbol !== null}
                    <tr
                      on:click={() => stockSelector(item?.symbol)}
                      class="lg:shake-ticker sm:hover:text-white text-blue-400 cursor-pointer lg:hover:bg-[#245073] lg:hover:bg-opacity-[0.2] [#09090B] border-b border-[#27272A]"
                    >
                      <td class="">
                        <div class="flex flex-row items-center">
                          <div class="flex flex-col w-full">
                            <span class="text-sm font-medium"
                              >{item?.symbol ?? "n/a"}</span
                            >
                            <span class="text-white text-sm">
                              {#if typeof item?.name !== "undefined"}
                                {item?.name?.length > 20
                                  ? formatString(item?.name?.slice(0, 20)) + "..."
                                  : formatString(item?.name)?.replace(
                                      "Usd",
                                      "USD",
                                    )}
                              {:else}
                                n/a
                              {/if}
                            </span>
                          </div>
                        </div>
                      </td>
  
                      <td class="text-white font-semibold text-end">
                        {abbreviateNumber(item?.weightPercentage?.toFixed(2))}%
                      </td>
                    </tr>
                  {/if}
                {/each}
              </tbody>
            </table>
          </div>
  
          <a
            href={`/etf/${$indexTicker}/holdings`}
            class="rounded cursor-pointer w-full m-auto py-2 h-full mt-6 text-[1rem] text-center font-semibold text-black sm:hover:hover:bg-gray-300 bg-[#ffff] transition duration-100"
          >
            All Holdings
          </a>
        </div>
      </div>
    </div>
  {/if}
  
  