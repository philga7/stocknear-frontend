<script lang="ts">
    import { indexTicker } from "$lib/store";
    import {
      abbreviateNumber,
      sectorNavigation,
    } from "$lib/utils";
  
  
    export let data;
  
    let info;
    let topSectorList = [];
    let description = "";
  
  

    $: {
      if ($indexTicker) {
        info = data?.getIndexProfile?.at(0);
        topSectorList = data?.getIndexSectorWeighting || [];
       
        description =
          info?.description ??
          "A detailed description of the company is not yet available.";
  
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
  
 
  