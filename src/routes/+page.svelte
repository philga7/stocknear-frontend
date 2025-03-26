<script lang="ts">
  import { onMount } from "svelte";

  import * as Card from "$lib/components/shadcn/card/index.ts";
  import * as Table from "$lib/components/shadcn/table/index.ts";
  import ArrowUpRight from "lucide-svelte/icons/arrow-up-right";
  import { abbreviateNumber } from "$lib/utils";
  import { screenWidth } from "$lib/store";
  import { compareTimes, formatTime, isPWAInstalled } from "$lib/utils";
  import Infobox from "$lib/components/Infobox.svelte";
  import { closedPWA } from "$lib/store";
  import Feedback from "$lib/components/Feedback.svelte";
  import SEO from "$lib/components/SEO.svelte";

  export let data;

  let gainersList = data?.getDashboard?.marketMovers?.gainers || [];
  let losersList = data?.getDashboard?.marketMovers?.losers || [];
  let marketStatus = data?.getDashboard?.marketStatus ?? 0;
  let analystReport = data?.getDashboard?.analystReport || {};
  let recentWIIM = data?.getDashboard?.wiim || [];

  let pwaInstalled = false;
  let AppInstalled = null;

  function getClosedPWA() {
    //if user closed the banner
    const item = localStorage.getItem("closePWA");
    if (!item) return null;

    const { value, expires } = JSON.parse(item);
    if (new Date() > new Date(expires)) {
      localStorage.removeItem("closePWA"); // Remove expired item
      return null;
    }
    return value;
  }

  onMount(async () => {
    pwaInstalled = isPWAInstalled();

    if (!pwaInstalled) {
      try {
        $closedPWA = getClosedPWA();

        if (!$closedPWA) {
          // Dynamically import the AppInstalled component
          AppInstalled = (await import("$lib/components/AppInstalled.svelte"))
            .default;
        }
      } catch (e) {
        console.error("Error loading AppInstalled component:", e);
      }
    }
  });

  $: charNumber = $screenWidth < 640 ? 20 : 15;
</script>

<SEO
  title="Free Online Stock Analysis for Investors"
  description="Stocknear has everything you need to analyze stocks with help of AI, including detailed financial data, statistics, news and charts."
/>

<div
  class="w-full sm:max-w-[1400px] overflow-hidden m-auto min-h-screen bg-white dark:bg-default text-muted dark:text-white mb-16"
