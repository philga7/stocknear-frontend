<script lang="ts">
  import { onMount } from "svelte";

  import { screenWidth } from "$lib/store";
  import { isPWAInstalled } from "$lib/utils";
  import { closedPWA } from "$lib/store";
  import SEO from "$lib/components/SEO.svelte";
  import MarketMover from "$lib/components/Dashboard/MarketMover.svelte";
  import UpcomingEarnings from "$lib/components/Dashboard/UpcomingEarnings.svelte";
  import OptionsFlow from "$lib/components/Dashboard/OptionsFlow.svelte";
  import Wiim from "$lib/components/Dashboard/Wiim.svelte";
  import AIAgent from "$lib/components/Dashboard/AIAgent.svelte";

  export let data;
  export let form;

  let gainersList = data?.getDashboard?.gainers || [];
  let losersList = data?.getDashboard?.losers || [];
  let marketStatus = data?.getDashboard?.marketStatus ?? 0;

  let wiim = data?.getDashboard?.wiim || [];
  let optionsFlowList = data?.getDashboard?.optionsFlow || [];
  let upcomingEarnings = data?.getDashboard?.upcomingEarnings || [];
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

<div class="w-full max-w-8xl overflow-hidden m-auto min-h-screen mb-16">
  {#if AppInstalled && !$closedPWA}
    <svelte:component this={AppInstalled} />
  {/if}
  <!--
  {#if !["Pro", "Plus"]?.includes(data?.user?.tier)}
    <div class="flex justify-center mb-5 whitespace-nowrap mt-5 sm:mt-0">
      <a
        href="/pricing"
        class="cursor-pointer whitespace-nowrap flex flex-col sm:flex-row items-center gap-2 px-3.5 py-2.5 text-sm sm:text-[1rem] font-medium border border-gray-300 dark:border-gray-800 shadow rounded"
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
          <strong class="text-pink-500 text-[1rem]"> Summer Sale:</strong>
        </div>
        <div>Get <strong> 50% OFF</strong> on your Subscription!</div>
      </a>
    </div>
  {/if}
-->
  <!--
  {#if !["Pro", "Plus"]?.includes(data?.user?.tier)}
    <div class="flex justify-center mb-5 whitespace-nowrap mt-5 sm:mt-0">
      <div class="mb-4 flex justify-center mt-2 lg:mb-3">
        <a href="/pricing"
          ><div
            class="flex items-center justify-center sm:hover:text-muted dark:sm:hover:text-white text-blue-700 dark:text-blue-400"
          >
            <div class="text-lg sm:text-xl font-semibold">Lifetime Access</div>
            <div
              class="-mt-2 ml-1 -rotate-6 rounded-[3px] bg-red-500 px-1 py-0.5 text-xs font-semibold text-white"
            >
              New
            </div>
          </div></a
        >
      </div>
    </div>
  {/if}
  -->

  <main id="main">
    <div
      class="border-b border-gray-100 dark:border-gray-800 rounded-[5px] px-4 bg-gray-100 dark:bg-[#1C1E22] pt-12 shadow-sm pb-26 landscape:border-t-2 landscape:md:border-t-0"
    >
      <div class="mx-auto max-w-[850px] text-center">
        <h1
          class="mb-3 text-2xl font-bold xs:text-3xl sm:mb-5 md:text-4xl lg:mb-7 lg:text-[42px]"
        >
          Research your Trading Ideas
        </h1>
        <p
          class="mb-4 text-base sm:text-lg md:mb-5 md:text-xl lg:mb-7 lg:text-[22px] lg:leading-8"
        >
          Accurate information on all US Stocks and funds. See stock prices,
          options data, dark pool orders, news, financials, forecasts, charts
          and more.
        </p>
        <div class="mx-auto max-w-[95%] md:max-w-[85%]">
          <AIAgent {data} {form} />
        </div>
      </div>
    </div>
    <div>
      <div class="mb-4 flex justify-center">
        <div
          class="-mt-8 grid max-w-[90%] grid-cols-2 gap-4 sm:grid-cols-3 md:-mt-10 lg:grid-cols-6 xl:-mt-12 xl:max-w-[80%] xl:gap-6"
        >
          <a
            href="/chat/"
            class="border border-gray-300 dark:border-gray-600 flex flex-col justify-center items-center p-4 bg-white dark:bg-secondary rounded-[5px] shadow font-semibold gap-2 hover:shadow-lg text-center dark:hover:shadow-dark-600 dark:hover:shadow-md"
          >
            <svg
              fill="currentColor"
              class="h-8 w-8"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              viewBox="0 0 512 512"
              xml:space="preserve"
              ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></g><g id="SVGRepo_iconCarrier">
                <g>
                  <path
                    d="M247.355,106.9C222.705,82.241,205.833,39.18,197.46,0c-8.386,39.188-25.24,82.258-49.899,106.917 c-24.65,24.642-67.724,41.514-106.896,49.904c39.188,8.373,82.254,25.235,106.904,49.895c24.65,24.65,41.522,67.72,49.908,106.9 c8.373-39.188,25.24-82.258,49.886-106.917c24.65-24.65,67.724-41.514,106.896-49.904 C315.08,148.422,272.014,131.551,247.355,106.9z"
                  ></path>
                  <path
                    d="M407.471,304.339c-14.714-14.721-24.81-40.46-29.812-63.864c-5.011,23.404-15.073,49.142-29.803,63.872 c-14.73,14.714-40.464,24.801-63.864,29.812c23.408,5.01,49.134,15.081,63.864,29.811c14.73,14.722,24.81,40.46,29.82,63.864 c5.001-23.413,15.081-49.142,29.802-63.872c14.722-14.722,40.46-24.802,63.856-29.82 C447.939,329.14,422.201,319.061,407.471,304.339z"
                  ></path>
                  <path
                    d="M146.352,354.702c-4.207,19.648-12.655,41.263-25.019,53.626c-12.362,12.354-33.968,20.82-53.613,25.027 c19.645,4.216,41.251,12.656,53.613,25.027c12.364,12.362,20.829,33.96,25.036,53.618c4.203-19.658,12.655-41.255,25.023-53.626 c12.354-12.362,33.964-20.82,53.605-25.035c-19.64-4.2-41.251-12.656-53.613-25.019 C159.024,395.966,150.555,374.351,146.352,354.702z"
                  ></path>
                </g>
              </g></svg
            >

            <div>AI Agent</div></a
          >

          <a
            href="/options-flow"
            class="border border-gray-300 dark:border-gray-600 flex flex-col justify-center items-center p-4 bg-white dark:bg-secondary rounded-[5px] shadow font-semibold gap-2 hover:shadow-lg text-center dark:hover:shadow-dark-600 dark:hover:shadow-md"
          >
            <svg
              fill="currentColor"
              class="h-8 w-8"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></g><g id="SVGRepo_iconCarrier">
                <path
                  d="M3 3C3 2.44772 3.44772 2 4 2H19C19.5523 2 20 2.44772 20 3C20 3.55228 19.5523 4 19 4H4C3.44772 4 3 3.55228 3 3Z"
                ></path>
                <path
                  d="M7 6C7 5.44772 7.44772 5 8 5H20C20.5523 5 21 5.44772 21 6C21 6.55228 20.5523 7 20 7H8C7.44772 7 7 6.55228 7 6Z"
                ></path>
                <path
                  d="M10 8C9.44772 8 9 8.44772 9 9C9 9.55228 9.44772 10 10 10H19C19.5523 10 20 9.55228 20 9C20 8.44772 19.5523 8 19 8H10Z"
                ></path>
                <path
                  d="M6 12C6 11.4477 6.44772 11 7 11H15C15.5523 11 16 11.4477 16 12C16 12.5523 15.5523 13 15 13H7C6.44772 13 6 12.5523 6 12Z"
                ></path>
                <path
                  d="M7 14C6.44772 14 6 14.4477 6 15C6 15.5523 6.44772 16 7 16H13C13.5523 16 14 15.5523 14 15C14 14.4477 13.5523 14 13 14H7Z"
                ></path>
                <path
                  d="M9 18C9 17.4477 9.44772 17 10 17H15C15.5523 17 16 17.4477 16 18C16 18.5523 15.5523 19 15 19H10C9.44772 19 9 18.5523 9 18Z"
                ></path>
                <path
                  d="M14 20C13.4477 20 13 20.4477 13 21C13 21.5523 13.4477 22 14 22H16C16.5523 22 17 21.5523 17 21C17 20.4477 16.5523 20 16 20H14Z"
                ></path>
              </g></svg
            >

            <div>Options Flow</div></a
          >
          <a
            href="/potus-tracker"
            class="border border-gray-300 dark:border-gray-600 flex flex-col justify-center items-center p-4 bg-white dark:bg-secondary rounded-[5px] shadow font-semibold gap-2 hover:shadow-lg text-center dark:hover:shadow-dark-600 dark:hover:shadow-md"
          >
            <svg
              fill="currentColor"
              class="h-9 w-9"
              version="1.1"
              id="Capa_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              viewBox="0 0 19.935 19.935"
              xml:space="preserve"
              ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></g><g id="SVGRepo_iconCarrier">
                <g>
                  <path
                    d="M19.935,18.33v-4.611h-4.022v-0.843h-1.879V12.35h-0.629v-1.98c0.132-0.037,0.229-0.155,0.229-0.3 c0-0.171-0.141-0.31-0.311-0.31H12.91V8.5c0.069-0.048,0.115-0.127,0.115-0.219c0-0.146-0.117-0.264-0.265-0.264h-0.323 c-0.033-0.352-0.143-1.081-0.48-1.569c-0.354-0.507-0.826-0.817-1.223-1.006c0.028-0.038,0.045-0.086,0.045-0.138 c0-0.11-0.071-0.201-0.172-0.23V4.857h-0.174V3.8c0.052-0.026,0.09-0.082,0.09-0.146c0-0.09-0.075-0.164-0.164-0.164h-0.048 c-0.049-0.084-0.14-0.146-0.245-0.17V1.604H9.868V3.32C9.762,3.344,9.674,3.406,9.623,3.489H9.575 c-0.089,0-0.164,0.073-0.164,0.164c0,0.064,0.038,0.12,0.091,0.146v1.057H9.325v0.217C9.227,5.104,9.153,5.194,9.153,5.305 c0,0.052,0.019,0.1,0.046,0.139c-0.398,0.188-0.868,0.498-1.22,1.005c-0.341,0.488-0.45,1.219-0.482,1.57H7.172 c-0.146,0-0.262,0.118-0.262,0.265c0,0.091,0.044,0.169,0.113,0.218v1.259H6.61c-0.17,0-0.31,0.139-0.31,0.31 c0,0.145,0.098,0.263,0.229,0.3v1.98H5.9v0.526H4.022v0.843H0v4.611h19.935V18.33z M18.182,14.482h0.698v0.986h-0.698V14.482z M18.182,16.042h0.698v0.986h-0.698V16.042z M16.682,14.482h0.7v0.986h-0.7V14.482z M16.682,16.042h0.7v0.986h-0.7V16.042z M14.546,13.999h0.661v2.374h-0.661V13.999z M11.421,16.373h-0.662v-2.374h0.662V16.373z M12.683,16.373h-0.661v-2.374h0.661 V16.373z M13.284,13.999h0.659v2.374h-0.659V13.999z M12.595,10.653c0,0-0.016-0.235,0.202-0.235c0.219,0,0.219,0.235,0.219,0.235 v1.682h-0.421C12.595,12.335,12.595,10.653,12.595,10.653z M12.118,8.538c0,0-0.013-0.17,0.166-0.17c0.178,0,0.178,0.17,0.178,0.17 v1.218h-0.344C12.118,9.756,12.118,8.538,12.118,8.538z M11.852,10.417c0.218,0,0.218,0.235,0.218,0.235v1.682h-0.421v-1.681 C11.648,10.653,11.633,10.417,11.852,10.417z M11.344,8.538c0,0-0.012-0.17,0.163-0.17c0.181,0,0.181,0.17,0.181,0.17v1.218h-0.344 V8.538z M11.121,10.653v1.682h-0.417v-1.682c0,0-0.017-0.235,0.201-0.235C11.121,10.417,11.121,10.653,11.121,10.653z M10.569,8.538c0,0-0.013-0.17,0.166-0.17c0.178,0,0.178,0.17,0.178,0.17v1.218h-0.344C10.569,9.756,10.569,8.538,10.569,8.538z M9.795,8.538c0,0-0.013-0.17,0.166-0.17c0.178,0,0.178,0.17,0.178,0.17v1.218H9.795V8.538z M9.758,10.653 c0,0-0.017-0.235,0.203-0.235c0.216,0,0.216,0.235,0.216,0.235v1.682H9.758V10.653z M9.615,15.121c0,0,0.075-0.243,0.354-0.243 c0.278,0,0.35,0.243,0.35,0.243v1.251H9.615V15.121z M7.911,16.373H7.252v-2.374h0.659V16.373z M9.176,16.373H8.513v-2.374h0.662 v2.374H9.176z M9.021,8.538c0,0-0.014-0.17,0.165-0.17c0.177,0,0.177,0.17,0.177,0.17v1.218H9.021V8.538z M8.812,10.653 c0,0-0.016-0.235,0.201-0.235c0.218,0,0.218,0.235,0.218,0.235v1.682H8.812V10.653z M8.247,8.538c0,0-0.013-0.17,0.165-0.17 c0.177,0,0.177,0.17,0.177,0.17v1.218H8.247V8.538z M7.865,10.653c0,0-0.015-0.235,0.203-0.235c0.216,0,0.216,0.235,0.216,0.235 v1.682H7.865V10.653z M7.473,8.538c0,0-0.014-0.17,0.166-0.17c0.176,0,0.176,0.17,0.176,0.17v1.218H7.473V8.538z M6.919,10.653 c0,0-0.015-0.235,0.203-0.235s0.218,0.235,0.218,0.235v1.682H6.919V10.653z M5.989,13.999H6.65v2.374H5.989V13.999z M4.728,13.999 h0.661v2.374H4.728V13.999z M2.445,14.482h0.702v0.986H2.445V14.482z M2.445,16.042h0.702v0.986H2.445V16.042z M0.947,14.482h0.702 v0.986H0.947V14.482z M0.947,16.042h0.702v0.986H0.947V16.042z"
                  ></path>
                </g>
              </g></svg
            >

            <div>POTUS Tracker</div></a
          >
          <a
            href="/stock-screener"
            class="border border-gray-300 dark:border-gray-600 flex flex-col justify-center items-center p-4 bg-white dark:bg-secondary rounded-[5px] shadow font-semibold gap-2 hover:shadow-lg text-center dark:hover:shadow-dark-600 dark:hover:shadow-md"
            ><svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="h-8 w-8"
              aria-hidden="true"
              ><path
                d="M6 12a.75.75 0 01-.75-.75v-7.5a.75.75 0 111.5 0v7.5A.75.75 0 016 12zM18 12a.75.75 0 01-.75-.75v-7.5a.75.75 0 011.5 0v7.5A.75.75 0 0118 12zM6.75 20.25v-1.5a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0zM18.75 18.75v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 011.5 0zM12.75 5.25v-1.5a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0zM12 21a.75.75 0 01-.75-.75v-7.5a.75.75 0 011.5 0v7.5A.75.75 0 0112 21zM3.75 15a2.25 2.25 0 104.5 0 2.25 2.25 0 00-4.5 0zM12 11.25a2.25 2.25 0 110-4.5 2.25 2.25 0 010 4.5zM15.75 15a2.25 2.25 0 104.5 0 2.25 2.25 0 00-4.5 0z"
              ></path></svg
            >
            <div>Stock Screener</div></a
          >
          <a
            href="/compare"
            class="border border-gray-300 dark:border-gray-600 flex flex-col justify-center items-center p-4 bg-white dark:bg-secondary rounded-[5px] shadow font-semibold gap-2 hover:shadow-lg text-center dark:hover:shadow-dark-600 dark:hover:shadow-md"
          >
            <svg
              fill="currentColor"
              class="h-8 w-8"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></g><g id="SVGRepo_iconCarrier"
                ><path
                  d="M1,8A1,1,0,0,1,2,7H9.586L7.293,4.707A1,1,0,1,1,8.707,3.293l4,4a1,1,0,0,1,0,1.414l-4,4a1,1,0,1,1-1.414-1.414L9.586,9H2A1,1,0,0,1,1,8Zm21,7H14.414l2.293-2.293a1,1,0,0,0-1.414-1.414l-4,4a1,1,0,0,0,0,1.414l4,4a1,1,0,0,0,1.414-1.414L14.414,17H22a1,1,0,0,0,0-2Z"
                ></path></g
              ></svg
            >

            <div>Compare Stocks</div></a
          >
          <a
            href="/market-mover/gainers"
            class="border border-gray-300 dark:border-gray-600 flex flex-col justify-center items-center p-4 bg-white dark:bg-secondary rounded-[5px] shadow font-semibold gap-2 hover:shadow-lg text-center dark:hover:shadow-dark-600 dark:hover:shadow-md"
            ><svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="h-8 w-8"
              aria-hidden="true"
              ><path
                fill-rule="evenodd"
                d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm4.5 7.5a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0v-2.25a.75.75 0 01.75-.75zm3.75-1.5a.75.75 0 00-1.5 0v4.5a.75.75 0 001.5 0V12zm2.25-3a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0V9.75A.75.75 0 0113.5 9zm3.75-1.5a.75.75 0 00-1.5 0v9a.75.75 0 001.5 0v-9z"
                clip-rule="evenodd"
              ></path></svg
            >
            <div>Market Movers</div></a
          >
        </div>
      </div>
    </div>
    <div class="mb-8 pb-3 pt-6 md:pt-8 lg:pt-10">
      <MarketMover {gainersList} {losersList} {marketStatus} {charNumber} />

      <div
        class="mx-auto flex flex-col px-3 pt-6 xs:px-4 sm:px-5 md:pt-8 lg:grid lg:max-w-[1200px] lg:grid-cols-3 lg:justify-evenly lg:gap-8 lg:pt-10"
      >
        <Wiim {wiim} />
        <div class="flex flex-col space-y-6 pt-6 lg:space-y-8 lg:pt-0">
          <OptionsFlow {optionsFlowList} />
          <UpcomingEarnings {upcomingEarnings} />
        </div>
      </div>
    </div>
  </main>
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
