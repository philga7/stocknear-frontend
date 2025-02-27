<script lang="ts">
  import { Chart } from "svelte-echarts";
  import { displayCompanyName, stockTicker } from "$lib/store";
  import { formatString } from "$lib/utils";
  import { abbreviateNumber } from "$lib/utils";
  import { onMount } from "svelte";
  import { init, use } from "echarts/core";
  import { PieChart } from "echarts/charts";
  import { GridComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import DownloadData from "$lib/components/DownloadData.svelte";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";
  import Infobox from "$lib/components/Infobox.svelte";

  use([PieChart, GridComponent, CanvasRenderer]);

  export let data;

  let rawData = data?.getShareholderData || {};

  let callPercentage;
  let putPercentage;
  let totalCalls;
  let totalPuts;
  let putCallRatio;

  let shareholderList = rawData?.shareholders;
  let displayList = shareholderList?.slice(0, 50);
  let optionsPieChart;
  let institutionalOwner = 0;
  let otherOwner = 0;
  let topHolders = 0;

  const plotPieChart = () => {
    if (rawData?.ownershipPercent !== undefined) {
      shareholderList = shareholderList?.filter(
        (item) => item?.ownership <= 100,
      );
      topHolders = 0;
      otherOwner = 0;
      institutionalOwner =
        rawData?.ownershipPercent > 100 ? 99.99 : rawData?.ownershipPercent;

      otherOwner = institutionalOwner === 0 ? 0 : 100 - institutionalOwner;
      topHolders = shareholderList
        ?.slice(0, 10)
        ?.reduce((total, shareholder) => total + shareholder?.ownership, 0);

      const options = {
        animation: false,
        grid: {
          left: "0%",
          right: "0%",
          top: "0%",
          bottom: "10%",
          containLabel: true,
        },
        series: [
          {
            name: "Shareholders",
            type: "pie",
            radius: ["40%", "50%"],
            padAngle: 5,
            itemStyle: {
              borderRadius: 3,
            },
            label: {
              show: false,
              position: "center",
            },
            silent: true, // Disable interactivity
            data: [
              {
                value: institutionalOwner,
                name: "Institutions",
                itemStyle: { color: "#3F83F8" },
              }, // Set color for 'Institutions'
              {
                value: otherOwner,
                name: "Others",
                itemStyle: { color: "#fff" },
              },
            ],
          },
        ],
      };

      return options;
    } else return null;
  };

  totalCalls = rawData?.totalCalls ?? 0;
  totalPuts = rawData?.totalPuts ?? 0;
  if (totalCalls + totalPuts !== 0) {
    callPercentage = (100 * totalCalls) / (totalCalls + totalPuts);
    putPercentage = 100 - callPercentage;
    putCallRatio = rawData?.putCallRatio;
  } else {
    callPercentage = 0;
    putPercentage = 0;
    putCallRatio = 0;
  }

  optionsPieChart = plotPieChart();

  let charNumber = 30;

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;
    if (isBottom && displayList?.length !== shareholderList?.length) {
      const nextIndex = displayList?.length;
      const filteredNewResults = shareholderList?.slice(
        nextIndex,
        nextIndex + 50,
      );
      displayList = [...displayList, ...filteredNewResults];
    }
  }

  onMount(async () => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  let columns = [
    { key: "investorName", label: "Institute", align: "left" },
    { key: "ownership", label: "Ownership", align: "right" },
    { key: "sharesNumber", label: "Shares", align: "right" },
    {
      key: "changeInSharesNumberPercentage",
      label: "Shares % Change",
      align: "right",
    },
    { key: "marketValue", label: "Market Value", align: "right" },
    { key: "weight", label: "Portfolio", align: "right" },
  ];

  let sortOrders = {
    investorName: { order: "none", type: "string" },
    ownership: { order: "none", type: "number" },
    sharesNumber: { order: "none", type: "number" },
    changeInSharesNumberPercentage: { order: "none", type: "number" },
    marketValue: { order: "none", type: "number" },
    weight: { order: "none", type: "number" },
  };

  const sortData = (key) => {
    // Reset all other keys to 'none' except the current key
    for (const k in sortOrders) {
      if (k !== key) {
        sortOrders[k].order = "none";
      }
    }

    // Cycle through 'none', 'asc', 'desc' for the clicked key
    const orderCycle = ["none", "asc", "desc"];

    let originalData = shareholderList;
    const currentOrderIndex = orderCycle.indexOf(sortOrders[key].order);
    sortOrders[key].order =
      orderCycle[(currentOrderIndex + 1) % orderCycle.length];
    const sortOrder = sortOrders[key].order;

    // Reset to original data when 'none' and stop further sorting
    if (sortOrder === "none") {
      displayList = [...originalData]?.slice(0, 50); // Reset to original data (spread to avoid mutation)
      return;
    }

    // Define a generic comparison function
    const compareValues = (a, b) => {
      const { type } = sortOrders[key];
      let valueA, valueB;

      switch (type) {
        case "date":
          valueA = new Date(a[key]);
          valueB = new Date(b[key]);
          break;
        case "string":
          valueA = a[key].toUpperCase();
          valueB = b[key].toUpperCase();
          return sortOrder === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        case "number":
        default:
          valueA = parseFloat(a[key]);
          valueB = parseFloat(b[key]);
          break;
      }

      if (sortOrder === "asc") {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    };

    // Sort using the generic comparison function
    displayList = [...originalData].sort(compareValues)?.slice(0, 50);
  };

  function generateStatementInfoHTML() {
    if (shareholderList?.length > 0) {
      return `
      <span>
         13F institutions, like mutual and pension funds, are large investors
        required by the SEC to disclose their holdings quarterly, significantly
        impacting company decisions and stock trends.
      </span>
    `;
    } else {
      return `
      <span>
        There are currently no records available for the 13 institutional
        holders of ${$displayCompanyName}
      </span>
    `;
    }
  }

  let htmlOutput = generateStatementInfoHTML();
</script>

<section class="overflow-hidden text-white h-full pb-8">
  <main class="overflow-hidden">
    <Infobox text={htmlOutput} />

    {#if shareholderList?.length !== 0}
      <div class="pb-2 rounded-md bg-default sm:bg-default">
        <div class="text-white text-[1rem] mt-3">
          As of {new Date(rawData?.date)?.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            daySuffix: "2-digit",
          })},
          <span class="font-semibold"
            >{new Intl.NumberFormat("en", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(rawData?.investorsHolding)}</span
          >
          Institutions hold a total of
          <span class="font-semibold"
            >{@html abbreviateNumber(
              rawData?.numberOf13Fshares,
              false,
              true,
            )}</span
          >
          {$displayCompanyName} shares, with a combined investment of
          <span class="font-semibold"
            >{@html abbreviateNumber(rawData?.totalInvested, true, true)}</span
          >.
        </div>

        {#if optionsPieChart !== null}
          <div class="flex flex-row items-center sm:-mt-5">
            <div class="app w-56">
              <Chart {init} options={optionsPieChart} class="chart w-full" />
            </div>

            <div class="flex flex-col items-center sm:pt-0 m-auto">
              <div class="flex flex-row items-center mr-auto mb-5">
                <div
                  class="h-full transform -translate-x-1/2"
                  aria-hidden="true"
                ></div>
                <div
                  class="w-4 h-4 bg-[#fff] border-4 box-content border-[#27272A] rounded-full transform -translate-x-1/2"
                  aria-hidden="true"
                ></div>
                <span
                  class="text-white text-sm sm:text-[1rem] font-medium inline-block"
                >
                  Others: {otherOwner >= 99.99
                    ? 99.99
                    : otherOwner?.toFixed(2)}%
                </span>
              </div>

              <div class="flex flex-row items-center mr-auto">
                <div
                  class="h-full transform -translate-x-1/2"
                  aria-hidden="true"
                ></div>
                <div
                  class="w-4 h-4 bg-blue-500 border-4 box-content border-[#27272A] rounded-full transform -translate-x-1/2"
                  aria-hidden="true"
                ></div>
                <span
                  class="text-white text-sm sm:text-[1rem] font-medium inline-block"
                >
                  Institutions: {institutionalOwner <= 0.01
                    ? "< 0.01%"
                    : institutionalOwner?.toFixed(2) + "%"}
                </span>
              </div>
            </div>
          </div>
        {/if}
      </div>

      {#if putCallRatio !== 0}
        <h1
          class="text-white font-semibold text-xl sm:text-2xl mb-3 mt-5 sm:-mt-5"
        >
          Options Activity
        </h1>

        <div class="mt-3 text-white text-md">
          Institutions are holding {callPercentage > 55
            ? "more Calls Contracts as Puts Contracts, indicating a bullish sentiment."
            : callPercentage < 45
              ? "more Puts Contracts as Calls Contracts, indicating a bearish sentiment."
              : "Calls/Puts contracts nearly balanced, indicating a neutral sentiment."}
        </div>

        <div class="w-full mt-5 mb-10 m-auto flex justify-center items-center">
          <div
            class="w-full grid grid-cols-2 lg:grid-cols-4 gap-y-3 lg:gap-y-3 gap-x-3"
          >
            <!--Start Put/Call-->
            <div
              class="flex flex-row items-center flex-wrap w-full px-3 sm:px-5 border border-gray-600 bg-primary rounded-md h-20"
            >
              <div class="flex flex-col items-start">
                <span class="font-medium text-white text-sm sm:text-[1rem]"
                  >Put/Call</span
                >
                <span
                  class="text-start text-sm sm:text-[1rem] font-medium text-white"
                >
                  {putCallRatio?.toFixed(3)}
                </span>
              </div>
              <!-- Circular Progress -->
              <div class="relative size-14 ml-auto">
                <svg
                  class="size-full w-14 h-14"
                  viewBox="0 0 36 36"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <!-- Background Circle -->
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    class="stroke-current text-[#3E3E3E]"
                    stroke-width="3"
                  ></circle>
                  <!-- Progress Circle inside a group with rotation -->
                  <g class="origin-center -rotate-90 transform">
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      class="stroke-current text-blue-500"
                      stroke-width="3"
                      stroke-dasharray="100"
                      stroke-dashoffset={putCallRatio >= 1
                        ? 0
                        : 100 - (putCallRatio * 100)?.toFixed(2)}
                    ></circle>
                  </g>
                </svg>
                <!-- Percentage Text -->
                <div
                  class="absolute top-1/2 start-1/2 transform -translate-y-1/2 -translate-x-1/2"
                >
                  <span class="text-center text-white text-sm"
                    >{putCallRatio?.toFixed(2)}</span
                  >
                </div>
              </div>
              <!-- End Circular Progress -->
            </div>
            <!--End Put/Call-->
            <!--Start Call Flow-->
            <div
              class="flex flex-row items-center flex-wrap w-full px-3 sm:px-5 border border-gray-600 bg-primary rounded-md h-20"
            >
              <div class="flex flex-col items-start">
                <span class="font-medium text-white text-sm sm:text-[1rem]"
                  >Call Flow</span
                >
                <span
                  class="text-start text-sm sm:text-[1rem] font-medium text-white"
                >
                  {new Intl.NumberFormat("en", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(rawData?.totalCalls)}
                </span>
              </div>
              <!-- Circular Progress -->
              <div class="relative size-14 ml-auto">
                <svg
                  class="size-full w-14 h-14"
                  viewBox="0 0 36 36"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <!-- Background Circle -->
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    class="stroke-current text-[#3E3E3E]"
                    stroke-width="3"
                  ></circle>
                  <!-- Progress Circle inside a group with rotation -->
                  <g class="origin-center -rotate-90 transform">
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      class="stroke-current text-[#00FC50]"
                      stroke-width="3"
                      stroke-dasharray="100"
                      stroke-dashoffset={(100 - callPercentage)?.toFixed(2)}
                    ></circle>
                  </g>
                </svg>
                <!-- Percentage Text -->
                <div
                  class="absolute top-1/2 start-1/2 transform -translate-y-1/2 -translate-x-1/2"
                >
                  <span class="text-center text-white text-sm"
                    >{callPercentage?.toFixed(0)}%</span
                  >
                </div>
              </div>
              <!-- End Circular Progress -->
            </div>
            <!--End Call Flow-->

            <!--Start Put Flow-->
            <div
              class="flex flex-row items-center flex-wrap w-full px-3 sm:px-5 border border-gray-600 bg-primary rounded-md h-20"
            >
              <div class="flex flex-col items-start">
                <span class="font-medium text-white text-sm sm:text-[1rem]"
                  >Put Flow</span
                >
                <span
                  class="text-start text-sm sm:text-[1rem] font-medium text-white"
                >
                  {new Intl.NumberFormat("en", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(rawData?.totalPuts)}
                </span>
              </div>
              <!-- Circular Progress -->
              <div class="relative size-14 ml-auto">
                <svg
                  class="size-full w-14 h-14"
                  viewBox="0 0 36 36"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <!-- Background Circle -->
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    class="stroke-current text-[#3E3E3E]"
                    stroke-width="3"
                  ></circle>
                  <!-- Progress Circle inside a group with rotation -->
                  <g class="origin-center -rotate-90 transform">
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      class="stroke-current text-[#EE5365]"
                      stroke-width="3"
                      stroke-dasharray="100"
                      stroke-dashoffset={100 - putPercentage}
                    ></circle>
                  </g>
                </svg>
                <!-- Percentage Text -->
                <div
                  class="absolute top-1/2 start-1/2 transform -translate-y-1/2 -translate-x-1/2"
                >
                  <span class="text-center text-white text-sm"
                    >{putPercentage?.toFixed(0)}%</span
                  >
                </div>
              </div>
              <!-- End Circular Progress -->
            </div>
            <!--End Put Flow-->
          </div>
        </div>
      {/if}

      <h3 class="text-white font-semibold text-xl sm:text-2xl mb-3 mt-5">
        Top Shareholders
      </h3>

      {#if topHolders !== 0}
        <span class="text-white text-[1rem">
          The Top 10 shareholders collectively own <span class="font-semibold"
            >{topHolders <= 0.01
              ? "< 0.01%"
              : topHolders?.toFixed(2) + "%"}</span
          >
          of the {$displayCompanyName}
        </span>
      {/if}

      <div class="flex justify-end items-end ml-auto w-fit mt-5">
        <DownloadData
          {data}
          rawData={shareholderList}
          title={`13-institute-${$stockTicker}`}
        />
      </div>
      <div
        class="flex justify-start items-center w-full m-auto mt-6 overflow-x-auto"
      >
        <table
          class="table table-sm table-compact bg-table border border-gray-800 w-full"
        >
          <thead>
            <TableHeader {columns} {sortOrders} {sortData} />
          </thead>
          <tbody>
            {#each displayList as item, index}
              {#if item?.investorName?.length > 0}
                <tr
                  class="border-b border-gray-800 odd:bg-odd sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] {index +
                    1 ===
                    shareholderList?.length && data?.user?.tier !== 'Pro'
                    ? 'opacity-[0.1]'
                    : ''}"
                >
                  <td
                    class="font-medium text-sm sm:text-[1rem] whitespace-nowrap"
                  >
                    <a
                      href={"/hedge-funds/" + item?.cik}
                      class="sm:hover:underline sm:hover:underline-offset-4 text-white"
                    >
                      {item?.investorName?.length > charNumber
                        ? formatString(
                            item?.investorName?.slice(0, charNumber),
                          ) + "..."
                        : formatString(item?.investorName)}
                    </a>
                  </td>

                  <td
                    class="text-white text-end font-medium text-sm sm:text-[1rem] whitespace-nowrap"
                  >
                    {item?.ownership <= 0.01
                      ? "< 0.01%"
                      : item?.ownership?.toFixed(2) + "%"}
                  </td>

                  <td
                    class="text-white text-end font-medium text-sm sm:text-[1rem] whitespace-nowrap"
                  >
                    {@html item?.sharesNumber !== null
                      ? abbreviateNumber(item?.sharesNumber, false, true)
                      : "-"}
                  </td>

                  <td
                    class="text-white text-end font-medium text-sm sm:text-[1rem] whitespace-nowrap"
                  >
                    {#if item?.changeInSharesNumberPercentage >= 0}
                      <span class="text-[#00FC50]"
                        >+{abbreviateNumber(
                          item?.changeInSharesNumberPercentage?.toFixed(2),
                        )}%</span
                      >
                    {:else if item?.changeInSharesNumberPercentage < 0}
                      <span class="text-[#FF2F1F]"
                        >{abbreviateNumber(
                          item?.changeInSharesNumberPercentage?.toFixed(2),
                        )}%</span
                      >
                    {:else}
                      -
                    {/if}
                  </td>

                  <td
                    class="text-white text-end font-medium text-sm sm:text-[1rem] whitespace-nowrap"
                  >
                    {item?.marketValue !== null
                      ? abbreviateNumber(item?.marketValue)
                      : "-"}
                  </td>

                  <td
                    class="text-white text-end font-medium text-sm sm:text-[1rem] whitespace-nowrap"
                  >
                    {item?.weight <= 0.01
                      ? "< 0.01%"
                      : item?.weight?.toFixed(2) + "%"}
                  </td>
                </tr>
              {/if}
            {/each}
          </tbody>
        </table>
      </div>

      <UpgradeToPro {data} />
    {/if}
  </main>
</section>

<style>
  .app {
    height: 300px;
    max-width: 100%; /* Ensure chart width doesn't exceed the container */
  }

  @media (max-width: 640px) {
    .app {
      height: 150px;
      width: 150px;
    }
  }

  .chart {
    width: 100%;
  }
</style>
