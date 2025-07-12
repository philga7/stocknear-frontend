<script lang="ts">
  import { displayCompanyName, screenWidth, stockTicker } from "$lib/store";
  import { mode } from "mode-watcher";
  import { abbreviateNumber } from "$lib/utils";
  import { onMount } from "svelte";
  import highcharts from "$lib/highcharts.ts";

  import Infobox from "$lib/components/Infobox.svelte";
  import SEO from "$lib/components/SEO.svelte";

  export let data;

  let rawData = data?.getOptionsHistoricalData;
  let optionList = rawData?.slice(0, 100);

  let config;

  function formatDate(dateStr) {
    // Convert the input date string to a Date object in New York time
    let date = new Date(dateStr + "T00:00:00Z"); // Assume input is in UTC

    // Convert to New York Time Zone
    let options = {
      timeZone: "UTC",
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
    };

    let formatter = new Intl.DateTimeFormat("en-US", options);

    return formatter.format(date);
  }

  function plotData() {
    const options = {
      credits: {
        enabled: false,
      },
      chart: {
        type: "gauge",
        backgroundColor: $mode === "light" ? "#fff" : "#09090B",
        plotBackgroundColor: $mode === "light" ? "#fff" : "#09090B",
        height: 280,
        animation: false, // Disable initial animation
      },

      title: {
        text: `<h3 class="mt-3 mb-1">IV (30d)</h3>`,
        style: {
          color: $mode === "light" ? "black" : "white",
          // Using inline CSS for margin-top and margin-bottom
        },
        useHTML: true, // Enable HTML to apply custom class styling
      },

      pane: {
        startAngle: -90,
        endAngle: 90,
        background: [
          {
            // Outer circle (black line)
            outerRadius: "101%",
            innerRadius: "100%",
            backgroundColor: "#000",
            borderWidth: 0,
            shape: "arc",
          },
          null, // keep existing null if needed
        ],
      },

      // the value axis
      yAxis: {
        min: 0,
        max: 100,
        tickPosition: "inside",
        tickLength: 10,
        tickWidth: 0,
        minorTickInterval: null,
        lineWidth: 0,
        // Remove numeric tick labels
        labels: {
          enabled: false,
        },
        plotBands: [
          {
            from: 0,
            to: 19.5,
            color: "#55BF3B",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 19.5,
            to: 20,
            color: "#fff",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 20,
            to: 39.5,
            color: "#55BF3B",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 39.5,
            to: 40,
            color: "#fff",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 40,
            to: 59.5,
            color: "#DDDF0D",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 59.5,
            to: 60,
            color: "#fff",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 60,
            to: 79.5,
            color: "#DF5353",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 79.5,
            to: 80,
            color: "#fff",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 80,
            to: 100,
            color: "#DF5353",
            thickness: 20,
            borderRadius: "0px",
          },
        ],
      },

      series: [
        {
          name: "IV",
          data: [55.8],
          animation: false,
          dataLabels: {
            useHTML: true, // ensure HTML works if you keep custom markup
            backgroundColor: "none", // removes background
            borderWidth: 0, // removes border
            shadow: false, // removes shadow
            format: '<span class="text-lg font-bold">{y}% IV</span>',
          },
          dial: {
            radius: "80%",
            backgroundColor: $mode === "light" ? "#000" : "#808080",
            baseWidth: 12,
            baseLength: "0%",
            rearLength: "0%",
          },
        },
      ],
    };

    return options;
  }

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;
    if (isBottom && optionList?.length !== rawData?.length) {
      const nextIndex = optionList?.length;
      const filteredNewResults = rawData?.slice(nextIndex, nextIndex + 25);
      optionList = [...optionList, ...filteredNewResults];
    }
  }

  onMount(async () => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  $: {
    if ($mode) {
      config = plotData();
    }
  }
</script>

<SEO
  title={`${$displayCompanyName} (${$stockTicker}) Options Overview`}
  description={`View comprehensive ${$displayCompanyName} (${$stockTicker}) options with our latest charts on volume, open interest, max pain, and implied volatility.`}
/>

<section class="w-full overflow-hidden min-h-screen">
  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <div class="sm:pl-7 sm:pb-7 sm:pt-7 w-full m-auto mt-2 sm:mt-0">
        <!--
        {#if Object?.keys(dailyStats)?.length === 0 && rawData?.length === 0}
          <Infobox text="No Options data available" />
        {/if}
        -->

        <div class="w-full mb-10">
          <h2 class="mb-4 text-xl sm:text-2xl font-bold w-fit">
            {$stockTicker} Option Overview
          </h2>
          <p>
            Overview for all option chains of <strong>{$stockTicker}</strong>.
            As of
            <strong>July 11, 2025</strong>, <strong>{$stockTicker}</strong>
            options have an IV of <strong>55.80%</strong> and an IV rank of
            <strong>17.27%</strong>. The volume is <strong>2,857,903</strong>
            contracts, which is <strong>113.63%</strong> of average daily volume
            of <strong>2,515,089</strong> contracts. The volume put-call ratio
            is <strong>0.84</strong>, indicating a
            <strong>neutral</strong> sentiment in the market.
          </p>
        </div>

        <!-- Apply the blur class to the chart -->
        <div class="w-fit max-w-56 border" use:highcharts={config}></div>

        {#if rawData?.length > 0}
          {#if optionList?.length !== 0}
            <h3 class="mb-4 text-xl sm:text-2xl font-bold w-fit">
              Option Chain Statistics
            </h3>

            <p>
              This table provides a comprehensive overview of all <strong
                >{$stockTicker}</strong
              >
              options grouped by their expiration dates.
            </p>

            <div class="flex justify-start items-center m-auto overflow-x-auto">
              <table
                class="table table-sm table-compact no-scrollbar rounded-none sm:rounded w-full border border-gray-300 dark:border-gray-800 m-auto mt-3"
              >
                <thead class="bg-default text-white">
                  <tr class="">
                    <td
                      class=" font-semibold text-sm text-start border-r border-gray-800"
                      >Date</td
                    >
                    <td
                      class=" font-semibold text-sm text-end border-r border-gray-800"
                      >% Change</td
                    >
                    <td
                      class=" font-semibold text-sm text-end border-r border-gray-800"
                      >P/C</td
                    >
                    <td
                      class=" font-semibold text-sm text-center border-r border-gray-800"
                      >Volume</td
                    >
                    <td
                      class=" font-semibold text-sm text-center border-r border-gray-800"
                      >C Volume</td
                    >
                    <td
                      class=" font-semibold text-sm text-center border-r border-gray-800"
                      >P Volume</td
                    >
                    <!--
                    <td class=" font-semibold text-sm text-end"
                      >Vol/30D</td
                    >
                      -->
                    <!--
                    <td class=" font-semibold text-sm text-end"
                      >🐻/🐂 Prem</td
                    >
                  -->
                    <td
                      class=" font-semibold text-sm text-end border-r border-gray-800"
                      >Total OI</td
                    >
                    <td
                      class=" font-semibold text-sm text-end border-r border-gray-800"
                      >OI Change</td
                    >
                    <td
                      class=" font-semibold text-sm text-end border-r border-gray-800"
                      >% OI Change</td
                    >
                    <td
                      class=" font-semibold text-sm text-end border-r border-gray-800"
                      >C Prem</td
                    >
                    <td
                      class=" font-semibold text-sm text-end border-r border-gray-800"
                      >P Prem</td
                    >
                  </tr>
                </thead>
                <tbody>
                  {#each optionList?.slice(0, 5) as item}
                    <tr
                      class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    >
                      <td class=" text-sm sm:text-[1rem] text-start">
                        {formatDate(item?.date)}
                      </td>

                      <td class=" text-sm sm:text-[1rem] text-end">
                        {#if item?.changesPercentage >= 0 && item?.changesPercentage !== null}
                          <span class="text-green-800 dark:text-[#00FC50]"
                            >+{item?.changesPercentage >= 1000
                              ? abbreviateNumber(item?.changesPercentage)
                              : item?.changesPercentage?.toFixed(2)}%</span
                          >
                        {:else if item?.changesPercentage < 0 && item?.changesPercentage !== null}
                          <span class="text-red-800 dark:text-[#FF2F1F]"
                            >{item?.changesPercentage <= -1000
                              ? abbreviateNumber(item?.changesPercentage)
                              : item?.changesPercentage?.toFixed(2)}%
                          </span>
                        {:else}
                          n/a
                        {/if}
                      </td>

                      <td class="text-sm sm:text-[1rem] text-end">
                        {item?.putCallRatio}
                      </td>

                      <td class="text-sm sm:text-[1rem] text-end">
                        {item?.volume?.toLocaleString("en-US")}
                      </td>

                      <td
                        class="whitespace-nowrap text-sm sm:text-[1rem] text-center"
                      >
                        {item?.call_volume?.toLocaleString("en-US")}
                      </td>

                      <td
                        class="whitespace-nowrap text-sm sm:text-[1rem] text-center"
                      >
                        {item?.put_volume?.toLocaleString("en-US")}
                      </td>
                      <!--
                      <td class="text-sm sm:text-[1rem]  text-end">
                        {item?.avgVolumeRatio?.toFixed(2)}
                      </td>
                      -->
                      <!--
                      <td class="text-sm sm:text-[1rem] text-end">
                        <HoverCard.Root>
                          <HoverCard.Trigger
                            class="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-black"
                          >
                            <div class="flex items-center justify-end">
                              <div
                                class="flex w-full max-w-28 h-5 bg-gray-200 rounded overflow-hidden"
                              >
                                <div
                                  class="bg-red-500 h-full"
                                  style="width: calc(({item
                                    ?.premium_ratio[0]} / ({item
                                    ?.premium_ratio[0]} + {item
                                    ?.premium_ratio[1]} + {item
                                    ?.premium_ratio[2]})) * 100%)"
                                ></div>

                                <div
                                  class="bg-gray-300 h-full"
                                  style="width: calc(({item
                                    ?.premium_ratio[1]} / ({item
                                    ?.premium_ratio[0]} + {item
                                    ?.premium_ratio[1]} + {item
                                    ?.premium_ratio[2]})) * 100%)"
                                ></div>

                                <div
                                  class="bg-green-500 h-full"
                                  style="width: calc(({item
                                    ?.premium_ratio[2]} / ({item
                                    ?.premium_ratio[0]} + {item
                                    ?.premium_ratio[1]} + {item
                                    ?.premium_ratio[2]})) * 100%)"
                                ></div>
                              </div>
                            </div>
                          </HoverCard.Trigger>
                          <HoverCard.Content
                            class="w-auto bg-secondary border border-gray-600"
                          >
                            <div class="flex justify-between space-x-4">
                              <div
                                class="space-y-1 flex flex-col items-start "
                              >
                                <div>
                                  Bearish: {@html abbreviateNumber(
                                    item?.premium_ratio[0],
                                    false,
                                    true,
                                  )}
                                </div>
                                <div>
                                  Neutral: {@html abbreviateNumber(
                                    item?.premium_ratio[1],
                                    false,
                                    true,
                                  )}
                                </div>
                                <div>
                                  Bullish: {@html abbreviateNumber(
                                    item?.premium_ratio[2],
                                    false,
                                    true,
                                  )}
                                </div>
                              </div>
                            </div>
                          </HoverCard.Content>
                        </HoverCard.Root>
                      </td>
                      -->

                      <td class="text-sm sm:text-[1rem] text-end">
                        {@html abbreviateNumber(
                          item?.total_open_interest,
                          false,
                          true,
                        )}
                      </td>

                      <td class=" text-sm sm:text-[1rem] text-end">
                        {#if item?.changeOI >= 0}
                          <span class="text-green-800 dark:text-[#00FC50]"
                            >+{item?.changeOI?.toLocaleString("en-US")}</span
                          >
                        {:else if item?.changeOI < 0}
                          <span class="text-red-800 dark:text-[#FF2F1F]"
                            >{item?.changeOI?.toLocaleString("en-US")}
                          </span>
                        {:else}
                          <span class=""> n/a </span>
                        {/if}
                      </td>

                      <td class=" text-sm sm:text-[1rem] text-end">
                        {#if item?.changesPercentageOI >= 0}
                          <span class="text-green-800 dark:text-[#00FC50]"
                            >+{item?.changesPercentageOI >= 1000
                              ? abbreviateNumber(item?.changesPercentageOI)
                              : item?.changesPercentageOI?.toFixed(2)}%</span
                          >
                        {:else if item?.changesPercentageOI < 0}
                          <span class="text-red-800 dark:text-[#FF2F1F]"
                            >{item?.changesPercentageOI <= -1000
                              ? abbreviateNumber(item?.changesPercentageOI)
                              : item?.changesPercentageOI?.toFixed(2)}%
                          </span>
                        {:else}
                          <span class=""> n/a </span>
                        {/if}
                      </td>

                      <td class="text-sm sm:text-[1rem] text-end">
                        {@html abbreviateNumber(
                          item?.call_premium,
                          false,
                          true,
                        )}
                      </td>

                      <td class="text-sm sm:text-[1rem] text-end">
                        {@html abbreviateNumber(item?.put_premium, false, true)}
                      </td>
                      <!--
                      <td class="text-sm sm:text-[1rem] text-end ">
                        {@html abbreviateNumber(
                          item?.net_premium,
                          false,
                          true,
                        )}
                      </td>

                      <td class="text-sm sm:text-[1rem] text-end ">
                        {@html abbreviateNumber(
                          item?.total_premium,
                          false,
                          true,
                        )}
                      </td>
                      -->
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}
        {/if}
      </div>
    </div>
  </div>
</section>

<!--Start Options Detail Desktop Modal-->
