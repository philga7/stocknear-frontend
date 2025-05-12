<script lang="ts">
  import { onMount } from "svelte";

  import { screenWidth } from "$lib/store";
  import { isPWAInstalled } from "$lib/utils";
  import Infobox from "$lib/components/Infobox.svelte";
  import { closedPWA } from "$lib/store";
  import SEO from "$lib/components/SEO.svelte";
  import Gainers from "$lib/components/Dashboard/Gainers.svelte";
  import Losers from "$lib/components/Dashboard/Losers.svelte";
  import WIIM from "$lib/components/Dashboard/Wiim.svelte";
  import UpcomingEarnings from "$lib/components/Dashboard/UpcomingEarnings.svelte";
  import RecentEarnings from "$lib/components/Dashboard/RecentEarnings.svelte";
  import AnalystReport from "$lib/components/Dashboard/AnalystReport.svelte";
  import OptionsFlow from "$lib/components/Dashboard/OptionsFlow.svelte";
  import DarkPool from "$lib/components/Dashboard/DarkPool.svelte";
  import EconomicCalendar from "$lib/components/Dashboard/EconomicCalendar.svelte";

  export let data;

  let gainersList = data?.getDashboard?.gainers || [];
  let losersList = data?.getDashboard?.losers || [];
  let marketStatus = data?.getDashboard?.marketStatus ?? 0;
  let analystReport = data?.getDashboard?.analystReport || {};
  let wiim = data?.getDashboard?.wiim || [];
  let optionsFlowList = data?.getDashboard?.optionsFlow || [];
  let darkPoolList = data?.getDashboard?.darkPool || [];
  let economicCalendarList = data?.getDashboard?.economicCalendar || [];

  let customSettings = data?.getCustomSettings;
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

  $: charNumber = $screenWidth < 640 ? 20 : 30;
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

  {#if !["Pro", "Plus"]?.includes(data?.user?.tier)}
    <div class="flex justify-center mb-5 whitespace-nowrap mt-5 sm:mt-0">
      <a
        href="/pricing"
        class="cursor-pointer whitespace-nowrap flex flex-col sm:flex-row items-center gap-2 px-3.5 py-2.5 text-sm sm:text-[1rem] font-medium border border-gray-300 dark:border-gray-800 shadow rounded-md"
        tabindex="0"
      >
        <div>
          <svg
            class="w-5 h-5 text-zinc-500 dark:text-orange-200 inline-block"
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
          <strong class="text-pink-500"> Offer Ends Today!</strong>
        </div>
        <div>Get <strong> 50% OFF</strong> on your Subscription!</div>
      </a>
    </div>
  {/if}
  -->

  <div class="flex flex-col m-auto justify-center items-center">
    <div class="text-center mb-10 w-full px-4 sm:px-3 mt-10">
      {#if data?.user}
        {#await import("$lib/components/Feedback.svelte") then { default: Comp }}
          <svelte:component this={Comp} {data} />
        {/await}
      {/if}

      <div
        class="text-center mb-5 sm:mb-10 relative w-fit flex justify-center m-auto text-white"
      >
        <div class="mb-4 flex justify-center -mt-3 lg:mb-3">
          <a href="/customize"
            ><div
              class="flex items-center justify-center sm:hover:text-muted dark:sm:hover:text-white text-blue-700 dark:text-blue-400"
            >
              <div class="text-lg sm:text-xl font-semibold">
                Custom Dashboard
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
        class="block text-2xl lg:text-4xl text-muted dark:text-white font-bold text-center mb-10 relative w-fit flex justify-center m-auto"
      >
        Real-Time Market Insights
      </h1>

      <main class="flex flex-1 flex-col gap-4 sm:p-4 md:gap-8 text-start">
        <div class="columns-1 lg:columns-2 gap-4 md:gap-8">
          {#if customSettings?.length > 0}
            {#each customSettings as item}
              <div class="break-inside-avoid mb-4">
                {#if item === "gainers"}
                  <Gainers {gainersList} {marketStatus} {charNumber} />
                {:else if item === "losers"}
                  <Losers {losersList} {marketStatus} {charNumber} />
                {:else if item === "wiim"}
                  <WIIM dataList={wiim} />
                {:else if item === "analystReport"}
                  <AnalystReport {analystReport} />
                {:else if item === "upcomingEarnings"}
                  <UpcomingEarnings
                    upcomingEarnings={data?.getDashboard?.upcomingEarnings}
                  />
                {:else if item === "recentEarnings"}
                  <RecentEarnings
                    recentEarnings={data?.getDashboard?.recentEarnings}
                  />
                {:else if item === "optionsFlow"}
                  <OptionsFlow {optionsFlowList} />
                {:else if item === "darkpool"}
                  <DarkPool {darkPoolList} />
                {:else if item === "economicCalendar"}
                  <EconomicCalendar dataList={economicCalendarList} />
                {/if}
              </div>
            {/each}
          {:else}
            <Infobox text="All widgets have been removed by you" />
          {/if}
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