>
  {#if AppInstalled && !$closedPWA}
    <svelte:component this={AppInstalled} />
  {/if}

  <!--
  {#if !["Pro", "Plus"]?.includes(data?.user?.tier) || data?.user?.freeTrial === true}
    <div class="flex justify-center mb-5">
      <a
        href="/pricing"
        class="cursor-pointer hidden sm:flex items-center gap-2 px-6 py-3.5 sm:px-3.5 sm:py-2.5 text-[1rem] font-medium dark:text-indigo-300 bg-blue-100 dark:bg-indigo-500/20 sm:hover:bg-indigo-500/30 border border-indigo-500/20 shadow dark:border-indigo-500/30 rounded-lg transition-all duration-100"
        tabindex="0"
      >
        <svg
          class="w-5 h-5 text-zinc-500 dark:text-zinc-300"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
            clip-rule="evenodd"
          ></path>
        </svg>
        <span>Introducing Plus Tier: Our new affordable plan for Traders</span>
      </a>
    </div>
  {/if}
  -->

  <div class="flex flex-col m-auto justify-center items-center">
    <div class="text-center mb-10 w-full px-4 sm:px-3 mt-10">
      {#if data?.user}
        <Feedback {data} />
      {/if}

      <div
        class="text-center mb-10 relative w-fit flex justify-center m-auto text-white"
      >
        <div class="mb-4 flex justify-center -mt-3 lg:mb-8">
          <a href="/analysts/analyst-flow"
            ><div
              class="flex items-center justify-center sm:hover:text-muted dark:sm:hover:text-white text-blue-600 dark:text-blue-400"
            >
              <div class="text-lg sm:text-xl font-semibold">
                Analysts Realtime Flow
              </div>
              <div
                class="-mt-2 ml-1 -rotate-6 rounded-lg bg-red-500 px-1 py-0.5 text-xs font-semibold text-white"
              >
                New
              </div>
            </div></a
          >
        </div>
      </div>

      <h1
        class="hidden sm:block text-3xl lg:text-4xl text-muted dark:text-white font-bold text-center mb-10 relative w-fit flex justify-center m-auto"
      >
        Clear & <span class="italic">Simple</span> Market Insight.
      </h1>

      <h2
        class="text-muted dark:text-white text-2xl font-semibold text-start w-full pb-4 sm:pl-4 sm:pb-2"
      >
        Dashboard
      </h2>

      <main class="flex flex-1 flex-col gap-4 sm:p-4 md:gap-8">
        <div class="grid gap-4 md:gap-8 grid-cols-1 lg:grid-cols-2 text-start">
          <Card.Root
            class=" order-1 sm:order-2 overflow-x-auto overflow-hidden overflow-y-auto no-scrollbar max-h-[450px]"
          >
            <Card.Header class="flex flex-row items-center">
              <div class="flex flex-col items-start w-full">
                <div class="flex flex-row w-full items-center">
                  <Card.Title
                    ><a
                      href={`/market-mover/${marketStatus === 0 ? "gainers" : marketStatus === 1 ? "premarket/gainers" : "afterhours/gainers"}`}
                      class="text-xl sm:text-2xl text-muted dark:text-white font-semibold cursor-pointer sm:hover:underline sm:hover:underline-offset-4"
                    >
                      {marketStatus === 0
                        ? "Top"
                        : marketStatus === 1
                          ? "Pre-Market"
                          : "Afterhours"} Gainers
                      <svg
                        class="h-5 w-5 inline-block"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        style="max-width:40px"
                        aria-hidden="true"
                        ><path
                          fill-rule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clip-rule="evenodd"
                        ></path></svg
                      ></a
                    >
                  </Card.Title>
                </div>
              </div>
            </Card.Header>
            <Card.Content>
              {#if gainersList?.length > 0}
                <Table.Root class="overflow-x-auto w-full">
                  <Table.Header>
                    <Table.Row>
                      <Table.Head class=" font-semibold">Symbol</Table.Head>
                      <Table.Head class="hidden sm:table-cell  font-semibold"
                        >Name</Table.Head
                      >
                      <Table.Head class=" text-right font-semibold"
                        >Price</Table.Head
                      >
                      <Table.Head class=" text-right font-semibold"
                        >Change</Table.Head
                      >
                      <Table.Head
                        class=" text-right font-semibold whitespace-nowrap"
                        >Market Cap</Table.Head
                      >
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {#each gainersList as item}
                      <Table.Row>
                        <Table.Cell class="text-sm sm:text-[1rem]">
                          <a
                            href={`/stocks/${item?.symbol}`}
                            class="text-blue-600 dark:text-blue-400 sm:hover:text-muted dark:sm:hover:text-white cursor-pointer"
                            >{item?.symbol}</a
                          >
                        </Table.Cell>
                        <Table.Cell
                          class="hidden sm:table-cell xl:table.-column text-sm sm:text-[1rem]"
                        >
                          {item?.name?.length > charNumber
                            ? item?.name?.slice(0, charNumber) + "..."
                            : item?.name}
                        </Table.Cell>
                        <Table.Cell
                          class="text-right xl:table.-column text-sm sm:text-[1rem]"
                        >
                          {item?.price?.toFixed(2)}
                        </Table.Cell>
                        <Table.Cell
                          class="text-right md:table.-cell xl:table.-column text-sm sm:text-[1rem] text-white"
                        >
                          {#if item?.changesPercentage >= 0}
                            <span class="text-[#208646] dark:text-[#00FC50]"
                              >+{item?.changesPercentage >= 1000
                                ? abbreviateNumber(item?.changesPercentage)
                                : item?.changesPercentage?.toFixed(2)}%</span
                            >
                          {:else}
                            <span class="text-[#DC2626] dark:text-[#FF2F1F]"
                              >{item?.changesPercentage <= -1000
                                ? abbreviateNumber(item?.changesPercentage)
                                : item?.changesPercentage?.toFixed(2)}%
                            </span>
                          {/if}
                        </Table.Cell>
                        <Table.Cell
                          class="text-right xl:table.-column text-sm sm:text-[1rem]"
                        >
                          {abbreviateNumber(item?.marketCap)}
                        </Table.Cell>
                      </Table.Row>
                    {/each}
                  </Table.Body>
                </Table.Root>
              {:else}
                <Infobox
                  text="Currently, no market gainer data is available."
                />
              {/if}
            </Card.Content>
          </Card.Root>
          <Card.Root
            class="order-1 sm:order-2 overflow-x-auto overflow-hidden overflow-y-auto no-scrollbar max-h-[450px]"
          >
            <Card.Header class="flex flex-row items-center">
              <div class="flex flex-col items-start w-full">
                <div class="flex flex-row w-full items-center">
                  <Card.Title>
                    <a
                      href={`/market-mover/${marketStatus === 0 ? "losers" : marketStatus === 1 ? "premarket/losers" : "afterhours/losers"}`}
                      class="text-xl sm:text-2xl text-muted dark:text-white font-semibold cursor-pointer sm:hover:underline sm:hover:underline-offset-4"
                    >
                      {marketStatus === 0
                        ? "Top"
                        : marketStatus === 1
                          ? "Pre-Market"
                          : "Afterhours"} Losers
                      <svg
                        class="h-5 w-5 inline-block"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        style="max-width:40px"
                        aria-hidden="true"
                        ><path
                          fill-rule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clip-rule="evenodd"
                        ></path></svg
                      >
                    </a></Card.Title
                  >
                </div>
              </div>
            </Card.Header>
            <Card.Content>
              {#if losersList?.length > 0}
                <Table.Root class="overflow-x-auto w-full">
                  <Table.Header>
                    <Table.Row>
                      <Table.Head class=" font-semibold">Symbol</Table.Head>
                      <Table.Head class="hidden sm:table-cell  font-semibold"
                        >Name</Table.Head
                      >
                      <Table.Head class=" text-right font-semibold"
                        >Price</Table.Head
                      >
                      <Table.Head class=" text-right font-semibold"
                        >Change</Table.Head
                      >
                      <Table.Head
                        class=" text-right font-semibold whitespace-nowrap"
                        >Market Cap</Table.Head
                      >
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {#each losersList as item}
                      <Table.Row>
                        <Table.Cell class="text-sm sm:text-[1rem]">
                          <a
                            href={`/stocks/${item?.symbol}`}
                            class="text-blue-600 dark:text-blue-400 dark:sm:hover:text-white sm:hover:text-muted cursor-pointer"
                            >{item?.symbol}</a
                          >
                        </Table.Cell>
                        <Table.Cell
                          class="hidden sm:table-cell xl:table.-column text-sm sm:text-[1rem]"
                        >
                          {item?.name?.length > charNumber
                            ? item?.name?.slice(0, charNumber) + "..."
                            : item?.name}
                        </Table.Cell>
                        <Table.Cell
                          class="text-right xl:table.-column text-sm sm:text-[1rem]"
                        >
                          {item?.price?.toFixed(2)}
                        </Table.Cell>
                        <Table.Cell
                          class="text-right md:table.-cell xl:table.-column text-sm sm:text-[1rem] text-white"
                        >
                          {#if item?.changesPercentage >= 0}
                            <span class="text-[#208646] dark:text-[#00FC50]"
                              >+{item?.changesPercentage >= 1000
                                ? abbreviateNumber(item?.changesPercentage)
                                : item?.changesPercentage?.toFixed(2)}%</span
                            >
                          {:else}
                            <span class="text-[#DC2626] dark:text-[#FF2F1F]"
                              >{item?.changesPercentage <= -1000
                                ? abbreviateNumber(item?.changesPercentage)
                                : item?.changesPercentage?.toFixed(2)}%
                            </span>
                          {/if}
                        </Table.Cell>
                        <Table.Cell
                          class="text-right xl:table.-column text-sm sm:text-[1rem]"
                        >
                          {abbreviateNumber(item?.marketCap)}
                        </Table.Cell>
                      </Table.Row>
                    {/each}
                  </Table.Body>
                </Table.Root>
              {:else}
                <Infobox text="Currently, no market loser data is available." />
              {/if}
            </Card.Content>
          </Card.Root>
        </div>

        <div class="grid gap-4 md:gap-8 grid-cols-1 lg:grid-cols-2 text-start">
          <Card.Root
            class="order-1 overflow-x-auto overflow-hidden overflow-y-auto no-scrollbar sm:max-h-[470px]"
          >
            <Card.Header class="flex flex-row items-center">
              <div class="flex flex-col items-start w-full">
                <div class="flex flex-row w-full items-center">
                  <Card.Title class="text-xl sm:text-2xl  font-semibold"
                    >Stock & Market News</Card.Title
                  >
                </div>
              </div>
            </Card.Header>
            <Card.Content>
              {#if recentWIIM?.length !== 0}
                <ul style="padding-left: 5px;">
                  {#each recentWIIM as item, index}
                    {#if index >= 3 && !["Pro", "Plus"]?.includes(data?.user?.tier)}
                      <li
                        class="text-sm sm:text-[1rem]"
                        style="margin-left: 8px; margin-bottom: 15px; list-style-type: disc;"
                      >
                        {item?.text?.slice(0, 48) + "..."}
                        <a href="/pricing" class="inline-block text-sm">
                          <svg
                            class="size-4 inline-block"
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

                          <span
                            class="ml-1 font-semibold text-muted dark:text-gray-300 group-hover:text-white"
                          >
                            Upgrade
                          </span>
                        </a>

                        <a
                          href={`/stocks/${item?.ticker}`}
                          class="inline-block badge bg-blue-50 dark:bg-primary duration-0 rounded-sm ml-1 px-2 m-auto text-blue-600 dark:text-blue-400 dark:sm:hover:text-white sm:hover:text-muted"
                          >{item?.ticker}</a
                        >
                      </li>
                    {:else}
                      <li
                        class="text-sm sm:text-[1rem]"
                        style="margin-left: 8px; margin-bottom: 15px; list-style-type: disc;"
                      >
                        {item?.text}

                        <a
                          href={`/stocks/${item?.ticker}`}
                          class="inline-block badge duration-0 bg-blue-50 dark:bg-primary font-semibold dark:font-normal rounded-sm ml-1 px-2 m-auto text-blue-600 dark:text-blue-400 dark:sm:hover:text-white sm:hover:text-muted"
                          >{item?.ticker}</a
                        >
                      </li>
                    {/if}
                  {/each}
                </ul>
              {:else}
                <Infobox
                  text="There are no major stock market news available yet."
                />
              {/if}
            </Card.Content>
          </Card.Root>

          <Card.Root
            class="order-3 sm:order-1 overflow-x-auto overflow-hidden overflow-y-auto no-scrollbar sm:max-h-[470px]"
          >
            <Card.Header class="flex flex-row items-center">
              <div class="flex flex-col items-start w-full">
                <div
                  class="whitespace-nowrap flex flex-row w-full items-center"
                >
                  <Card.Title
                    class="text-xl sm:text-2xl text-muted dark:text-white font-semibold"
                    >Analyst Insight Report
                  </Card.Title>
                  {#if analystReport?.date}
                    <label class="hidden sm:inline-block text-sm italic ml-auto"
                      >Updated {analystReport?.date}</label
                    >
                  {/if}
                </div>
                {#if analystReport?.date}
                  <label class="sm:hidden text-xs italic mt-2"
                    >Updated {analystReport?.date}</label
                  >
                {/if}
              </div>
            </Card.Header>
            <Card.Content>
              {#if Object?.keys(analystReport)?.length > 0}
                {analystReport?.insight}

                <div class="text-muted dark:text-white mt-4">
                  According to {analystReport?.numOfAnalyst} analyst ratings, the
                  average rating for
                  <a
                    href={`/stocks/${analystReport?.symbol}`}
                    class="text-blue-600 dark:text-blue-400 dark:sm:hover:text-white sm:hover:text-muted cursor-pointer"
                    >{analystReport?.symbol}</a
                  >
                  stock is "{analystReport?.consensusRating}" The 12-month stock
                  price forecast is ${analystReport?.highPriceTarget}, which is
                  an {analystReport?.highPriceChange > 0
                    ? "increase"
                    : "decrease"} of {analystReport?.highPriceChange}% from the
                  latest price.
                </div>
                <table class="w-full text-right xs:text-sm sm: mt-5">
                  <thead
                    ><tr
                      class="border-b border-gray-600 font-normal text-sm sm:text-[1rem]"
                      ><th class="py-[3px] text-left font-semibold lg:py-0.5"
                        >Target</th
                      > <th class="font-semibold">Low</th>
                      <th class="font-semibold">Average</th>
                      <th class="font-semibold">Median</th>
                      <th class="font-semibold">High</th></tr
                    ></thead
                  >
                  <tbody
                    ><tr
                      class="border-b border-gray-600 font-normal text-sm sm:text-[1rem]"
                      ><td class="py-[3px] text-left lg:py-0.5">Price</td>
                      <td>${analystReport?.lowPriceTarget}</td>
                      <td>${analystReport?.avgPriceTarget}</td>
                      <td>${analystReport?.medianPriceTarget}</td>
                      <td>${analystReport?.highPriceTarget}</td></tr
                    >
                    <tr class="text-sm sm:text-[1rem]"
                      ><td class="py-[3px] text-left lg:py-0.5">Change</td>
                      <td
                        class={analystReport?.lowPriceChange > 0
                          ? "before:content-['+'] text-[#208646] dark:text-[#00FC50]"
                          : "text-[#DC2626] dark:text-[#FF2F1F]"}
                        >{analystReport?.lowPriceChange}%</td
                      >
                      <td
                        class={analystReport?.avgPriceChange > 0
                          ? "before:content-['+'] text-[#208646] dark:text-[#00FC50]"
                          : "text-[#DC2626] dark:text-[#FF2F1F]"}
                        >{analystReport?.avgPriceChange}%</td
                      >
                      <td
                        class={analystReport?.medianPriceChange > 0
                          ? "before:content-['+'] text-[#208646] dark:text-[#00FC50]"
                          : "text-[#DC2626] dark:text-[#FF2F1F]"}
                        >{analystReport?.medianPriceChange}%</td
                      >
                      <td
                        class={analystReport?.highPriceChange > 0
                          ? "before:content-['+'] text-[#208646] dark:text-[#00FC50]"
                          : "text-[#DC2626] dark:text-[#FF2F1F]"}
                        >{analystReport?.highPriceChange}%</td
                      ></tr
                    ></tbody
                  >
                </table>
              {:else}
                <Infobox
                  text="Currently, there are no new analyst reports available."
                />
              {/if}
            </Card.Content>
          </Card.Root>

          <Card.Root
            class="order-1 sm:order-2 overflow-x-auto overflow-hidden overflow-y-auto no-scrollbar sm:max-h-[550px]"
          >
            <Card.Header class="flex flex-row items-center">
              <div class="flex flex-col items-start w-full">
                <div class="flex flex-row w-full items-center">
                  <Card.Title
                    class="text-xl sm:text-2xl text-muted dark:text-white font-semibold"
                    >Upcoming Earnings</Card.Title
                  >
                  <a
                    href="/earnings-calendar"
                    class="ml-auto rounded-md text-xs sm:text-sm px-2 sm:px-3 py-2 font-semibold bg-blue-100 dark:bg-[#fff] text-black"
                  >
                    View All
                    <ArrowUpRight
                      class="hidden sm:inline-block h-4 w-4 shrink-0 -mt-1 ml-0.5"
                    />
                  </a>
                </div>
              </div>
            </Card.Header>
            <Card.Content>
              {#if data?.getDashboard?.upcomingEarnings?.length !== 0}
                <ul style="padding-left: 5px;">
                  {#each data?.getDashboard?.upcomingEarnings as item, index}
                    {#if index >= 3 && !["Pro", "Plus"]?.includes(data?.user?.tier)}
                      <li
                        class="text-sm sm:text-[1rem]"
                        style=" margin-left: 8px;  margin-bottom: 30px; list-style-type: disc;"
                      >
                        <strong>{item?.name}</strong> (<a
                          href={`/stocks/${item?.symbol}`}
                          class="text-blue-600 dark:text-blue-400 dark:sm:hover:text-white sm:hover:text-muted cursor-pointer"
                          >{item?.symbol}</a
                        >)
                        {item?.isToday === true
                          ? "will report today"
                          : [
                                "Monday",
                                "Tuesday",
                                "Wednesday",
                                "Thursday",
                              ].includes(
                                new Date().toLocaleDateString("en-US", {
                                  weekday: "long",
                                }),
                              )
                            ? "will report tomorrow"
                            : "will report monday"}
                        {#if item?.time}
                          {#if compareTimes(item?.time, "16:00") >= 0}
                            after market closes.
                          {:else if compareTimes(item?.time, "09:30") <= 0}
                            before market opens.
                          {:else}
                            during market.
                          {/if}
                        {/if}Analysts estimate ...
                        <a
                          href="/pricing"
                          class="inline-block text-sm sm:hover:text-blue-400"
                        >
                          <svg
                            class="size-4 inline-block"
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

                          <span class="ml-1 font-semibold currentColor">
                            Upgrade
                          </span>
                        </a>
                      </li>
                    {:else}
                      <li
                        class="text-sm sm:text-[1rem]"
                        style=" margin-left: 8px;  margin-bottom: 30px; list-style-type: disc;"
                      >
                        <strong>{item?.name}</strong> (<a
                          href={`/stocks/${item?.symbol}`}
                          class="text-blue-600 dark:text-blue-400 dark:sm:hover:text-white sm:hover:text-muted cursor-pointer"
                          >{item?.symbol}</a
                        >)
                        {item?.isToday === true
                          ? "will report today"
                          : [
                                "Monday",
                                "Tuesday",
                                "Wednesday",
                                "Thursday",
                              ].includes(
                                new Date().toLocaleDateString("en-US", {
                                  weekday: "long",
                                }),
                              )
                            ? "will report tomorrow"
                            : "will report monday"}
                        {#if item?.time}
                          {#if compareTimes(item?.time, "16:00") >= 0}
                            after market closes.
                          {:else if compareTimes(item?.time, "09:30") <= 0}
                            before market opens.
                          {:else}
                            during market.
                          {/if}
                        {/if}Analysts estimate {abbreviateNumber(
                          item?.revenueEst,
                        )} in revenue ({(
                          (item?.revenueEst / item?.revenuePrior - 1) *
                          100
                        )?.toFixed(2)}% YoY) and {item?.epsEst} in earnings per share
                        {#if item?.epsPrior !== 0}
                          ({(
                            (item?.epsEst / item?.epsPrior - 1) *
                            100
                          )?.toFixed(2)}% YoY).
                        {/if}
                      </li>
                    {/if}
                  {/each}
                </ul>
              {:else}
                <Infobox
                  text="There are no major upcoming earnings to report today but you can check the earnings calendar for a complete list."
                />
              {/if}
            </Card.Content>
          </Card.Root>

          <Card.Root
            class="order-2 sm:order-3 overflow-x-auto overflow-hidden overflow-y-auto no-scrollbar sm:max-h-[550px]"
          >
            <Card.Header class="flex flex-row items-center">
              <div class="flex flex-col items-start w-full">
                <div class="flex flex-row w-full items-center">
                  <Card.Title
                    class="text-xl sm:text-2xl text-muted dark:text-white font-semibold"
                    >Recent Earnings <span
                      class="text-sm text-gray-700 dark:text-gray-300"
                      >(EST Time)</span
                    ></Card.Title
                  >
                </div>
              </div>
            </Card.Header>
            <Card.Content>
              {#if data?.getDashboard?.recentEarnings?.length !== 0}
                <ul style="padding-left: 5px;">
                  {#each data?.getDashboard?.recentEarnings as item}
                    <strong>{item?.name}</strong> (<a
                      href={`/stocks/${item?.symbol}`}
                      class="text-blue-600 dark:text-blue-400 dark:sm:hover:text-white sm:hover:text-muted cursor-pointer"
                      >{item?.symbol}</a
                    >) has released its quarterly earnings at {formatTime(
                      item?.time,
                    )}:

                    <li
                      class="text-sm sm:text-[1rem] text-muted dark:text-white"
                      style="margin-top:10px; margin-left: 30px; margin-bottom: 10px; list-style-type: disc;"
                    >
                      Revenue of {abbreviateNumber(item?.revenue)}
                      {item?.revenueSurprise > 0 ? "exceeds" : "misses"} estimates
                      by {abbreviateNumber(Math.abs(item?.revenueSurprise))},
                      with {(
                        (item?.revenue / item?.revenuePrior - 1) *
                        100
                      )?.toFixed(2)}% YoY {item?.revenue / item?.revenuePrior -
                        1 <
                      0
                        ? "decline"
                        : "growth"}.
                    </li>
                    <li
                      class="text-muted dark:text-white"
                      style="line-height: 22px; margin-top:0px; margin-left: 30px; margin-bottom: 30px; list-style-type: disc;"
                    >
                      EPS of {item?.eps}
                      {item?.epsSurprise > 0 ? "exceeds" : "misses"} estimates by
                      {item?.epsSurprise?.toFixed(2)}
                      {#if item?.epsPrior}
                        with {(
                          ((item?.eps - item?.epsPrior) /
                            Math.abs(item?.epsPrior)) *
                          100
                        )?.toFixed(2)}% YoY {(item?.eps - item?.epsPrior) /
                          Math.abs(item?.epsPrior) <
                        0
                          ? "decline"
                          : "growth"}.
                      {/if}
                    </li>
                  {/each}
                </ul>
              {:else}
                <Infobox
                  text="There are no major recent earnings to report today but you can check the earnings calendar for a complete list."
                />
              {/if}
            </Card.Content>
          </Card.Root>
        </div>
      </main>
    </div>
  </div>
</div>

<style>
  .scrollbar {
    display: grid;
    grid-gap: 90px;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    grid-auto-flow: column;
    overflow-x: auto;
    scrollbar-width: thin; /* Hide the default scrollbar in Firefox */
    scrollbar-color: transparent transparent; /* Hide the default scrollbar in Firefox */
  }

  /* Custom scrollbar for Webkit (Chrome, Safari) */
  .scrollbar::-webkit-scrollbar {
    width: 0; /* Hide the width of the scrollbar */
    height: 0; /* Hide the height of the scrollbar */
  }

  .scrollbar::-webkit-scrollbar-thumb {
    background: transparent; /* Make the thumb transparent */
  }

  .stroke-text {
    font-size: 56px; /* Adjust the font size as needed */
    font-weight: bold; /* Adjust the font weight as needed */
    color: transparent; /* Make the text transparent */
    -webkit-text-stroke: 1px #cbd5e1; /* Add a black stroke outline with a thickness of 2px */
  }
</style>
