<script lang="ts">
  import { displayCompanyName, screenWidth, stockTicker } from "$lib/store";
  import DailyStats from "$lib/components/Options/DailyStats.svelte";
  import TickerFlow from "$lib/components/Options/TickerFlow.svelte";

  import { abbreviateNumber, monthNames } from "$lib/utils";
  import { onMount } from "svelte";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";

  import Infobox from "$lib/components/Infobox.svelte";
  import SEO from "$lib/components/SEO.svelte";

  export let data;
  let dailyStats = {};
  let tickerFlow = [];

  let filteredList = [];

  let displayData;
  let options;

  let rawData = [];
  let optionList = [];

  let dateList; //= data?.getOptionsPlotData?.dateList;

  let callVolumeList; //= data?.getOptionsPlotData?.callVolumeList;
  let putVolumeList; //= data?.getOptionsPlotData?.putVolumeList;
  let callOpenInterestList; //= data?.getOptionsPlotData?.callOpenInterestList;
  let putOpenInterestList; //= data?.getOptionsPlotData?.putOpenInterestList;
  let priceList;

  let displayTimePeriod = "oneYear";

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

  function plotData(callData, putData, priceList) {
    const options = {
      animation: false,
      tooltip: {
        trigger: "axis",
        hideDelay: 100,
        borderColor: "#969696", // Black border color
        borderWidth: 1, // Border width of 1px
        backgroundColor: "#313131", // Optional: Set background color for contrast
        textStyle: {
          color: "#fff", // Optional: Text color for better visibility
        },
        formatter: function (params) {
          // Get the timestamp from the first parameter
          const timestamp = params[0].axisValue;

          // Initialize result with timestamp
          let result = timestamp + "<br/>";

          // Sort params to ensure Vol appears last
          params.sort((a, b) => {
            if (a.seriesName === "Vol") return 1;
            if (b.seriesName === "Vol") return -1;
            return 0;
          });

          // Add each series data
          params?.forEach((param) => {
            const marker =
              '<span style="display:inline-block;margin-right:4px;' +
              "border-radius:10px;width:10px;height:10px;background-color:" +
              param.color +
              '"></span>';
            result +=
              marker +
              param.seriesName +
              ": " +
              abbreviateNumber(param.value, false, true) +
              "<br/>";
          });

          return result;
        },
        axisPointer: {
          lineStyle: {
            color: "#fff",
          },
        },
      },
      silent: true,
      grid: {
        left: $screenWidth < 640 ? "5%" : "2%",
        right: $screenWidth < 640 ? "5%" : "2%",
        bottom: "10%",
        containLabel: true,
      },
      xAxis: [
        {
          type: "category",
          data: dateList,
          axisLabel: {
            color: "#fff",

            formatter: function (value) {
              // Assuming dates are in the format 'yyyy-mm-dd'
              const dateParts = value.split("-");
              const monthIndex = parseInt(dateParts[1]) - 1; // Months are zero-indexed in JavaScript Date objects
              const year = parseInt(dateParts[0]);
              const day = parseInt(dateParts[2]);
              return `${day} ${monthNames[monthIndex]} ${year}`;
            },
          },
        },
      ],
      yAxis: [
        {
          type: "value",
          splitLine: {
            show: false, // Disable x-axis grid lines
          },
          axisLabel: {
            show: false, // Hide y-axis labels
          },
        },
        {
          type: "value",
          splitLine: {
            show: false, // Disable x-axis grid lines
          },
          position: "right",
          axisLabel: {
            show: false, // Hide y-axis labels
          },
        },
      ],
      series: [
        {
          name: "Call",
          type: "bar",
          stack: "Put-Call Ratio",
          emphasis: {
            focus: "series",
          },
          data: callData,
          itemStyle: {
            color: "#00FC50",
          },
        },
        {
          name: "Put",
          type: "bar",
          stack: "Put-Call Ratio",
          emphasis: {
            focus: "series",
          },
          data: putData,
          itemStyle: {
            color: "#EE5365", //'#7A1C16'
          },
        },
        {
          name: "Price", // Name for the line chart
          type: "line", // Type of the chart (line)
          yAxisIndex: 1, // Use the second y-axis on the right
          data: priceList, // iv60Data (assumed to be passed as priceList)
          itemStyle: {
            color: "#fff", // Choose a color for the line (gold in this case)
          },
          lineStyle: {
            width: 2, // Set the width of the line
          },
          smooth: true, // Optional: make the line smooth
          showSymbol: false,
        },
      ],
    };
    return options;
  }

  function filterDate(filteredList, displayTimePeriod) {
    const now = Date.now();
    let cutoffDate;

    switch (displayTimePeriod) {
      case "oneWeek":
        cutoffDate = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case "oneMonth":
        cutoffDate = now - 30 * 24 * 60 * 60 * 1000;
        break;
      case "threeMonths":
        cutoffDate = now - 90 * 24 * 60 * 60 * 1000;
        break;
      case "sixMonths":
        cutoffDate = now - 180 * 24 * 60 * 60 * 1000;
        break;
      case "oneYear":
        cutoffDate = now - 365 * 24 * 60 * 60 * 1000;
        break;
      default:
        throw new Error("Invalid time period");
    }

    return filteredList?.filter((item) => {
      // Convert YYYY-MM-DD to a timestamp
      const [year, month, day] = item?.date?.split("-")?.map(Number);
      const itemTimestamp = new Date(year, month - 1, day)?.getTime();

      return itemTimestamp >= cutoffDate;
    });
  }

  function processPlotData(filteredList: any[]) {
    filteredList = Array.isArray(filteredList)
      ? filteredList.sort((a, b) => new Date(a?.date) - new Date(b?.date))
      : [];

    dateList = filteredList?.map((item) => item.date);
    callVolumeList = filteredList?.map((item) => item?.call_volume);
    putVolumeList = filteredList?.map((item) => item?.put_volume);
    priceList = filteredList?.map((item) => item?.price);

    callOpenInterestList = filteredList?.map(
      (item) => item?.call_open_interest,
    );
    putOpenInterestList = filteredList?.map((item) => item?.put_open_interest);

    // Determine the type of plot data to generate based on displayData
    if (displayData === "volume") {
      options = plotData(callVolumeList, putVolumeList, priceList);
    } else if (displayData === "openInterest") {
      options = plotData(callOpenInterestList, putOpenInterestList, priceList);
    }
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
    if (data?.user?.tier === "Pro") {
      window.addEventListener("scroll", handleScroll);
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }
  });

  $: {
    if (displayTimePeriod || displayData || $stockTicker) {
      displayData = "volume";
      dailyStats = data?.getDailyStats;
      tickerFlow = data?.getTickerFlow;
      rawData = data?.getOptionsHistoricalData;
      optionList = rawData?.slice(0, 30);

      filteredList = filterDate(rawData, displayTimePeriod);
      // Process the filtered list to generate the plot data
      processPlotData(filteredList);
    }
  }
