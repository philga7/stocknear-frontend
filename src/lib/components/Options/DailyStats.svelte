<script lang="ts">
  import InfoModal from "$lib/components/InfoModal.svelte";
  import { abbreviateNumber } from "$lib/utils";
  import * as HoverCard from "$lib/components/shadcn/hover-card/index.js";

  export let rawData = {};
</script>

<div class="">
  <label
    for="dailyStats"
    class="mr-1 cursor-pointer flex flex-row items-center text-xl sm:text-2xl font-bold w-fit"
  >
    Daily Stats
    <InfoModal
      title={"Daily Stats"}
      content={"Options activity stats provide insights into the trading behavior of options contracts. These statistics help traders to understand market sentiment, liquidity, and potential price movements for underlying assets."}
      id={"dailyStats"}
    />
  </label>
  <div
    class="mt-5 order-5 lg:order-1 flex flex-row space-x-2 sm:space-x-3 xs:space-x-4"
  >
    <table class="w-[50%] text-sm sm:text-[1rem] xl:min-w-[300px]">
      <tbody
        ><tr
          class="flex flex-col border-b border-gray-300 dark:border-gray-600 py-1 sm:table-row sm:py-0"
          ><td
            class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
            >Call Volume</td
          >
          <td
            class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
            >{abbreviateNumber(rawData?.call_volume)}</td
          ></tr
        >

        <tr
          class="flex flex-col border-b border-gray-300 dark:border-gray-600 py-1 sm:table-row sm:py-0"
          ><td
            class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
            >Call Premium</td
          >
          <td
            class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
            >{abbreviateNumber(rawData?.call_premium)}</td
          ></tr
        >

        <tr
          class="flex flex-col border-b border-gray-300 dark:border-gray-600 py-1 sm:table-row sm:py-0"
          ><td
            class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
            >Premium</td
          >
          <td
            class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
            >{abbreviateNumber(
              rawData?.call_premium + rawData?.put_premium,
              false,
              true,
            )}</td
          ></tr
        >
        <tr
          class="flex flex-col border-b border-gray-300 dark:border-gray-600 py-1 sm:table-row sm:py-0"
          ><td
            class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
            >Call Open Interest</td
          >
          <td
            class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
            >{abbreviateNumber(rawData?.call_open_interest)}</td
          ></tr
        >
        <tr
          class="flex flex-col border-b border-gray-300 dark:border-gray-600 py-1 sm:table-row sm:py-0"
          ><td
            class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
            >Implied Volatility (IV)
          </td>
          <td
            class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
            >{rawData?.iv}</td
          ></tr
        >
        <tr
          class="flex flex-col border-b border-gray-300 dark:border-gray-600 py-1 sm:table-row sm:py-0"
          ><td
            class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
            >Total Open Interest</td
          >
          <td
            class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
            >{abbreviateNumber(rawData?.total_open_interest)}</td
          ></tr
        >
        <tr
          class="flex flex-col border-b border-gray-300 dark:border-gray-600 py-1 sm:table-row sm:py-0"
          ><td
            class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
            >Net Premium
          </td>
          <td
            class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
            >{rawData?.net_premium
              ? abbreviateNumber(rawData?.net_premium)
              : "n/a"}</td
          ></tr
        >
      </tbody>
    </table>
    <table class="w-[50%] text-sm xl:min-w-[300px]">
      <tbody
        ><tr
          class="flex flex-col border-b border-gray-300 dark:border-gray-600 py-1 sm:table-row sm:py-0"
          ><td
            class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
            >Put Volume</td
          >
          <td
            class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
            >{abbreviateNumber(rawData?.put_volume)}</td
          ></tr
        >

        <tr
          class="flex flex-col border-b border-gray-300 dark:border-gray-600 py-1 sm:table-row sm:py-0"
          ><td
            class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
            >Put Premium</td
          >
          <td
            class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
            >{abbreviateNumber(rawData?.put_premium)}</td
          ></tr
        >

        <tr
          class="flex flex-col border-b border-gray-300 dark:border-gray-600 py-1 sm:table-row sm:py-0"
          ><td
            class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
            >P/C Ratio</td
          >
          <td
            class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
            >{rawData?.putCallRatio}</td
          ></tr
        >

        <tr
          class="flex flex-col border-b border-gray-300 dark:border-gray-600 py-1 sm:table-row sm:py-0"
          ><td
            class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
            >Put Open Interest</td
          >
          <td
            class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
            >{abbreviateNumber(rawData?.put_open_interest)}</td
          ></tr
        >

        <tr
          class="flex flex-col border-b border-gray-300 dark:border-gray-600 py-1 sm:table-row sm:py-0"
          ><td
            class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
            >IV Rank</td
          >
          <td
            class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
            >{rawData?.iv_rank ?? "n/a"}</td
          ></tr
        >

        <tr
          class="flex flex-col border-b border-gray-300 dark:border-gray-600 py-1 sm:table-row sm:py-0"
          ><td
            class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
            >🐻/🐂 Prem
          </td>
          <td
            class="whitespace-nowrap w-full px-0.5 py-[1px] text-left text-sm font-semibold xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
          >
            {#if rawData?.premium_ratio?.at(0)}
              <HoverCard.Root>
                <HoverCard.Trigger
                  class="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-black"
                >
                  <div class="flex items-center sm:justify-end">
                    <!-- Bar Container -->
                    <div
                      class="flex w-full max-w-28 h-5 bg-gray-200 rounded-md overflow-hidden"
                    >
                      <!-- Bearish -->
                      <div
                        class="bg-red-500 h-full"
                        style="width: calc(({rawData?.premium_ratio?.at(
                          0,
                        )} / ({rawData?.premium_ratio?.at(
                          0,
                        )} + {rawData?.premium_ratio?.at(
                          1,
                        )} + {rawData?.premium_ratio?.at(2)})) * 100%)"
                      ></div>

                      <!-- Neutral -->
                      <div
                        class="bg-gray-300 h-full"
                        style="width: calc(({rawData?.premium_ratio?.at(
                          1,
                        )} / ({rawData?.premium_ratio?.at(
                          0,
                        )} + {rawData?.premium_ratio?.at(
                          1,
                        )} + {rawData?.premium_ratio?.at(2)})) * 100%)"
                      ></div>

                      <!-- Bullish -->
                      <div
                        class="bg-green-500 h-full"
                        style="width: calc(({rawData?.premium_ratio?.at(
                          2,
                        )} / ({rawData?.premium_ratio?.at(
                          0,
                        )} + {rawData?.premium_ratio?.at(
                          1,
                        )} + {rawData?.premium_ratio?.at(2)})) * 100%)"
                      ></div>
                    </div>
                  </div>
                </HoverCard.Trigger>
                <HoverCard.Content
                  class="w-auto bg-secondary border border-gray-300 dark:border-gray-600"
                >
                  <div class="flex justify-between space-x-4">
                    <div class="space-y-1 flex flex-col items-start">
                      <div>
                        Bearish: {abbreviateNumber(
                          rawData?.premium_ratio?.at(0),
                          false,
                          true,
                        )}
                      </div>
                      <div>
                        Neutral: {abbreviateNumber(
                          rawData?.premium_ratio?.at(1),
                          false,
                          true,
                        )}
                      </div>
                      <div>
                        Bullish: {abbreviateNumber(
                          rawData?.premium_ratio?.at(2),
                          false,
                          true,
                        )}
                      </div>
                    </div>
                  </div>
                </HoverCard.Content>
              </HoverCard.Root>
            {:else}
              n/a
            {/if}
          </td>
        </tr>

        <tr
          class="flex flex-col border-b border-gray-300 dark:border-gray-600 py-1 sm:table-row sm:py-0"
          ><td
            class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
            >(Net Call x Net Put) Prem</td
          >
          <td
            class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
          >
            {#if rawData?.net_call_premium || rawData?.net_put_premium}
              {abbreviateNumber(rawData?.net_call_premium)}
              x {abbreviateNumber(rawData?.net_put_premium)}
            {:else}
              n/a
            {/if}
          </td></tr
        >
      </tbody>
    </table>
  </div>
</div>
