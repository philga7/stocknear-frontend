<script lang="ts">
  import { displayCompanyName, stockTicker } from "$lib/store";
  import { abbreviateNumber, removeCompanyStrings } from "$lib/utils";
  import SEO from "$lib/components/SEO.svelte";

  import { goto } from "$app/navigation";
  import highcharts from "$lib/highcharts.ts";

  import Infobox from "$lib/components/Infobox.svelte";

  export let data;

  let config = null;

  let rawData = data?.getHistoricalRevenue || {};
  let tableList = [];

  const tabs = [
    {
      title: "Annual",
    },
    {
      title: "Quarterly",
    },
  ];
  let activeIdx = 0;
  let timeIdx = 0;

  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  const plotTabs = [
    {
      title: "Annual",
    },
    {
      title: "Quarterly",
    },
  ];

  function changeTablePeriod(index) {
    activeIdx = index;
    const rawData = data?.getHistoricalRevenue;
    if (activeIdx === 0) {
      // Clone the array before sorting
      tableList = [...rawData?.annual];
      tableList.sort((a, b) => new Date(b?.date) - new Date(a?.date));
    } else {
      tableList = [...rawData?.quarter];
      tableList.sort((a, b) => new Date(b?.date) - new Date(a?.date));
    }
  }

  async function changeTimePeriod(state) {
    timeIdx = state;

    config = plotData();
    try {
      config.yAxis.labels.formatter = function () {
        return abbreviateNumber(this?.value);
      };
    } catch (e) {
      console.log(e);
    }
  }

  function plotData() {
    let filteredData = [];
    const rawData = data?.getHistoricalRevenue;
    if (timeIdx === 0) {
      // Clone the array before sorting
      filteredData = [...rawData?.annual];
    } else {
      filteredData = [...rawData?.quarter];
    }
    // Sort ascending for plotting
    filteredData.sort((a, b) => new Date(a?.date) - new Date(b?.date));

    const dates = filteredData.map((item) => item?.date);
    const valueList = filteredData.map((item) => item?.revenue);

    const options = {
      credits: {
        enabled: false,
      },
      chart: {
        type: "column",
        backgroundColor: "#09090B",
        plotBackgroundColor: "#09090B",
        height: 360, // Set the maximum height for the chart
        animation: false,
      },
      title: {
        text:
          timeIdx === 0
            ? `<h3 class="mt-3 mb-1">${removeCompanyStrings($displayCompanyName)} Revenue - Annual</h3>`
            : `<h3 class="mt-3 mb-1">${removeCompanyStrings($displayCompanyName)} Revenue - Quarterly</h3>`,
        style: {
          color: "white",
          // Using inline CSS for margin-top and margin-bottom
        },
        useHTML: true, // Enable HTML to apply custom class styling
      },

      xAxis: {
        categories: dates,
        gridLineWidth: 0,
        labels: {
          style: { color: "white" },
          formatter: function () {
            return timeIdx === 0 ? this?.value?.substring(0, 4) : this?.value;
          },
        },
      },
      yAxis: {
        gridLineWidth: 0,
        labels: {
          style: { color: "white" },
        },
        title: { text: null },
        opposite: true,
      },
      tooltip: {
        useHTML: true,
        backgroundColor: "#fff",
        style: {
          color: "black",
          fontSize: "16px",
          padding: "10px",
        },
        borderRadius: 2,
        borderWidth: 1,
        borderColor: "#ffffff",
        formatter: function () {
          return `<span class="m-auto text-black text-[1rem] font-semibold">${new Date(
            this?.x,
          ).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}</span> <br> <span class="text-black font-normal">${abbreviateNumber(this.y)}</span>`;
        },
      },

      plotOptions: {
        series: {
          color: "white",
          animation: false,
          dataLabels: {
            enabled: timeIdx === 0 ? true : false,
            color: "white",
            style: {
              fontSize: "13px",
              fontWeight: "bold",
            },
            formatter: function () {
              return abbreviateNumber(this?.y);
            },
          },
        },
      },
      legend: {
        enabled: false,
      },
      series: [
        {
          name: "Revenue",
          data: valueList,
          color: "white",
        },
      ],
    };

    return options;
  }

  changeTablePeriod(0);
  changeTimePeriod(0);
