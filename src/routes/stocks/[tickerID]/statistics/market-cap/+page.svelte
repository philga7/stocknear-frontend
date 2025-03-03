<script lang="ts">
  import { displayCompanyName, stockTicker } from "$lib/store";
  import { abbreviateNumber, removeCompanyStrings } from "$lib/utils";
  import SEO from "$lib/components/SEO.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
  import { Button } from "$lib/components/shadcn/button/index.js";
  //import * as XLSX from 'xlsx';
  import { goto } from "$app/navigation";
  import highcharts from "$lib/highcharts.ts";

  export let data;

  let rawData = data?.getHistoricalMarketCap || [];
  let tableList = [];
  let changePercentageYearAgo = 0;
  let timePeriod = "3Y";

  const tabs = [
    {
      title: "Annual",
    },
    {
      title: "Quarterly",
    },
  ];
  let activeIdx = 0;

  function getMarketCapCategory(marketCap) {
    const BILLION = 1_000_000_000;
    const MILLION = 1_000_000;

    const marketCapNavigation = [
      {
        threshold: 200 * BILLION,
        name: "Mega-Cap",
        link: "/list/market-cap/mega-cap-stocks",
      },
      {
        minThreshold: 10 * BILLION,
        maxThreshold: 200 * BILLION,
        name: "Large-Cap",
        link: "/list/market-cap/large-cap-stocks",
      },
      {
        minThreshold: 2 * BILLION,
        maxThreshold: 10 * BILLION,
        name: "Mid-Cap",
        link: "/list/market-cap/mid-cap-stocks",
      },
      {
        minThreshold: 300 * MILLION,
        maxThreshold: 2 * BILLION,
        name: "Small-Cap",
        link: "/list/market-cap/small-cap-stocks",
      },
      {
        minThreshold: 50 * MILLION,
        maxThreshold: 300 * MILLION,
        name: "Micro-Cap",
        link: "/list/market-cap/micro-cap-stocks",
      },
      {
        maxThreshold: 50 * MILLION,
        name: "Nano-Cap",
        link: "/list/market-cap/nano-cap-stocks",
      },
    ];

    if (!marketCap) return null;

    // Convert string to number if needed
    const capValue =
      typeof marketCap === "string" ? parseFloat(marketCap) : marketCap;

    return marketCapNavigation.find((category) => {
      if (category.threshold) {
        return capValue >= category.threshold;
      }
      if (category.minThreshold && category.maxThreshold) {
        return (
          capValue >= category.minThreshold && capValue < category.maxThreshold
        );
      }
      if (category.maxThreshold) {
        return capValue < category.maxThreshold;
      }
      return false;
    });
  }

  function computeYearOverYearChange(rawData) {
    if (rawData.length < 2) {
      return null; // Not enough rawData to compute change
    }

    // Step 1: Get the last entry in the list
    const lastEntry = rawData[rawData.length - 1];
    const lastDate = new Date(lastEntry.date);
    const lastMarketCap = data?.getStockQuote?.marketCap;

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

    const previousMarketCap = closestEntry.marketCap;

    // Step 3: Calculate the percentage change
    const change =
      ((lastMarketCap - previousMarketCap) / previousMarketCap) * 100;

    return change;
  }

  function filterEndOfYearDates(data) {
    // Step 1: Group data by year
    const groupedByYear = data.reduce((acc, item) => {
      const year = new Date(item.date).getFullYear();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(item);
      return acc;
    }, {});

    // Step 2: For each year, find the entry with the latest date
    const annualData = Object.values(groupedByYear).map((yearData) => {
      return yearData.reduce((latest, current) => {
        return new Date(latest.date) > new Date(current.date)
          ? latest
          : current;
      });
    });

    return annualData;
  }

  function filterEndOfQuarterDates(data) {
    // Step 1: Group data by year and quarter
    const groupedByQuarter = data?.reduce((acc, item) => {
      const date = new Date(item?.date);
      const year = date.getFullYear();
      const quarter = Math?.floor(date?.getMonth() / 3) + 1; // Get the quarter (1-4)

      const key = `${year}-Q${quarter}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});

    // Step 2: For each year-quarter group, find the entry with the latest date
    const quarterlyData = Object?.values(groupedByQuarter)?.map(
      (quarterData) => {
        return quarterData?.reduce((latest, current) => {
          return new Date(latest?.date) > new Date(current?.date)
            ? latest
            : current;
        });
      },
    );

    return quarterlyData;
  }

  function changeTablePeriod(index) {
    activeIdx = index;
    if (activeIdx === 0) {
      tableList = filterEndOfYearDates(rawData);
    } else {
      tableList = filterEndOfQuarterDates(rawData);
    }
    tableList?.sort((a, b) => new Date(b?.date) - new Date(a?.date));
  }

  let config = plotData();
  tableList = filterEndOfYearDates(rawData);
  tableList?.sort((a, b) => new Date(b?.date) - new Date(a?.date));
  changePercentageYearAgo = computeYearOverYearChange(rawData);

  async function changeStatement(state) {
    timePeriod = state;

    config = await plotData();
  }

  function filterDataByTimePeriod(rawData, timePeriod) {
    let dates = [];
    let marketCapList = [];
    const now = new Date();

    // Calculate the date threshold based on the selected time period
    let thresholdDate;
    switch (timePeriod) {
      case "1M":
        thresholdDate = new Date(now);
        thresholdDate.setMonth(now.getMonth() - 1);
        break;
      case "6M":
        thresholdDate = new Date(now);
        thresholdDate.setMonth(now.getMonth() - 6);
        break;
      case "1Y":
        thresholdDate = new Date(now);
        thresholdDate.setFullYear(now.getFullYear() - 1);
        break;
      case "3Y":
        thresholdDate = new Date(now);
        thresholdDate.setFullYear(now.getFullYear() - 3);
        break;
      case "5Y":
        thresholdDate = new Date(now);
        thresholdDate.setFullYear(now.getFullYear() - 5);
        break;
      case "10Y":
        thresholdDate = new Date(now);
        thresholdDate.setFullYear(now.getFullYear() - 10);
        break;
      case "Max":
      default:
        thresholdDate = new Date(0); // Set to the earliest possible date
        break;
    }

    // Filter the data based on the threshold date
    rawData?.forEach((item) => {
      const itemDate = new Date(item?.date);
      if (itemDate >= thresholdDate) {
        dates?.push(item?.date);
        marketCapList?.push(item?.marketCap);
      }
    });

    return { dates, marketCapList };
  }

  function plotData() {
    const filteredData = filterDataByTimePeriod(rawData, timePeriod);

    const options = {
      credits: {
        enabled: false,
      },
      chart: {
        backgroundColor: "#09090B",
        plotBackgroundColor: "#09090B",
        height: 360, // Set the maximum height for the chart
      },
      title: {
        text: `<h3 class="mt-3 mb-1 ">${$stockTicker} Market Cap</h3>`,
        style: {
          color: "white",
          // Using inline CSS for margin-top and margin-bottom
        },
        useHTML: true, // Enable HTML to apply custom class styling
      },
      xAxis: {
        type: "datetime",
        endOnTick: false,
        categories: filteredData?.dates,
        crosshair: {
          color: "#fff", // Set the color of the crosshair line
          width: 1, // Adjust the line width as needed
          dashStyle: "Solid",
        },
        labels: {
          style: {
            color: "#fff",
          },
          distance: 20, // Increases space between label and axis
          formatter: function () {
            const date = new Date(this.value);
            return date.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            });
          },
        },
        tickPositioner: function () {
          // Create custom tick positions with wider spacing
          const positions = [];
          const info = this.getExtremes();
          const tickCount = 5; // Reduce number of ticks displayed
          const interval = Math.floor((info.max - info.min) / tickCount);

          for (let i = 0; i <= tickCount; i++) {
            positions.push(info.min + i * interval);
          }
          return positions;
        },
      },
      yAxis: {
        gridLineWidth: 1,
        gridLineColor: "#111827",
        labels: {
          style: { color: "white" },
        },
        title: { text: null },
        opposite: true,
      },
      tooltip: {
        shared: true,
        useHTML: true,
        backgroundColor: "rgba(0, 0, 0, 0.8)", // Semi-transparent black
        borderColor: "rgba(255, 255, 255, 0.2)", // Slightly visible white border
        borderWidth: 1,
        style: {
          color: "#fff",
          fontSize: "16px",
          padding: "10px",
        },
        borderRadius: 4,
        formatter: function () {
          // Format the x value to display time in hh:mm format
          let tooltipContent = `<span class="text-white m-auto text-black text-[1rem] font-[501]">${new Date(
            this?.x,
          ).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}</span><br>`;

          // Loop through each point in the shared tooltip
          this.points.forEach((point) => {
            tooltipContent += `<span class="text-white font-semibold text-sm">${point.series.name}:</span> 
          <span class="text-white font-normal text-sm" style="color:${point.color}">${abbreviateNumber(
            point.y,
          )}</span><br>`;
          });

          return tooltipContent;
        },
      },
      plotOptions: {
        series: {
          color: "white",
          animation: false, // Disable series animation
          states: {
            hover: {
              enabled: false, // Disable hover effect globally
            },
          },
        },
      },
      legend: {
        enabled: false,
      },
      series: [
        {
          name: "Mkt Cap",
          type: "area",
          data: filteredData?.marketCapList,
          color: "#fff",
          lineWidth: 1,
          marker: {
            enabled: false,
          },
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
              [0, "rgba(255, 255, 255, 0.1)"],
              [1, "rgba(255, 255, 255, 0.001)"],
            ],
          },
        },
      ],
    };

    return options;
  }

  const exportData = (format = "csv") => {
    if (data?.user?.tier === "Pro") {
      // Add headers row
      const csvRows = [];
      csvRows.push("date,market-cap");

      // Add data rows
      const filteredData = filterDataByTimePeriod(rawData, "Max");
      const { dates, marketCapList } = filteredData;

      dates.forEach((date, index) => {
        csvRows.push(`${date},${marketCapList[index]}`);
      });

      // Create CSV blob and trigger download
      const csv = csvRows.join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("hidden", "");
      a.setAttribute("href", url);
      a.setAttribute(
        "download",
        `${$stockTicker?.toLowerCase()}_market_cap.csv`,
      );
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      goto("/pricing");
    }
  };

  $: capCategory = getMarketCapCategory(data?.getStockQuote?.marketCap);
</script>

<SEO
  title={`${$displayCompanyName} (${$stockTicker}) Market Cap & Net Worth`}
  description={`Historical Market Cap of ${$displayCompanyName}.`}
/>

<section class="bg-default w-full overflow-hidden text-white h-full">
  <div class="w-full flex justify-center w-full sm-auto h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <main class="w-full">
        <div class="sm:pl-7 sm:pb-7 sm:pt-7 m-auto mt-2 sm:mt-0">
          <div class="">
            <h1 class="text-xl sm:text-2xl text-white font-bold">
              {removeCompanyStrings($displayCompanyName)} Market Cap
            </h1>
          </div>

          {#if rawData?.length !== 0}
            <div class="grid grid-cols-1 gap-2 mt-3 mb-3 sm:mt-0 sm:mb-0">
              <Infobox
                text={`${$displayCompanyName} has a market cap or net worth of ${abbreviateNumber(
                  data?.getStockQuote?.marketCap,
                )} as of ${new Date()?.toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  daySuffix: "2-digit",
                })}. Its market cap has ${
                  changePercentageYearAgo > 0
                    ? "increased"
                    : changePercentageYearAgo < 0
                      ? "decreased"
                      : "unchanged"
                } by ${abbreviateNumber(
                  changePercentageYearAgo?.toFixed(2),
                )}% in one year.`}
              />

              <div
                class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 mt-3"
              >
                <div
                  class="bg-gray-800/30 rounded-lg p-4 sm:hover:bg-gray-800/40 transition-colors"
                >
                  <div class="text-[#c3c6d0] text-sm mb-2 flex items-center">
                    <span>Market Cap</span>
                    <span class="ml-1 text-violet-400">●</span>
                  </div>
                  <div class="flex items-baseline">
                    <span class="text-xl font-bold text-white">
                      {abbreviateNumber(data?.getStockQuote?.marketCap)}</span
                    >
                  </div>
                </div>

                <div
                  class="bg-gray-800/30 rounded-lg p-4 sm:hover:bg-gray-800/40 transition-colors"
                >
                  <div class="text-[#c3c6d0] text-sm mb-2 flex items-center">
                    <span>Category</span>
                    <span class="ml-1 text-red-400">●</span>
                  </div>
                  <div class="flex items-baseline">
                    <span class="text-xl font-bold text-white"
                      >{#if capCategory}
                        <a
                          class="sm:hover:text-white text-blue-400"
                          href={capCategory.link}
                        >
                          {capCategory.name}
                        </a>
                      {:else}
                        n/a
                      {/if}</span
                    >
                  </div>
                </div>

                <div
                  class="bg-gray-800/30 rounded p-4 sm:hover:bg-gray-800/40 transition-colors"
                >
                  <div class="text-[#c3c6d0] text-sm mb-2 flex items-center">
                    <span>1-Year Change</span>
                    <span class="ml-1">●</span>
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
                        {changePercentageYearAgo >= 0 ? "Positive" : "Negative"}
                        Trend
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                class="flex flex-col sm:flex-row items-start sm:items-center w-full"
              >
                <h2
                  class="mb-3 sm:mb-0 text-xl sm:text-2xl text-white font-bold"
                >
                  Market Cap Chart
                </h2>

                <div
                  class="flex flex-row items-center w-fit sm:w-[50%] md:w-auto sm:ml-auto"
                >
                  <div class="relative inline-block text-left grow">
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild let:builder>
                        <Button
                          builders={[builder]}
                          class="w-full border-gray-600 border bg-default sm:hover:bg-primary ease-out  flex flex-row justify-between items-center px-3 py-2 text-white rounded-md truncate"
                        >
                          <span class="truncate text-white text-xs sm:text-sm"
                            >{timePeriod}</span
                          >
                          <svg
                            class="-mr-1 ml-1 h-5 w-5 xs:ml-2 inline-block"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            style="max-width:40px"
                            aria-hidden="true"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clip-rule="evenodd"
                            ></path>
                          </svg>
                        </Button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content
                        class="w-56 h-fit max-h-72 overflow-y-auto scroller"
                      >
                        <DropdownMenu.Label class="text-gray-400">
                          Select time frame
                        </DropdownMenu.Label>
                        <DropdownMenu.Separator />
                        <DropdownMenu.Group>
                          <DropdownMenu.Item
                            on:click={() => changeStatement("1M")}
                            class="cursor-pointer hover:bg-primary"
                          >
                            1 Month
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            on:click={() => changeStatement("6M")}
                            class="cursor-pointer hover:bg-primary"
                          >
                            6 Months
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            on:click={() => changeStatement("1Y")}
                            class="cursor-pointer hover:bg-primary"
                          >
                            1 Year
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            on:click={() => changeStatement("3Y")}
                            class="cursor-pointer hover:bg-primary"
                          >
                            3 Years
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            on:click={() => changeStatement("5Y")}
                            class="cursor-pointer hover:bg-primary"
                          >
                            5 Years
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            on:click={() => changeStatement("10Y")}
                            class="cursor-pointer hover:bg-primary"
                          >
                            10 Years
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            on:click={() => changeStatement("Max")}
                            class="cursor-pointer hover:bg-primary"
                          >
                            Max
                          </DropdownMenu.Item>
                        </DropdownMenu.Group>
                      </DropdownMenu.Content>
                    </DropdownMenu.Root>
                  </div>
                  <Button
                    on:click={() => exportData("csv")}
                    class="ml-2 w-full border-gray-600 border bg-default sm:hover:bg-primary ease-out flex flex-row justify-between items-center px-3 py-2 text-white rounded-md truncate"
                  >
                    <span class="truncate text-white text-xs sm:text-sm"
                      >Download</span
                    >
                    <svg
                      class="{data?.user?.tier === 'Pro'
                        ? 'hidden'
                        : ''} ml-1 -mt-0.5 w-3.5 h-3.5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      ><path
                        fill="#A3A3A3"
                        d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                      /></svg
                    >
                  </Button>
                </div>
              </div>

              <div
                class="chart border border-gray-800 rounded"
                use:highcharts={config}
              ></div>

              <div
                class=" flex flex-col sm:flex-row items-start sm:items-center w-full justify-between"
              >
                <h3 class="text-xl sm:text-2xl text-white font-bold">
                  Market Cap History
                </h3>

                <div
                  class="inline-flex justify-center w-full rounded-md sm:w-auto sm:ml-auto"
                >
                  <div
                    class="bg-secondary w-full min-w-24 sm:w-fit relative flex flex-wrap items-center justify-center rounded-md p-1 mt-4"
                  >
                    {#each tabs as item, i}
                      {#if data?.user?.tier !== "Pro" && i > 0}
                        <button
                          on:click={() => goto("/pricing")}
                          class="group relative z-1 rounded-full w-1/2 min-w-24 md:w-auto px-5 py-1"
                        >
                          <span class="relative text-sm block font-semibold">
                            {item.title}
                            <svg
                              class="inline-block ml-0.5 -mt-1 w-3.5 h-3.5"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              ><path
                                fill="#A3A3A3"
                                d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                              /></svg
                            >
                          </span>
                        </button>
                      {:else}
                        <button
                          on:click={() => changeTablePeriod(i)}
                          class="group relative z-1 rounded-full w-1/2 min-w-24 md:w-auto px-5 py-1 {activeIdx ===
                          i
                            ? 'z-0'
                            : ''} "
                        >
                          {#if activeIdx === i}
                            <div
                              class="absolute inset-0 rounded-md bg-[#fff]"
                            ></div>
                          {/if}
                          <span
                            class="relative text-sm block font-semibold whitespace-nowrap {activeIdx ===
                            i
                              ? 'text-black'
                              : 'text-white'}"
                          >
                            {item.title}
                          </span>
                        </button>
                      {/if}
                    {/each}
                  </div>
                </div>
              </div>

              <div class="w-full overflow-x-auto">
                <table
                  class="table table-sm table-compact bg-table border border-gray-800 rounded-none sm:rounded-md w-full m-auto mt-4"
                >
                  <thead class="bg-default">
                    <tr>
                      <th class="text-white font-semibold text-start text-sm"
                        >Date</th
                      >
                      <th class="text-white font-semibold text-end text-sm"
                        >Market Cap</th
                      >
                      <th class="text-white font-semibold text-end text-sm"
                        >% Change</th
                      >
                    </tr>
                  </thead>
                  <tbody>
                    {#each tableList as item, index}
                      <!-- row -->
                      <tr
                        class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-odd border-b border-gray-800"
                      >
                        <td
                          class="text-white font-medium text-sm sm:text-[1rem] whitespace-nowrap"
                        >
                          {item?.date}
                        </td>

                        <td
                          class="text-white text-sm sm:text-[1rem] text-right whitespace-nowrap"
                        >
                          {@html abbreviateNumber(item?.marketCap, false, true)}
                        </td>

                        <td
                          class="text-white text-sm sm:text-[1rem] whitespace-nowrap font-medium text-end"
                        >
                          {#if index === tableList?.length - 1}
                            n/a
                          {:else if item?.marketCap > tableList[index + 1]?.marketCap}
                            <span class="text-[#00FC50]">
                              +{(
                                ((item?.marketCap -
                                  tableList[index + 1]?.marketCap) /
                                  tableList[index + 1]?.marketCap) *
                                100
                              )?.toFixed(2)}%
                            </span>
                          {:else if item?.marketCap < tableList[index + 1]?.marketCap}
                            <span class="text-[#FF2F1F]">
                              -{(
                                Math.abs(
                                  (item?.marketCap -
                                    tableList[index + 1]?.marketCap) /
                                    tableList[index + 1]?.marketCap,
                                ) * 100
                              )?.toFixed(2)}%
                            </span>
                          {:else}
                            n/a
                          {/if}
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>
          {:else}
            <Infobox text="No data available" />
          {/if}
        </div>
      </main>
    </div>
  </div>
</section>
