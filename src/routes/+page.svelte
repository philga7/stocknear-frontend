<script lang="ts">
  import { onMount } from "svelte";

  import * as Card from "$lib/components/shadcn/card/index.ts";
  import * as Table from "$lib/components/shadcn/table/index.ts";
  import ArrowUpRight from "lucide-svelte/icons/arrow-up-right";
  import { abbreviateNumber } from "$lib/utils";
  import HoverStockChart from "$lib/components/HoverStockChart.svelte";
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
  image=""
/>

<div
  class="w-full sm:max-w-[1400px] overflow-hidden m-auto min-h-screen bg-default mb-40"
>
  {#if AppInstalled && !$closedPWA}
    <svelte:component this={AppInstalled} />
  {/if}

  <!--
  {#if data?.user?.tier !== "Pro" || data?.user?.freeTrial === true}
    <div
      class="mb-5 relative isolate sm:rounded text-center flex justify-center items-center gap-x-6 overflow-hidden bg-[#FFC233] px-6 py-3.5 sm:py-2.5 sm:px-3.5 sm:before:flex-1"
    >
      <div
        class="absolute left-[max(-7rem,calc(50%-52rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl"
        aria-hidden="true"
      >
        <div
          class="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-[#ff80b5] to-[#9089fc] opacity-30"
          style="clip-path: polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)"
        ></div>
      </div>
      <div
        class="absolute left-[max(45rem,calc(50%+8rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl"
        aria-hidden="true"
      >
        <div
          class="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-[#ff80b5] to-[#9089fc] opacity-30"
          style="clip-path: polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)"
        ></div>
      </div>
      <div
        class="w-full m-auto flex flex-col sm:flex-row justify-center items-center gap-x-4 gap-y-2"
      >
        <p
          class="text-md text-black font-semibold flex flex-col sm:flex-row items-center"
        >
         <span class="text-black font-bold">Last Chance</span><svg
            viewBox="0 0 2 2"
            class="mx-2 inline h-0.5 w-0.5 fill-current hidden sm:inline-block"
            aria-hidden="true"><circle cx="1" cy="1" r="1" /></svg
          >
          The Lifetime Deal officially ends permanently this Friday at 12:00 AM (CET).
        </p>

        <a
          href="/pricing"
          class="flex-none rounded-full m-auto sm:m-0 px-3.5 py-1 text-[1rem] font-semibold text-black shadow-sm sm:hover:bg-gray-100 bg-[#fff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
        >
          Get Lifetime
        </a>
      </div>
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
          <a href="/potus-tracker"
            ><div
              class="flex items-center justify-center sm:hover:text-white text-blue-400"
            >
              <div class="text-lg sm:text-xl font-semibold">POTUS Tracker</div>
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
        class="hidden sm:block text-3xl lg:text-4xl text-white font-bold text-center mb-10 relative w-fit flex justify-center m-auto"
      >
        Clear & <span class="italic text-[#fff]">Simple</span> Market Insight.
      </h1>

      <h2
        class="text-white text-2xl font-semibold text-start w-full pb-4 sm:pl-4 sm:pb-2"
      >
        Dashboard
      </h2>

      <main class="flex flex-1 flex-col gap-4 sm:p-4 md:gap-8">
        <div class="grid gap-4 md:gap-8 grid-cols-1 lg:grid-cols-2 text-start">
          <Card.Root
            class="order-1 sm:order-2 overflow-x-scroll overflow-hidden overflow-y-auto no-scrollbar max-h-[450px]"
          >
            <Card.Header class="flex flex-row items-center">
              <div class="flex flex-col items-start w-full">
                <div class="flex flex-row w-full items-center">
                  <Card.Title
                    ><a
                      href={`/market-mover/${marketStatus === 0 ? "gainers" : marketStatus === 1 ? "premarket/gainers" : "afterhours/gainers"}`}
                      class="text-xl sm:text-2xl tex-white font-semibold cursor-pointer sm:hover:underline sm:hover:underline-offset-4"
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
                <Table.Root class="overflow-x-scroll w-full">
                  <Table.Header>
                    <Table.Row>
                      <Table.Head class="text-white font-semibold"
                        >Symbol</Table.Head
                      >
                      <Table.Head
                        class="hidden sm:table-cell text-white font-semibold"
                        >Name</Table.Head
                      >
                      <Table.Head class="text-white text-right font-semibold"
                        >Price</Table.Head
                      >
                      <Table.Head class="text-white text-right font-semibold"
                        >Change</Table.Head
                      >
                      <Table.Head
                        class="text-white text-right font-semibold whitespace-nowrap"
                        >Market Cap</Table.Head
                      >
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {#each gainersList as item}
                      <Table.Row>
                        <Table.Cell class="text-sm sm:text-[1rem]">
                          <HoverStockChart symbol={item?.symbol} />
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
                            <span class="text-[#00FC50]"
                              >+{item?.changesPercentage >= 1000
                                ? abbreviateNumber(item?.changesPercentage)
                                : item?.changesPercentage?.toFixed(2)}%</span
                            >
                          {:else}
                            <span class="text-[#FF2F1F]"
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
            class="order-1 sm:order-2 overflow-x-scroll overflow-hidden overflow-y-auto no-scrollbar max-h-[450px]"
          >
            <Card.Header class="flex flex-row items-center">
              <div class="flex flex-col items-start w-full">
                <div class="flex flex-row w-full items-center">
                  <Card.Title>
                    <a
                      href={`/market-mover/${marketStatus === 0 ? "losers" : marketStatus === 1 ? "premarket/losers" : "afterhours/losers"}`}
                      class="text-xl sm:text-2xl tex-white font-semibold cursor-pointer sm:hover:underline sm:hover:underline-offset-4"
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
                <Table.Root class="overflow-x-scroll w-full">
                  <Table.Header>
                    <Table.Row>
                      <Table.Head class="text-white font-semibold"
                        >Symbol</Table.Head
                      >
                      <Table.Head
                        class="hidden sm:table-cell text-white font-semibold"
                        >Name</Table.Head
                      >
                      <Table.Head class="text-white text-right font-semibold"
                        >Price</Table.Head
                      >
                      <Table.Head class="text-white text-right font-semibold"
                        >Change</Table.Head
                      >
                      <Table.Head
                        class="text-white text-right font-semibold whitespace-nowrap"
                        >Market Cap</Table.Head
                      >
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {#each losersList as item}
                      <Table.Row>
                        <Table.Cell class="text-sm sm:text-[1rem]">
                          <HoverStockChart symbol={item?.symbol} />
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
                            <span class="text-[#00FC50]"
                              >+{item?.changesPercentage >= 1000
                                ? abbreviateNumber(item?.changesPercentage)
                                : item?.changesPercentage?.toFixed(2)}%</span
                            >
                          {:else}
                            <span class="text-[#FF2F1F]"
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
            class="order-1 overflow-x-scroll overflow-hidden overflow-y-auto no-scrollbar sm:max-h-[470px]"
          >
            <Card.Header class="flex flex-row items-center">
              <div class="flex flex-col items-start w-full">
                <div class="flex flex-row w-full items-center">
                  <Card.Title
                    class="text-xl sm:text-2xl tex-white font-semibold"
                    >Stock & Market News</Card.Title
                  >
                </div>
              </div>
            </Card.Header>
            <Card.Content>
              {#if recentWIIM?.length !== 0}
                <ul style="padding-left: 5px;">
                  {#each recentWIIM as item, index}
                    {#if index >= 3 && data?.user?.tier !== "Pro"}
                      <li
                        class="text-sm sm:text-[1rem]"
                        style="margin-left: 8px; margin-bottom: 15px; list-style-type: disc;"
                      >
                        {item?.text?.slice(0, 48) + "..."}
                        <a href="/pricing" class="inline-block text-sm">
                          <svg
                            class="size-5 text-[#fff] inline-block"
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
                            class="ml-1 font-semibold text-gray-300 group-hover:text-white"
                          >
                            Upgrade
                          </span>
                        </a>

                        <a
                          href={`/stocks/${item?.ticker}`}
                          class="inline-block badge rounded-sm ml-1 px-2 m-auto text-blue-400 sm:hover:text-white"
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
                          class="inline-block badge rounded-sm ml-1 px-2 m-auto text-blue-400 sm:hover:text-white"
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

          <!--
          <Card.Root class="overflow-x-scroll overflow-hidden overflow-y-auto">
            <Card.Header class="flex flex-row items-center">
              <div class="flex flex-col items-start w-full">
                <div class="flex flex-row w-full items-center">
                  <Card.Title
                    class="text-xl sm:text-2xl tex-white font-semibold"
                    >Hottest Options Activity</Card.Title
                  >
                  <a
                    href={optionsMode === "openInterest"
                      ? "/list/highest-open-interest-change"
                      : optionsMode === "ivRank"
                        ? "/list/highest-option-iv-rank"
                        : "/list/highest-option-premium"}
                    class="ml-auto rounded-md text-xs sm:text-sm px-2 sm:px-3 py-2 font-semibold bg-[#fff] text-black"
                  >
                    View All
                    <ArrowUpRight
                      class="hidden sm:inline-block h-4 w-4 shrink-0 -mt-1 ml-0.5"
                    />
                  </a>
                </div>
                <Card.Description class="mt-2 text-sm sm:text-[1rem]"
                  >Recent unusual options with the highest ...</Card.Description
                >
                <Tabs.Root value="openInterest" class="w-full sm:w-fit mt-5 ">
                  <Tabs.List class="grid w-full grid-cols-3 bg-secondary">
                    <Tabs.Trigger
                      on:click={() => changeTable("openInterest")}
                      value="openInterest"
                      class="text-sm">OI Change</Tabs.Trigger
                    >
                    <Tabs.Trigger
                      on:click={() => changeTable("premium")}
                      value="premium"
                      class="text-sm">Premium</Tabs.Trigger
                    >
                    <Tabs.Trigger
                      on:click={() => changeTable("ivRank")}
                      value="ivRank"
                      class="text-sm">IV Rank</Tabs.Trigger
                    >
                  </Tabs.List>
                </Tabs.Root>
              </div>
            </Card.Header>
            <Card.Content>
              <Table.Root class="overflow-x-scroll w-full">
                <Table.Header>
                  <Table.Row>
                    <Table.Head class="text-white font-semibold"
                      >Symbol</Table.Head
                    >
                    <Table.Head class="text-white text-right font-semibold"
                      >Total OI</Table.Head
                    >

                    <Table.Head class="text-white text-right font-semibold"
                      >Change OI</Table.Head
                    >
                    <Table.Head class="text-white text-right font-semibold"
                      >Total Prem</Table.Head
                    >
                    <Table.Head class="text-white text-right font-semibold"
                      >IV Rank</Table.Head
                    >
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {#each optionsTable as item}
                    <Table.Row>
                      <Table.Cell class="text-sm sm:text-[1rem]">
                        <HoverStockChart symbol={item?.symbol} />
                      </Table.Cell>
                      <Table.Cell
                        class="text-right xl:table.-column text-sm sm:text-[1rem] "
                      >
                        {abbreviateNumber(item?.totalOI)}
                      </Table.Cell>
                      <Table.Cell
                        class="text-right xl:table.-column text-sm sm:text-[1rem]"
                      >
                        {#if item?.changeOI >= 0}
                          <span class="text-[#00FC50]"
                            >+{item?.changeOI?.toLocaleString("en-US")}</span
                          >
                        {:else if item?.changeOI < 0}
                          <span class="text-[#FF2F1F]"
                            >{item?.changeOI?.toLocaleString("en-US")}</span
                          >
                        {/if}
                      </Table.Cell>
                      <Table.Cell
                        class="text-right md:table.-cell xl:table.-column text-sm sm:text-[1rem] text-white"
                      >
                        {abbreviateNumber(item?.totalPrem)}
                      </Table.Cell>
                      <Table.Cell
                        class="text-right md:table.-cell xl:table.-column text-sm sm:text-[1rem] text-white"
                      >
                        {abbreviateNumber(item?.ivRank)}
                      </Table.Cell>
                    </Table.Row>
                  {/each}
                </Table.Body>
              </Table.Root>
            </Card.Content>
          </Card.Root>
          -->

          <Card.Root
            class="order-3 sm:order-1 overflow-x-scroll overflow-hidden overflow-y-auto no-scrollbar sm:max-h-[470px]"
          >
            <Card.Header class="flex flex-row items-center">
              <div class="flex flex-col items-start w-full">
                <div
                  class="whitespace-nowrap flex flex-row w-full items-center"
                >
                  <Card.Title
                    class="text-xl sm:text-2xl tex-white font-semibold"
                    >AI Analyst report
                  </Card.Title>
                  {#if analystReport?.date}
                    <label
                      class="hidden sm:inline-block text-white text-sm italic ml-auto"
                      >Updated {analystReport?.date}</label
                    >
                  {/if}
                </div>
                {#if analystReport?.date}
                  <label class="sm:hidden text-white text-xs italic mt-2"
                    >Updated {analystReport?.date}</label
                  >
                {/if}
              </div>
            </Card.Header>
            <Card.Content>
              {#if Object?.keys(analystReport)?.length > 0}
                {analystReport?.insight}

                <div class="text-white mt-4">
                  According to {analystReport?.numOfAnalyst} analyst ratings, the
                  average rating for <HoverStockChart
                    symbol={analystReport?.symbol}
                  />
                  stock is "{analystReport?.consensusRating}" The 12-month stock
                  price forecast is ${analystReport?.highPriceTarget}, which is
                  an {analystReport?.highPriceChange > 0
                    ? "increase"
                    : "decreas"} of {analystReport?.highPriceChange}% from the
                  latest price.
                </div>
                <table
                  class="w-full text-right text-tiny text-white xs:text-sm sm:text-base mt-5"
                >
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
                          ? "before:content-['+'] text-[#00FC50]"
                          : "text-[#FF2F1F]"}
                        >{analystReport?.lowPriceChange}%</td
                      >
                      <td
                        class={analystReport?.avgPriceChange > 0
                          ? "before:content-['+'] text-[#00FC50]"
                          : "text-[#FF2F1F]"}
                        >{analystReport?.avgPriceChange}%</td
                      >
                      <td
                        class={analystReport?.medianPriceChange > 0
                          ? "before:content-['+'] text-[#00FC50]"
                          : "text-[#FF2F1F]"}
                        >{analystReport?.medianPriceChange}%</td
                      >
                      <td
                        class={analystReport?.highPriceChange > 0
                          ? "before:content-['+'] text-[#00FC50]"
                          : "text-[#FF2F1F]"}
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
            class="order-1 sm:order-2 overflow-x-scroll overflow-hidden overflow-y-auto no-scrollbar sm:max-h-[550px]"
          >
            <Card.Header class="flex flex-row items-center">
              <div class="flex flex-col items-start w-full">
                <div class="flex flex-row w-full items-center">
                  <Card.Title
                    class="text-xl sm:text-2xl tex-white font-semibold"
                    >Upcoming Earnings</Card.Title
                  >
                  <a
                    href="/earnings-calendar"
                    class="ml-auto rounded-md text-xs sm:text-sm px-2 sm:px-3 py-2 font-semibold bg-[#fff] text-black"
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
                    {#if index >= 3 && data?.user?.tier !== "Pro"}
                      <li
                        class="text-sm sm:text-[1rem]"
                        style=" margin-left: 8px;  margin-bottom: 30px; list-style-type: disc;"
                      >
                        <strong>{item?.name}</strong> (<HoverStockChart
                          symbol={item?.symbol}
                        />)
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
                        <a href="/pricing" class="inline-block text-sm">
                          <svg
                            class="size-5 text-[#fff] inline-block"
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
                            class="ml-1 font-semibold text-gray-300 group-hover:text-white"
                          >
                            Upgrade
                          </span>
                        </a>
                      </li>
                    {:else}
                      <li
                        class="text-sm sm:text-[1rem]"
                        style=" margin-left: 8px;  margin-bottom: 30px; list-style-type: disc;"
                      >
                        <strong>{item?.name}</strong> (<HoverStockChart
                          symbol={item?.symbol}
                        />)
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
            class="order-2 sm:order-3 overflow-x-scroll overflow-hidden overflow-y-auto no-scrollbar sm:max-h-[550px]"
          >
            <Card.Header class="flex flex-row items-center">
              <div class="flex flex-col items-start w-full">
                <div class="flex flex-row w-full items-center">
                  <Card.Title
                    class="text-xl sm:text-2xl tex-white font-semibold"
                    >Recent Earnings <span class="text-sm text-gray-300"
                      >(NYSE Time)</span
                    ></Card.Title
                  >
                </div>
              </div>
            </Card.Header>
            <Card.Content>
              {#if data?.getDashboard?.recentEarnings?.length !== 0}
                <ul style="padding-left: 5px;">
                  {#each data?.getDashboard?.recentEarnings as item}
                    <strong>{item?.name}</strong> (<HoverStockChart
                      symbol={item?.symbol}
                    />) has released its quarterly earnings at {formatTime(
                      item?.time,
                    )}:

                    <li
                      class="text-sm sm:text-[1rem]"
                      style="color: #fff;  margin-top:10px; margin-left: 30px; margin-bottom: 10px; list-style-type: disc;"
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
                      style="color: #fff; line-height: 22px; margin-top:0px; margin-left: 30px; margin-bottom: 30px; list-style-type: disc;"
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