</script>

<SEO
  title={`${$displayCompanyName} (${$stockTicker}) Revenue, Sales & Growth Trends`}
  description={`Explore the historical revenue, sales performance, and growth trends of ${$displayCompanyName} (${$stockTicker}). Get in-depth financial insights.`}
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
              {removeCompanyStrings($displayCompanyName)} Revenue
            </h1>
          </div>

          {#if rawData?.length !== 0}
            <div class="grid grid-cols-1 gap-2 mt-3 mb-3 sm:mt-0 sm:mb-0">
              <Infobox
                text={`${removeCompanyStrings($displayCompanyName)} reported an annual revenue of ${abbreviateNumber(rawData?.annual?.at(0)?.revenue, true)}, reflecting a ${rawData?.growthRevenue}% growth. For the quarter ending ${formatDate(rawData?.quarter?.at(0)?.date)}, ${removeCompanyStrings($displayCompanyName)} generated ${abbreviateNumber(rawData?.quarter?.at(0)?.revenue, true)} in revenue.`}
              />

              <div
                class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 mt-3"
              >
                <div
                  class="bg-gray-800/30 rounded-lg p-4 sm:hover:bg-gray-800/40 transition-colors"
                >
                  <div
                    class="text-[#c3c6d0] text-sm sm:text-[1rem] mb-2 flex items-center"
                  >
                    <span>Revenue (ttm)</span>
                  </div>
                  <div class="flex items-baseline">
                    <span class="text-xl font-bold text-white">
                      {abbreviateNumber(rawData?.revenue, true)}</span
                    >
                  </div>
                </div>

                <div
                  class="bg-gray-800/30 rounded-lg p-4 sm:hover:bg-gray-800/40 transition-colors"
                >
                  <div
                    class="text-[#c3c6d0] text-sm sm:text-[1rem] mb-2 flex items-center"
                  >
                    <span>Revenue Growth</span>
                  </div>
                  <div class="flex items-baseline">
                    <span class="text-xl font-bold text-white"
                      >{rawData?.growthRevenue}%</span
                    >
                  </div>
                </div>

                <div
                  class="bg-gray-800/30 rounded p-4 sm:hover:bg-gray-800/40 transition-colors"
                >
                  <div
                    class="text-[#c3c6d0] text-sm sm:text-[1rem] mb-2 flex items-center"
                  >
                    <span>Price / Sales Ratio</span>
                  </div>
                  <div class="flex items-baseline">
                    <span class="text-xl font-bold text-white"
                      >{rawData?.priceToSalesRatio}</span
                    >
                  </div>
                </div>

                <div
                  class="bg-gray-800/30 rounded p-4 sm:hover:bg-gray-800/40 transition-colors"
                >
                  <div
                    class="text-[#c3c6d0] text-sm sm:text-[1rem] mb-2 flex items-center"
                  >
                    <span>Revenue / Employee </span>
                  </div>
                  <div class="flex items-baseline">
                    <span class="text-xl font-bold text-white"
                      >{abbreviateNumber(
                        rawData?.revenuePerEmployee,
                        true,
                      )}</span
                    >
                  </div>
                </div>

                <div
                  class="bg-gray-800/30 rounded p-4 sm:hover:bg-gray-800/40 transition-colors"
                >
                  <div
                    class="text-[#c3c6d0] text-sm sm:text-[1rem] mb-2 flex items-center"
                  >
                    <span>Employees </span>
                  </div>
                  <div class="flex items-baseline">
                    <span class="text-xl font-bold text-white"
                      >{rawData?.employees?.toLocaleString("en-US")}</span
                    >
                  </div>
                </div>
                <div
                  class="bg-gray-800/30 rounded p-4 sm:hover:bg-gray-800/40 transition-colors"
                >
                  <div
                    class="text-[#c3c6d0] text-sm sm:text-[1rem] mb-2 flex items-center"
                  >
                    <span>Market Cap </span>
                  </div>
                  <div class="flex items-baseline">
                    <span class="text-xl font-bold text-white"
                      >{abbreviateNumber(data?.getStockQuote?.marketCap)}</span
                    >
                  </div>
                </div>
              </div>

              <div
                class=" flex flex-col sm:flex-row items-start sm:items-center w-full justify-between"
              >
                <h2 class="text-xl sm:text-2xl text-white font-bold">
                  Revenue Chart
                </h2>

                <div
                  class="inline-flex justify-center w-full rounded-md sm:w-auto sm:ml-auto"
                >
                  <div
                    class="bg-secondary w-full min-w-24 sm:w-fit relative flex flex-wrap items-center justify-center rounded-md p-1 mt-4"
                  >
                    {#each plotTabs as item, i}
                      <button
                        on:click={() => changeTimePeriod(i)}
                        class="group relative z-[1] rounded-full w-1/2 min-w-24 md:w-auto px-5 py-1 {timeIdx ===
                        i
                          ? 'z-0'
                          : ''} "
                      >
                        {#if timeIdx === i}
                          <div
                            class="absolute inset-0 rounded-md bg-[#fff]"
                          ></div>
                        {/if}
                        <span
                          class="relative text-sm block font-semibold {timeIdx ===
                          i
                            ? 'text-black'
                            : 'text-white'}"
                        >
                          {item.title}
                        </span>
                      </button>
                    {/each}
                  </div>
                </div>
              </div>

              <div
                class="chart mt-5 sm:mt-0 border border-gray-800 rounded"
                use:highcharts={config}
              ></div>

              <div
                class="mt-5 flex flex-col sm:flex-row items-start sm:items-center w-full justify-between sm:border-y border-gray-800 sm:pt-2 sm:pb-2"
              >
                <h3
                  class="text-xl sm:text-2xl text-white font-bold mb-2 sm:mb-0"
                >
                  Revenue History
                </h3>

                <div
                  class="inline-flex justify-center w-full rounded-md sm:w-auto sm:ml-auto"
                >
                  <div
                    class="bg-secondary w-full min-w-24 sm:w-fit relative flex flex-wrap items-center justify-center rounded-md p-1"
                  >
                    {#each tabs as item, i}
                      {#if data?.user?.tier !== "Pro" && i > 0}
                        <button
                          on:click={() => goto("/pricing")}
                          class="group relative z-[1] rounded-full w-1/2 min-w-24 md:w-auto px-5 py-1"
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
                          class="group relative z-[1] rounded-full w-1/2 min-w-24 md:w-auto px-5 py-1 {activeIdx ===
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
                            class="relative text-sm block font-semibold {activeIdx ===
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

              <div class="w-full overflow-x-scroll">
                <table
                  class="table table-sm table-compact bg-table border border-gray-800 rounded-none sm:rounded-md w-full m-auto mt-4"
                >
                  <thead class="bg-default">
                    <tr>
                      <th class="text-white font-semibold text-start text-sm"
                        >{activeIdx === 0
                          ? "Fiscal Year End"
                          : "Quarter Ended"}</th
                      >
                      <th class="text-white font-semibold text-end text-sm"
                        >Revenue</th
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
                          {abbreviateNumber(item?.revenue)}
                        </td>

                        <td
                          class="text-white text-sm sm:text-[1rem] whitespace-nowrap font-medium text-end"
                        >
                          {#if index === tableList?.length - 1}
                            n/a
                          {:else if item?.revenue > tableList[index + 1]?.revenue}
                            <span class="text-[#00FC50]">
                              +{(
                                ((item?.revenue -
                                  tableList[index + 1]?.revenue) /
                                  tableList[index + 1]?.revenue) *
                                100
                              )?.toFixed(2)}%
                            </span>
                          {:else if item?.revenue < tableList[index + 1]?.revenue}
                            <span class="text-[#FF2F1F]">
                              -{(
                                Math.abs(
                                  (item?.revenue -
                                    tableList[index + 1]?.revenue) /
                                    tableList[index + 1]?.revenue,
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
