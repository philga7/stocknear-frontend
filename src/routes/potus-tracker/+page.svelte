<script lang="ts">
  import SEO from "$lib/components/SEO.svelte";
  import Map from "$lib/components/Map.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";

  export let data;

  let rawData = data?.getData?.history || [];
  let executiveOrders = data?.getData?.executiveOrders || [];

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

  function truncateText(text: string, maxLength: number = 250) {
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
  S&P500 has ${data?.getData?.returnSince >= 0 ? "grown" : "declined"} by <span class="${data?.getData?.returnSince >= 0 ? "text-[#00FC50] before:content-['+']" : "text-[#FF2F1F]"}">
  ${data?.getData?.returnSince ?? "n/a"}%</span>.`}
              />
            </div>

            <h2
              class="text-white text-[1rem] sm:text-xl font-semibold mb-2 mt-4"
            >
              The President is in {(data?.getData?.city === "Washington" ||
              data?.getData?.city === null
                ? "the White House"
                : data?.getData?.city) ?? "n/a"}
            </h2>

            <div class="w-full m-auto border border-gray-800 rounded-[10px]">
              <Map LAT={data?.getData?.lat} LON={data?.getData?.lon} />
            </div>
            <span class="text-gray-300 text-xs">
              Map data © OpenStreetMap
            </span>

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
                      class="border-b border-gray-200 pb-2 w-full flex flex-row items-center justify-between"
                    >
                      <span class="text-[1rem] font-semibold text-white">
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
          </div>

          <div
            class="order-4 flex-shrink-0 lg:float-right lg:w-[336px] no-scrollbar overflow-y-auto"
          >
            <h3 class="text-white text-lg sm:text-xl font-semibold mb-2 mt-6">
              Executive Actions
            </h3>
            <div
              class="max-h-[600px] overflow-y-auto border border-gray-800 rounded-md p-4 no-scrollbar"
            >
              <div class="space-y-4">
                {#each Object.entries(groupedOrders) as [date, items], indexA}
                  <div class="my-4">
                    <div
                      class="border-b border-gray-300 pb-2 flex flex-row items-center"
                    >
                      <span class="text-lg font-semibold text-white"
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

                          <div
                            class="text-sm flex flex-col items-start w-full mb-1"
                          >
                            <span
                              class="text-white text-lg font-semibold inline-block"
                              >{item.title}</span
                            >
                          </div>
                        </div>

                        <div
                          class="ml-7 {item?.sentiment === 'Bullish'
                            ? 'bg-emerald-500 text-white'
                            : item?.sentiment === 'Bearish'
                              ? 'bg-red-600 text-white'
                              : 'bg-white text-black'} py-1 rounded text-xs sm:text-sm w-fit px-2 font-medium"
                        >
                          {item?.sentiment}
                        </div>

                        <span class="text-[1rem] ml-7 pt-2">
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
                          class="ml-7 inline-block text-sm sm:text-[1rem] text-white hover:underline"
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
