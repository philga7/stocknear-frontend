<script lang="ts">
  import { displayCompanyName, stockTicker } from "$lib/store";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  import SEO from "$lib/components/SEO.svelte";

  export let data;

  let rawData = data?.getData || [];

  function checkTime(timeString) {
    if (!timeString) {
      return "n/a"; // Return "n/a" if timeString is undefined or null
    }

    const [hours, minutes, seconds] = timeString.split(":").map(Number);

    // Convert the time to total seconds for easy comparison
    const totalSeconds = hours * 3600 + minutes * 60 + (seconds || 0);

    // Define the reference times in seconds
    const amcStart = 16 * 3600; // 16:00:00
    const bmcEnd = 9 * 3600 + 30 * 60; // 9:30:00

    if (totalSeconds >= amcStart) {
      return "AMC";
    } else if (totalSeconds < bmcEnd) {
      return "BMC";
    } else {
      return "n/a"; // Optional: if the time is in between
    }
  }
</script>

<SEO
  title={`Price Reaction ${$displayCompanyName} (${$stockTicker})`}
  description={`Historical price reaction of ${$displayCompanyName} based on the earnings releases.`}
/>

<section
  class="bg-default w-full overflow-hidden min-h-screen text-white h-full"
>
  <div class="w-full flex justify-center w-full sm-auto h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <main class="w-full">
        <div class="sm:pl-7 sm:pt-7 sm:pb-7 m-auto mt-2 sm:mt-0">
          <div class="mb-3">
            <h1 class="text-xl sm:text-2xl text-white font-bold">
              Price Reaction to Earnings Reports
            </h1>
          </div>

          {#if rawData?.length !== 0 && rawData?.at(0)?.high !== undefined}
            <div class="mb-10 w-full">
              <Infobox
                text="This table provides an overview of how a stock's price historically reacted around earnings reports. It displays key metrics like price changes over specific timeframes and Relative Strength Index (RSI)."
              />
            </div>
            <div class="w-full overflow-x-auto">
              <table
                class="table-fixed leading-3 border-separate border-spacing-0 font-sans tabular-nums text-white w-full"
              >
                <thead
                  ><tr class="bg-inherit text-[#c3c6d0] text-sm sm:text-[1rem]"
                    ><th
                      class="w-44 whitespace-nowrap font-normal h-5 text-left px-1"
                      >Report Date</th
                    ><th
                      class="px-4 last:pr-11 w-20 last:w-24.5 whitespace-nowrap font-normal h-5 text-right p-0"
                      >-3 Days</th
                    ><th
                      class="px-4 last:pr-11 w-20 last:w-24.5 whitespace-nowrap font-normal h-5 text-right p-0"
                      >-2 Days</th
                    ><th
                      class="px-4 last:pr-11 w-20 last:w-24.5 whitespace-nowrap font-normal h-5 text-right p-0"
                      >-1 Day</th
                    ><th class="px-0 w-1 whitespace-nowrap font-normal h-5 p-0"
                    ></th><th
                      class="px-4 last:pr-11 w-20 last:w-24.5 text-violet-300 font-semibold whitespace-nowrap font-normal h-5 text-right p-0"
                      >Open</th
                    ><th
                      class="px-4 last:pr-11 w-20 last:w-24.5 text-violet-300 font-semibold whitespace-nowrap font-normal h-5 text-right p-0"
                      >High</th
                    ><th
                      class="px-4 last:pr-11 w-20 last:w-24.5 text-violet-300 font-semibold whitespace-nowrap font-normal h-5 text-right p-0"
                      >Low</th
                    ><th
                      class="px-4 last:pr-11 w-20 last:w-24.5 text-violet-300 font-semibold whitespace-nowrap font-normal h-5 text-right p-0"
                      >Close</th
                    ><th class="px-0 w-1 whitespace-nowrap font-normal h-5 p-0"
                    ></th><th
                      class="px-4 last:pr-11 w-20 last:w-24.5 whitespace-nowrap font-normal h-5 text-right p-0"
                      >+1 Day</th
                    ><th
                      class="px-4 last:pr-11 w-20 last:w-24.5 whitespace-nowrap font-normal h-5 text-right p-0"
                      >+2 Days</th
                    ><th
                      class="px-4 last:pr-11 w-20 last:w-24.5 whitespace-nowrap font-normal h-5 text-right p-0"
                      >+3 Days</th
                    ><th
                      class="px-4 last:pr-11 w-20 last:w-24.5 whitespace-nowrap font-normal h-5 text-right p-0"
                      >+1 Week</th
                    ><th
                      class="px-4 last:pr-11 w-20 last:w-24.5 whitespace-nowrap font-normal h-5 text-right p-0"
                      >-1 Week</th
                    ></tr
                  ></thead
                >
                {#each rawData as item, index}
                  <tbody class="">
                    <tr class="group"
                      ><td
                        class="whitespace-nowrap border-l border-t border-primary py-0.5 rounded-tl-md px-1"
                        ><div
                          class="flex flex-col items-start text-white font-medium w-full"
                        >
                          <div
                            class="pr-0.5 mt-2 flex flex-row items-center w-full text-sm"
                          >
                            <div class="">
                              {item?.date !== undefined
                                ? new Date(item?.date)?.toLocaleString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                      daySuffix: "2-digit",
                                    },
                                  )
                                : "n/a"}
                              ({item?.quarter})
                            </div>
                            <div class="ml-1 text-end">
                              {checkTime(item?.time)}
                            </div>
                          </div>

                          <div class="text-[#c3c6d0] text-xs -mt-2 invisible">
                            {item?.quarter}
                            {item?.year}
                          </div>
                        </div></td
                      ><td
                        class="border-primary px-3.5 py-0.5 border-t border-l px-4 last:pr-11 w-17 last:w-24.5 px-1 text-right"
                        ><span class="text-white text-sm sm:text-[1rem]"
                          >{item?.backward_2_days_close?.toFixed(2)}</span
                        ></td
                      ><td
                        class="border-primary px-3.5 py-0.5 border-t px-4 last:pr-11 w-17 last:w-24.5 px-1 text-right"
                        ><span class="text-white text-sm sm:text-[1rem]"
                          >{item?.backward_1_days_close?.toFixed(2)}</span
                        ></td
                      ><td
                        class="border-primary px-3.5 py-0.5 border-t border-r rounded-tr-md px-4 last:pr-11 w-17 last:w-24.5 border-r px-1 text-right"
                        ><span class="text-white text-sm sm:text-[1rem]"
                          >{item?.forward_0_days_close?.toFixed(2)}</span
                        ></td
                      ><td
                        class="border-primary px-3.5 py-0.5 px-4 last:pr-11 w-17 last:w-24.5 px-1"
                      ></td><td
                        class="border-primary px-3.5 py-0.5 border-t border-l {index ===
                        0
                          ? 'rounded-tl-md border-t-violet-500'
                          : ''} px-4 last:pr-11 w-17 last:w-24.5 border-l border-l-violet-500 px-1 text-right"
                        ><span class="text-white text-sm sm:text-[1rem]"
                          >{item?.open?.toFixed(2)}</span
                        ></td
                      ><td
                        class="border-primary px-3.5 py-0.5 border-t {index ===
                        0
                          ? 'border-t-violet-500'
                          : ''} px-4 last:pr-11 w-17 last:w-24.5 px-1 text-right"
                        ><span class="text-white text-sm sm:text-[1rem]"
                          >{item?.high?.toFixed(2)}</span
                        ></td
                      ><td
                        class="border-primary px-3.5 py-0.5 border-t {index ===
                        0
                          ? 'border-t-violet-500'
                          : ''} px-4 last:pr-11 w-17 last:w-24.5 px-1 text-right"
                        ><span class="text-white text-sm sm:text-[1rem]"
                          >{item?.low?.toFixed(2)}</span
                        ></td
                      ><td
                        class="border-primary px-3.5 py-0.5 border-t {index ===
                        0
                          ? 'rounded-tr-md border-t-violet-500'
                          : ''} border-r border-r-violet-500 px-4 last:pr-11 w-17 last:w-24.5 px-1 text-right"
                        ><span class="text-white text-sm sm:text-[1rem]"
                          >{item?.close?.toFixed(2)}</span
                        ></td
                      ><td
                        class="border-primary px-3.5 py-0.5 px-4 last:pr-11 w-17 last:w-24.5 px-1"
                      ></td><td
                        class="border-primary px-3.5 py-0.5 border-t border-l rounded-tl-md px-4 last:pr-11 w-17 last:w-24.5 border-l px-1 text-right"
                        ><span class="text-white text-sm sm:text-[1rem]"
                          >{item?.forward_2_days_close !== undefined
                            ? item?.forward_2_days_close?.toFixed(2)
                            : "n/a"}</span
                        ></td
                      ><td
                        class="border-primary px-3.5 py-0.5 border-t px-4 last:pr-11 w-17 last:w-24.5 px-1 text-right"
                        ><span class="text-white text-sm sm:text-[1rem]"
                          >{item?.forward_3_days_close !== undefined
                            ? item?.forward_3_days_close?.toFixed(2)
                            : "n/a"}</span
                        ></td
                      ><td
                        class="border-primary px-3.5 py-0.5 border-t px-4 last:pr-11 w-17 last:w-24.5 px-1 text-right"
                        ><span class="text-white text-sm sm:text-[1rem]"
                          >{item?.forward_4_days_close !== undefined
                            ? item?.forward_4_days_close?.toFixed(2)
                            : "n/a"}</span
                        ></td
                      ><td
                        class="border-primary px-3.5 py-0.5 border-t border-l px-4 last:pr-11 w-17 last:w-24.5 px-1 text-right"
                        ><span class="text-white text-sm sm:text-[1rem]"
                          >{item?.forward_6_days_close !== undefined
                            ? item?.forward_6_days_close?.toFixed(2)
                            : "n/a"}</span
                        ></td
                      ><td
                        class="border-primary px-3.5 py-0.5 border-t border-r px-4 last:pr-11 w-17 last:w-24.5 px-1 text-right"
                        ><span class="text-white text-sm sm:text-[1rem]"
                          >{item?.backward_4_days_close
                            ? item?.backward_4_days_close?.toFixed(2)
                            : "n/a"}</span
                        ></td
                      ></tr
                    >
                    <tr
                      class="group {index + 1 === rawData?.length &&
                      data?.user?.tier !== 'Pro'
                        ? 'opacity-[0.1]'
                        : ''}"
                      ><td
                        class="border-l border-primary pl-1 text-gray-200 text-sm px-1"
                        ><div class="flex w-full justify-between">
                          <div class="flex items-center">
                            <div class="mr-1 text-purple-400">IV:</div>
                            <div
                              class="leading-3 w-full whitespace-nowrap text-purple-400 font-medium text-white"
                            >
                              {item?.iv ?? "-"}
                            </div>
                          </div>

                          <div class="flex items-center">
                            <div class="mr-1 text-purple-400">RSI:</div>
                            <div
                              class="leading-3 w-full whitespace-nowrap text-purple-400 font-medium text-white"
                            >
                              {item?.rsi ?? "n/a"}
                            </div>
                          </div>

                          <div>{$stockTicker} %</div>
                        </div></td
                      ><td
                        class="px-4 last:pr-11 w-17 last:w-24.5 border-primary px-3.5 py-0.5 border-l px-1 text-right"
                        ><span
                          class="w-full text-sm sm:text-[1rem] items-baseline justify-end whitespace-nowrap {item?.backward_2_days_change_percent >=
                          0
                            ? "text-positive before:content-['+']"
                            : 'text-negative'}"
                          >{item?.backward_2_days_change_percent}%<span
                            class="w-0 text-center"
                          ></span></span
                        ></td
                      ><td
                        class="px-4 last:pr-11 w-17 last:w-24.5 border-primary px-3.5 py-0.5 border-l px-1 text-right"
                        ><span
                          class="w-full text-sm sm:text-[1rem] items-baseline justify-end whitespace-nowrap {item?.backward_1_days_change_percent >=
                          0
                            ? "text-positive before:content-['+']"
                            : 'text-negative'}"
                          >{item?.backward_1_days_change_percent?.toFixed(
                            2,
                          )}%<span class="w-0 text-center"></span></span
                        ></td
                      ><td
                        class="px-4 last:pr-11 w-17 last:w-24.5 border-primary px-3.5 py-0.5 border-l px-1 text-right"
                        ><span
                          class="w-full text-sm sm:text-[1rem] items-baseline justify-end whitespace-nowrap {item?.backward_1_days_change_percent >=
                          0
                            ? "text-positive before:content-['+']"
                            : 'text-negative'}"
                          >{item?.backward_1_days_change_percent?.toFixed(
                            2,
                          )}%<span class="w-0 text-center"></span></span
                        ></td
                      ><td
                        class="px-4 last:pr-11 w-17 last:w-24.5 border-primary px-3.5 py-0.5 px-1 text-right"
                      ></td><td
                        class="px-4 last:pr-11 w-17 last:w-24.5 border-primary px-3.5 py-0.5 border-l border-l-violet-500 px-1 text-right"
                        ><div
                          class="w-full whitespace-nowrap rounded-sm border-gray-800 badge text-white text-sm sm:text-[1rem] font-medium {item?.open_change_percent >=
                          0
                            ? "bg-positive bg-opacity-[0.5] before:content-['+'] "
                            : 'bg-negative bg-opacity-[0.6]'}"
                        >
                          {item?.open_change_percent?.toFixed(2)}%
                        </div></td
                      ><td
                        class="px-4 last:pr-11 w-17 last:w-24.5 border-primary px-3.5 py-0.5 px-1 text-right"
                        ><div
                          class="w-full whitespace-nowrap rounded-sm border-gray-800 badge text-white text-sm sm:text-[1rem] font-medium {item?.high_change_percent >=
                          0
                            ? "bg-positive bg-opacity-[0.5] before:content-['+'] "
                            : 'bg-negative bg-opacity-[0.6]'}"
                        >
                          {item?.high_change_percent?.toFixed(2)}%
                        </div></td
                      ><td
                        class="px-4 last:pr-11 w-17 last:w-24.5 border-primary px-3.5 py-0.5 px-1 text-right"
                        ><div
                          class="w-full whitespace-nowrap rounded-sm border-gray-800 badge text-white text-sm sm:text-[1rem] font-medium {item?.low_change_percent >=
                          0
                            ? "bg-positive bg-opacity-[0.5] before:content-['+'] "
                            : 'bg-negative bg-opacity-[0.6]'}"
                        >
                          {item?.low_change_percent?.toFixed(2)}%
                        </div></td
                      ><td
                        class="px-4 last:pr-11 w-17 last:w-24.5 border-primary px-3.5 py-0.5 border-r border-r-violet-500 px-1 text-right"
                        ><div
                          class="w-full whitespace-nowrap rounded-sm border-gray-800 badge text-white text-sm sm:text-[1rem] font-medium {item?.close_change_percent >=
                          0
                            ? "bg-positive bg-opacity-[0.5] before:content-['+'] "
                            : 'bg-negative bg-opacity-[0.6]'}"
                        >
                          {item?.close_change_percent?.toFixed(2)}%
                        </div></td
                      ><td
                        class="px-4 last:pr-11 w-17 last:w-24.5 border-primary px-3.5 py-0.5 px-1 text-right"
                      ></td><td
                        class="px-4 last:pr-11 w-17 last:w-24.5 border-primary px-3.5 py-0.5 border-l px-1 text-right"
                        ><span
                          class="w-full text-sm sm:text-[1rem] items-baseline justify-end whitespace-nowrap {item?.forward_2_days_change_percent >=
                          0
                            ? "text-positive before:content-['+']"
                            : item?.forward_2_days_change_percent < 0
                              ? 'text-negative'
                              : 'text-white'}"
                          >{item?.forward_2_days_change_percent !== undefined
                            ? item?.forward_2_days_change_percent + "%"
                            : "n/a"}<span class="w-0 text-center"></span></span
                        ></td
                      ><td
                        class="px-4 last:pr-11 w-17 last:w-24.5 border-primary px-3.5 py-0.5 px-1 text-right"
                        ><span
                          class="w-full text-sm sm:text-[1rem] items-baseline justify-end whitespace-nowrap {item?.forward_3_days_change_percent >=
                          0
                            ? "text-positive before:content-['+']"
                            : item?.forward_3_days_change_percent < 0
                              ? 'text-negative'
                              : 'text-white'}"
                          >{item?.forward_3_days_change_percent !== undefined
                            ? item?.forward_3_days_change_percent + "%"
                            : "n/a"}<span class="w-0 text-center"></span></span
                        ></td
                      ><td
                        class="px-4 last:pr-11 w-17 last:w-24.5 border-primary px-3.5 py-0.5 px-1 text-right"
                        ><span
                          class="w-full text-sm sm:text-[1rem] items-baseline justify-end whitespace-nowrap {item?.forward_4_days_change_percent >=
                          0
                            ? "text-positive before:content-['+']"
                            : item?.forward_4_days_change_percent < 0
                              ? 'text-negative'
                              : 'text-white'}"
                          >{item?.forward_4_days_change_percent !== undefined
                            ? item?.forward_4_days_change_percent + "%"
                            : "n/a"}<span class="w-0 text-center"></span></span
                        ></td
                      ><td
                        class="px-4 last:pr-11 w-17 last:w-24.5 border-primary px-3.5 py-0.5 border-l px-1 text-right"
                        ><span
                          class="w-full text-sm sm:text-[1rem] items-baseline justify-end whitespace-nowrap {item?.forward_6_days_change_percent >=
                          0
                            ? "text-positive before:content-['+']"
                            : item?.forward_6_days_change_percent < 0
                              ? 'text-negative'
                              : 'text-white'}"
                          >{item?.forward_6_days_change_percent !== undefined
                            ? item?.forward_6_days_change_percent + "%"
                            : "n/a"}<span class="w-0 text-center"></span></span
                        ></td
                      ><td
                        class="px-4 last:pr-11 w-17 last:w-24.5 border-primary px-3.5 py-0.5 border-r px-1 text-right"
                        ><span
                          class="w-full text-sm sm:text-[1rem] items-baseline justify-end whitespace-nowrap {item?.backward_4_days_change_percent >=
                          0
                            ? "text-positive before:content-['+']"
                            : 'text-negative'}"
                          >{item?.backward_4_days_change_percent?.toFixed(
                            2,
                          )}%<span class="w-0 text-center"></span></span
                        ></td
                      ></tr
                    >
                  </tbody>
                {/each}
                <tfoot
                  ><tr
                    ><td
                      colspan="15"
                      class="pt-3 text-[#c3c6d0] px-1 leading-tight text-sm"
                      >Daily change and RSI 14 are based on the report date for
                      BMO releases and the following day for AMC releases.</td
                    ></tr
                  ></tfoot
                >
              </table>
            </div>
            <UpgradeToPro {data} />
          {:else}
            <Infobox text="No data available" />
          {/if}
        </div>
      </main>
    </div>
  </div>
</section>
