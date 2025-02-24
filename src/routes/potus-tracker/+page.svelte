<script lang="ts">
  import SEO from "$lib/components/SEO.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  import highcharts from "$lib/highcharts.ts";
  import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
  import { Button } from "$lib/components/shadcn/button/index.js";
  import { sectorList } from "$lib/utils";
  import avatar from "$lib/images/trump-avatar.jpeg";

  export let data;

  const updatedSectorList = ["S&P500", ...sectorList];

  let rawData = data?.getData?.history || [];
  let executiveOrders = data?.getData?.executiveOrders || [];
  let selectedSector = "S&P500";
  const sectorDict = {
    "S&P500": "SPY",
    "Basic Materials": "XLB",
    "Communication Services": "XLC",
    Energy: "XLE",
    "Financial Services": "XLF",
    Industrials: "XLI",
    Technology: "XLK",
    "Consumer Defensive": "XLP",
    "Real Estate": "XLRE",
    Utilities: "XLU",
    Healthcare: "XLV",
    "Consumer Cyclical": "XLY",
  };

  const groupedByDate = rawData?.reduce((acc, item) => {
    const dateKey = new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(item.date));

    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {});

  let groupedOrders = executiveOrders.reduce((acc, item) => {
    const dateKey = new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(item.date));

    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {});

  const tabs = [
    {
      title: "Presidential Schedule",
    },
    {
      title: "Executive Orders",
    },
  ];

  let activeIdx = 0;
  let expandedDescriptions: { [key: string]: boolean } = {};

  function truncateText(text: string, maxLength: number = 300) {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  }

  function latestInfoDate(inputDate) {
    // Create a Date object for the input date and convert it to New York time zone
    const inputDateLocal = new Date(inputDate).toLocaleString("en-US", {
      timeZone: "America/New_York",
    });

    // Get the current date and time in New York timezone
    const todayLocal = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
    });

    // Convert the localized strings back to Date objects
    const inputDateMs = new Date(inputDateLocal).getTime();
    const todayMs = new Date(todayLocal).getTime();

    // Calculate the difference in milliseconds
    const differenceInMs = todayMs - inputDateMs;

    // Convert milliseconds to days
    const differenceInDays = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));

    // Return whether the difference is less than or equal to 1 day
    return differenceInDays <= 2;
  }

  function plotData() {
    // Transform raw data into arrays for Highcharts
    const rawData =
      data?.getData?.marketPerformance[sectorDict[selectedSector]];

    // Convert data into arrays for Highcharts
    const categories = Object.keys(rawData);
    const values = Object.values(rawData);

    const options = {
      credits: {
        enabled: false,
      },
      chart: {
        type: "column",
        backgroundColor: "#09090B",
        plotBackgroundColor: "#09090B",
        height: 360,
        animation: false,
      },
      title: {
        text: `<h3 class="mt-3 mb-1 text-[1rem] sm:text-xl">${selectedSector} - Performance</h3>`,
        style: {
          color: "white",
        },
        useHTML: true,
      },
      xAxis: {
        categories: categories,
        gridLineWidth: 0,
        labels: {
          style: { color: "white" },
        },
      },
      yAxis: {
        gridLineWidth: 1,
        gridLineColor: "#111827",
        labels: {
          style: { color: "white" },
          formatter: function () {
            return this.value + "%"; // Add percentage symbol
          },
        },
        title: { text: null },
        opposite: true,
      },
      tooltip: {
        enabled: false,
      },
      plotOptions: {
        series: {
          color: "white",
          animation: false,
          dataLabels: {
            enabled: true,
            color: "white",
            style: {
              fontSize: "13px",
              fontWeight: "bold",
            },
            formatter: function () {
              return this.y.toFixed(2) + "%"; // Add percentage symbol
            },
          },
        },
      },
      legend: {
        enabled: false,
      },
      series: [
        {
          name: "Performance",
          data: values,
          zones: [
            {
              value: 0, // Values below 0
              color: "#E02424", // Red
              borderColor: "#E02424", // Red border
            },
            {
              color: "#10B981", // Green for values 0 and above
              borderColor: "#10B981", // Green border
            },
          ],
        },
      ],
    };

    return options;
  }

  let config = null;

  $: {
    if (selectedSector) {
      config = plotData() || null;
    }
  }