</script>

<SEO
  title={`${$displayCompanyName} (${$stockTicker}) Options Activity`}
  description={`Explore unusual options activity for ${$displayCompanyName} (${$stockTicker}), providing insights into market sentiment and potential stock movement.`}
/>

<section class="w-full overflow-hidden min-h-screen">
  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <div class="sm:pl-7 sm:pb-7 sm:pt-7 w-full m-auto mt-2 sm:mt-0">
        {#if Object?.keys(dailyStats)?.length === 0 && rawData?.length === 0}
          <Infobox text="No Options data available" />
        {/if}

        {#if Object?.keys(dailyStats)?.length > 0}
          <div class="w-full mb-10">
            <DailyStats rawData={dailyStats} />
          </div>
        {/if}

        {#if tickerFlow?.length > 0 && data?.getStockQuote?.marketCap > 500 * 10 ** 9}
          <div class="w-full">
            <TickerFlow {tickerFlow} />
          </div>
        {/if}

        {#if rawData?.length > 0}
          <!--
          <div class="flex flex-row items-center w-full mt-10">
  
            <select
              class=" w-40 select select-bordered select-sm p-0 pl-5 bg-secondary"
              on:change={changeVolumeOI}
            >
              <option disabled>Choose a category</option>
              <option value="volume" selected>Volume</option>
              <option value="openInterest">Open Interest</option>
            </select>
          </div>

          <div class="app w-full ">
            {#if filteredList?.length !== 0}
              <Chart {init} {options} class="chart" />
            {:else}
              <span
                class="text-xl  m-auto flex justify-center items-center h-full"
              >
                <div
                  class=" text-sm sm:text-[1rem] sm:rounded h-auto border border-gray-600 p-4"
                >
                  <svg
                    class="w-5 h-5 inline-block sm:mr-2 shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 256 256"
                    ><path
                      fill="#fff"
                      d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-4 48a12 12 0 1 1-12 12a12 12 0 0 1 12-12m12 112a16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16a16 16 0 0 1 16 16v40a8 8 0 0 1 0 16"
                    /></svg
                  >
                  No Options activity found
                </div>
              </span>
            {/if}
          </div>
          -->

          {#if optionList?.length !== 0}
            <h3 class="text-xl sm:text-2xl font-bold text-start">
              Historical {$stockTicker} Data
            </h3>

            <div class="flex justify-start items-center m-auto overflow-x-auto">
              <table
                class="table table-sm table-compact no-scrollbar rounded-none sm:rounded w-full border border-gray-300 dark:border-gray-800 m-auto mt-3"
              >
                <thead class="text-muted dark:text-white dark:bg-default">
                  <tr class="">
                    <td class=" font-semibold text-sm text-start">Date</td>
                    <td class=" font-semibold text-sm text-end">% Change</td>
                    <td class=" font-semibold text-sm text-end">P/C</td>
                    <td class=" font-semibold text-sm text-center">Volume</td>
                    <td class=" font-semibold text-sm text-center">C Volume</td>
                    <td class=" font-semibold text-sm text-center">P Volume</td>
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
                    <td class=" font-semibold text-sm text-end">Total OI</td>
                    <td class=" font-semibold text-sm text-end">OI Change</td>
                    <td class=" font-semibold text-sm text-end">% OI Change</td>
                    <td class=" font-semibold text-sm text-end">C Prem</td>
                    <td class=" font-semibold text-sm text-end">P Prem</td>
                    <!--
                    <td class=" font-semibold text-sm text-end"
                      >Net Prem</td
                    >
                    <td class=" font-semibold text-sm text-end"
                      >Total Prem</td
                    >
                      -->
                  </tr>
                </thead>
                <tbody>
                  {#each data?.user?.tier === "Pro" ? optionList : optionList?.slice(0, 3) as item, index}
                    <tr
                      class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd {index +
                        1 ===
                        optionList?.slice(0, 3)?.length &&
                      !['Pro']?.includes(data?.user?.tier)
                        ? 'opacity-[0.1]'
                        : ''}"
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

            <UpgradeToPro {data} display={true} />
          {/if}
        {/if}
      </div>
    </div>
  </div>
</section>

<!--Start Options Detail Desktop Modal-->