</script>

<SEO
  title="POTUS Tracker: Real-Time Presidential Schedule, Executive Orders & Legislation"
  description="Track the President of the United States in real-time. Get updates on the POTUS schedule, executive orders, signed legislation, and official events."
/>

<section
  class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden min-h-screen pb-20 pt-5 px-4 lg:px-3 text-white"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">POTUS Tracker</li>
    </ul>
  </div>

  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <div
        class="relative flex flex-row justify-center items-start overflow-hidden w-full"
      >
        <div class="w-full mt-5">
          <div class="lg:float-left lg:w-[calc(100%-336px-20px)]">
            <div class=" border-b-[2px]">
              <h1 class="mb-1 text-white text-2xl sm:text-3xl font-bold">
                POTUS Tracker
              </h1>
            </div>
          </div>

          <div class=" lg:float-left lg:w-[calc(100%-336px-40px)]">
            <div class="mt-5 mb-5">
              <Infobox
                text={`Since the inauguration of Donald J. Trump on January 20, 2025, the 
  ${selectedSector} has ${data?.getData?.marketPerformance[sectorDict[selectedSector]]["Inauguration"] >= 0 ? "grown" : "declined"} by <span class="${data?.getData?.marketPerformance[sectorDict[selectedSector]]["Inauguration"] >= 0 ? "text-[#00FC50] before:content-['+']" : "text-[#FF2F1F]"}">
  ${data?.getData?.marketPerformance[sectorDict[selectedSector]]["Inauguration"] ?? "n/a"}%</span>.`}
              />
            </div>

            <div class="flex flex-row items-center w-fit ml-auto mt-2 sm:mt-0">
              <div class="relative inline-block text-left grow">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild let:builder>
                    <Button
                      builders={[builder]}
                      class="w-full border-gray-600 border bg-default sm:hover:bg-primary ease-out  flex flex-row justify-between items-center px-3 py-2 text-white rounded-md truncate"
                    >
                      <span class="truncate text-white">{selectedSector}</span>
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
                      Select Sector
                    </DropdownMenu.Label>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Group>
                      {#each updatedSectorList as sector}
                        {#if sector === "S&P500" || data?.user?.tier === "Pro"}
                          <DropdownMenu.Item
                            on:click={() => (selectedSector = sector)}
                            class="cursor-pointer hover:bg-primary"
                          >
                            {sector}
                          </DropdownMenu.Item>
                        {:else}
                          <DropdownMenu.Item
                            on:click={() => goto("/pricing")}
                            class="cursor-pointer hover:bg-primary"
                          >
                            {sector}
                            <svg
                              class="ml-1 size-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              style="max-width: 40px;"
                            >
                              <path
                                fill-rule="evenodd"
                                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                clip-rule="evenodd"
                              >
                              </path>
                            </svg>
                          </DropdownMenu.Item>
                        {/if}
                      {/each}
                    </DropdownMenu.Group>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </div>
            </div>

            <div
              class="chart mt-5 border border-gray-800 rounded"
              use:highcharts={config}
            ></div>

            <nav
              class=" border-b-[2px] whitespace-nowrap mt-10 sm:mt-6 overflow-hidden"
            >
              <ul
                class="flex flex-row items-center w-full text-[1rem] text-white"
              >
                {#each tabs as item, i}
                  <button
                    on:click={() => (activeIdx = i)}
                    class="p-2 px-5 cursor-pointer {activeIdx === i
                      ? 'text-white bg-primary sm:hover:bg-opacity-[0.95] font-semibold'
                      : 'text-gray-400 sm:hover:text-white sm:hover:bg-primary sm:hover:bg-opacity-[0.95]'}"
                  >
                    {item.title}
                  </button>
                {/each}
              </ul>
            </nav>

            {#if activeIdx === 0}
              <h3
                class="text-white text-lg sm:text-xl font-semibold mb-2 mt-6 border-y border-gray-800 pt-2 pb-2"
              >
                Official Presidential Schedule
              </h3>
              <div
                class="max-h-[600px] overflow-y-auto border border-gray-800 rounded-md p-4 no-scrollbar"
              >
                <div class="space-y-4">
                  {#each Object.entries(groupedByDate) as [date, items], indexA}
                    <div class="my-4">
                      <div
                        class="border-b border-gray-600 pb-2 w-full flex flex-row items-center justify-between"
                      >
                        <span
                          class="text-[1rem] sm:text-lg font-semibold text-white"
                        >
                          {date}</span
                        >
                        {#if items?.at(0)?.changesPercentage}
                          <div class="ml-auto text-sm">
                            <span class="inline-block">S&P500</span>
                            <span
                              class="{items?.at(0)?.changesPercentage > 0
                                ? "text-[#00FC50] before:content-['+']"
                                : 'text-[#FF2F1F]'} "
                              >{items.length > 0
                                ? items?.at(0)?.changesPercentage
                                : "n/a"}%</span
                            >
                          </div>
                        {/if}
                      </div>
                      <!-- Display date -->
                      <br />
                      {#each items as item, indexB}
                        <div class="flex flex-col items-start space-y-1 mb-6">
                          <div class="flex flex-row items-center space-x-2">
                            <div class="relative">
                              <svg
                                fill={indexA === 0 && indexB === 0
                                  ? "#2E86DE"
                                  : "#808080"}
                                class="w-5 h-5 relative z-10"
                                viewBox="-51.2 -51.2 614.40 614.40"
                                id="_78_Circle-Full"
                                xmlns="http://www.w3.org/2000/svg"
                                stroke={indexA === 0 && indexB === 0
                                  ? "#2E86DE"
                                  : "#808080"}
                                stroke-width="0.00512"
                              >
                                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                <g
                                  id="SVGRepo_tracerCarrier"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke="#CCCCCC"
                                  stroke-width="24.576"
                                ></g>
                                <g id="SVGRepo_iconCarrier">
                                  <path
                                    id="Path_111"
                                    data-name="Path 111"
                                    d="M256,512C114.625,512,0,397.375,0,256S114.625,0,256,0,512,114.625,512,256,397.375,512,256,512Zm0-448C149.969,64,64,149.969,64,256s85.969,192,192,192,192-85.969,192-192S362.031,64,256,64Zm0,320A128,128,0,1,1,384,256,128.006,128.006,0,0,1,256,384Z"
                                    fill-rule="evenodd"
                                  ></path>
                                </g>
                              </svg>

                              {#if indexA === 0 && indexB === 0}
                                <span
                                  class="absolute -inset-1 rounded-full animate-ping w-3 h-3 m-auto bg-blue-400/75"
                                ></span>
                              {/if}
                            </div>

                            <span class="text-sm text-gray-400">
                              {item.time_formatted}
                              {item.location !== null
                                ? `- ${item?.location}`
                                : ""}
                            </span>
                          </div>

                          <span class="text-sm ml-7">
                            {item.details}
                          </span>
                        </div>
                      {/each}
                    </div>
                  {/each}
                </div>
              </div>
            {:else}
              <h3
                class="text-white text-lg sm:text-xl font-semibold mb-2 mt-6 border-y border-gray-800 pt-2 pb-2"
              >
                Executive Actions
              </h3>
              <div
                class="max-h-[600px] overflow-y-auto border border-gray-800 rounded-md p-4 no-scrollbar"
              >
                <div class="space-y-4">
                  {#each Object.entries(groupedOrders) as [date, items], indexA}
                    <div class="my-4">
                      <div
                        class="border-b border-gray-600 pb-2 flex flex-row items-center"
                      >
                        <span class="text-[1rem] font-semibold text-white"
                          >{date}</span
                        >
                        {#if latestInfoDate(date)}
                          <label
                            class="bg-[#fff] rounded text-black font-semibold text-xs px-2 py-0.5 ml-3 inline-block"
                            >New</label
                          >
                        {/if}
                      </div>
                      <br />

                      {#each items as item, indexB}
                        <div
                          class="flex flex-col items-start space-y-1 mb-6 border-b border-gray-800 pb-4"
                        >
                          <div class="flex items-start space-x-3">
                            <img
                              class="w-10 h-10 rounded-full flex-shrink-0"
                              src={avatar}
                              alt="Avatar"
                              loading="lazy"
                            />

                            <div class="flex flex-col w-full">
                              <h3 class="text-white font-semibold">
                                {item?.title}
                              </h3>

                              <div
                                class={`mt-1 px-3 py-1 rounded text-xs sm:text-sm font-medium w-fit
        ${
          item?.sentiment === "Bullish"
            ? "bg-emerald-500 text-white"
            : item?.sentiment === "Bearish"
              ? "bg-red-600 text-white"
              : "bg-gray-200 text-black"
        }`}
                              >
                                {item?.sentiment}
                              </div>
                            </div>
                          </div>

                          <span class="text-sm ml-14 pt-2">
                            {#if item.description.length > 150}
                              {expandedDescriptions[item.title]
                                ? item.description
                                : truncateText(item.description)}
                              <button
                                on:click={() =>
                                  (expandedDescriptions[item.title] =
                                    !expandedDescriptions[item.title])}
                                class="text-blue-400 hover:text-blue-300 ml-1 font-medium"
                              >
                                {expandedDescriptions[item.title]
                                  ? "Read less"
                                  : "Read more"}
                              </button>
                            {:else}
                              {item.description}
                            {/if}
                          </span>

                          <a
                            href={item?.link}
                            rel="noopener noreferrer"
                            target="_blank"
                            class="ml-14 inline-block text-sm text-white hover:underline"
                          >
                            Source
                            <svg
                              class="w-4 h-4 sm:w-5 sm:h-5 -mt-0.5 inline-block"
                              fill="#fff"
                              viewBox="0 0 64 64"
                              version="1.1"
                              xmlns="http://www.w3.org/2000/svg"
                              xmlns:xlink="http://www.w3.org/1999/xlink"
                              xml:space="preserve"
                              xmlns:serif="http://www.serif.com/"
                              style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"
                              ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
                                id="SVGRepo_tracerCarrier"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              ></g><g id="SVGRepo_iconCarrier">
                                <rect
                                  id="Icons"
                                  x="-896"
                                  y="0"
                                  width="1280"
                                  height="800"
                                  style="fill:none;"
                                ></rect>
                                <g id="Icons1" serif:id="Icons">
                                  <g id="Strike"> </g> <g id="H1"> </g>
                                  <g id="H2"> </g> <g id="H3"> </g>
                                  <g id="list-ul"> </g>
                                  <g id="hamburger-1"> </g>
                                  <g id="hamburger-2"> </g>
                                  <g id="list-ol"> </g>
                                  <g id="list-task"> </g> <g id="trash"> </g>
                                  <g id="vertical-menu"> </g>
                                  <g id="horizontal-menu"> </g>
                                  <g id="sidebar-2"> </g> <g id="Pen"> </g>
                                  <g id="Pen1" serif:id="Pen"> </g>
                                  <g id="clock"> </g>
                                  <g id="external-link">
                                    <path
                                      d="M36.026,20.058l-21.092,0c-1.65,0 -2.989,1.339 -2.989,2.989l0,25.964c0,1.65 1.339,2.989 2.989,2.989l26.024,0c1.65,0 2.989,-1.339 2.989,-2.989l0,-20.953l3.999,0l0,21.948c0,3.308 -2.686,5.994 -5.995,5.995l-28.01,0c-3.309,0 -5.995,-2.687 -5.995,-5.995l0,-27.954c0,-3.309 2.686,-5.995 5.995,-5.995l22.085,0l0,4.001Z"
                                    ></path>
                                    <path
                                      d="M55.925,25.32l-4.005,0l0,-10.481l-27.894,27.893l-2.832,-2.832l27.895,-27.895l-10.484,0l0,-4.005l17.318,0l0.002,0.001l0,17.319Z"
                                    ></path>
                                  </g> <g id="hr"> </g> <g id="info"> </g>
                                  <g id="warning"> </g>
                                  <g id="plus-circle"> </g>
                                  <g id="minus-circle"> </g> <g id="vue"> </g>
                                  <g id="cog"> </g> <g id="logo"> </g>
                                  <g id="radio-check"> </g>
                                  <g id="eye-slash"> </g> <g id="eye"> </g>
                                  <g id="toggle-off"> </g>
                                  <g id="shredder"> </g>
                                  <g
                                    id="spinner--loading--dots-"
                                    serif:id="spinner [loading, dots]"
                                  >
                                  </g> <g id="react"> </g>
                                  <g id="check-selected"> </g>
                                  <g id="turn-off"> </g>
                                  <g id="code-block"> </g>
                                  <g id="user"> </g> <g id="coffee-bean"> </g>
                                  <g id="coffee-beans">
                                    <g id="coffee-bean1" serif:id="coffee-bean">
                                    </g>
                                  </g> <g id="coffee-bean-filled"> </g>
                                  <g id="coffee-beans-filled">
                                    <g id="coffee-bean2" serif:id="coffee-bean">
                                    </g>
                                  </g> <g id="clipboard"> </g>
                                  <g id="clipboard-paste"> </g>
                                  <g id="clipboard-copy"> </g>
                                  <g id="Layer1"> </g>
                                </g>
                              </g></svg
                            >
                          </a>
                        </div>
                      {/each}
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
          </div>

          <div class="order-4 flex-shrink-0 lg:float-right lg:w-[336px]">
            <div
              class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-inherit sm:hover:bg-secondary transition ease-out duration-100"
            >
              <a
                href={`/newsletter`}
                class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
              >
                <div class="w-full flex justify-between items-center p-3 mt-3">
                  <h2 class="text-start text-xl font-semibold text-white ml-3">
                    Market Newsletter
                  </h2>
                </div>
                <span class="text-white p-3 ml-3 mr-3">
                  Get a daily email with the top market news in bullet point
                  format.
                </span>
              </a>
            </div>

            <div
              class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-inherit sm:hover:bg-secondary transition ease-out duration-100"
            >
              <a
                href={"/stock-screener"}
                class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
              >
                <div class="w-full flex justify-between items-center p-3 mt-3">
                  <h2 class="text-start text-xl font-semibold text-white ml-3">
                    Stock Screener
                  </h2>
                </div>
                <span class="text-white p-3 ml-3 mr-3">
                  Build your Stock Screener to find profitable stocks.
                </span>
              </a>
            </div>
            <div
              class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-inherit sm:hover:bg-secondary transition ease-out duration-100"
            >
              <a
                href={"/watchlist/stocks"}
                class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
              >
                <div class="w-full flex justify-between items-center p-3 mt-3">
                  <h2 class="text-start text-xl font-semibold text-white ml-3">
                    Watchlist
                  </h2>
                </div>
                <span class="text-white p-3 ml-3 mr-3">
                  Keep track of your favorite stocks in real-time.
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .app {
    height: 500px;
    width: 100%;
  }

  @media (max-width: 560px) {
    .app {
      width: 100%;
      height: 300px;
    }
  }

  .chart {
    width: 100%;
  }
</style>
