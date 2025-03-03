<script lang="ts">
  import "../app.css";
  import "../app.pcss";

  //import { Toaster } from "svelte-french-toast";
  import { Toaster } from "svelte-sonner";
  import NProgress from "nprogress";
  import "nprogress/nprogress.css";

  import { page } from "$app/stores";
  import Footer from "$lib/components/Footer.svelte";
  import Searchbar from "$lib/components/Searchbar.svelte";
  import NotificationBell from "$lib/components/NotificationBell.svelte";

  //import PullToRefresh from '$lib/components/PullToRefresh.svelte';

  //import DiscountBanner from '$lib/components/DiscountBanner.svelte';

  import { beforeNavigate, afterNavigate } from "$app/navigation";
  import { onMount, onDestroy } from "svelte";
  import {
    clearCache,
    showCookieConsent,
    screenWidth,
    stockTicker,
    etfTicker,
    loginData,
    numberOfUnreadNotification,
    clientSideCache,
    isOpen,
    isAfterMarketClose,
    isBeforeMarketOpen,
    isWeekend,
    previousPage,
  } from "$lib/store";

  import { Button } from "$lib/components/shadcn/button/index.ts";
  import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.ts";
  import * as Sheet from "$lib/components/shadcn/sheet/index.ts";
  import * as Accordion from "$lib/components/shadcn/accordion/index.js";

  import Home from "lucide-svelte/icons/house";
  import Menu from "lucide-svelte/icons/menu";
  import Stock from "lucide-svelte/icons/chart-candlestick";
  import Calendar from "lucide-svelte/icons/calendar";
  import Flow from "lucide-svelte/icons/tornado";
  import HandShake from "lucide-svelte/icons/handshake";
  import Layers from "lucide-svelte/icons/layers";
  import Boxes from "lucide-svelte/icons/boxes";
  import Newspaper from "lucide-svelte/icons/newspaper";
  import AudioLine from "lucide-svelte/icons/audio-lines";
  import Gem from "lucide-svelte/icons/gem";
  import stocknear_logo from "$lib/images/stocknear_logo.png";

  export let data;

  let hideHeader = false;

  NProgress.configure({ showSpinner: false });

  $: {
    const currentPath = $page.url.pathname;

    if (
      currentPath.startsWith("/etf/etf-providers") ||
      currentPath.startsWith("/etf/new-launches")
    ) {
      hideHeader = false; // Show the header for "/etf/etf-providers"
    } else if (currentPath.startsWith("/etf/")) {
      hideHeader = true; // Hide the header for other routes under "/etf/"
    } else if (currentPath.startsWith("/index/")) {
      hideHeader = true; // Hide the header for other routes under "/etf/"
    } else {
      // Specify conditions for other routes where you want to hide the header
      hideHeader = currentPath.startsWith("/stocks/");
    }
  }

  let hasUnreadElement = false;
  let notificationList = [];

  //Define web workers:
  let syncWorker: Worker | undefined = undefined;
  // Handling messages from the worker
  const handleMessage = (event) => {
    const output = event.data?.output;
    notificationList = output?.notificationList;
    hasUnreadElement = output?.hasUnreadElement;
    numberOfUnreadNotification.set(output?.numberOfUnreadNotification);
  };

  const loadWorker = async () => {
    if ("serviceWorker" in navigator) {
      const SyncWorker = await import("$lib/workers/notificationWorker?worker");
      syncWorker = new SyncWorker.default();
      syncWorker.postMessage({ message: { userId: data?.user?.id } });
      syncWorker.onmessage = handleMessage;
    } else {
      // Fallback logic here
      await fallbackWorker();
    }
  };

  async function fallbackWorker() {
    // Implement fallback logic here, e.g., using timers or other techniques
    console.log("Fallback worker activated");
    const postData = { readed: false };
    const response = await fetch("/api/get-notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });

    notificationList = await response.json();
    const unreadNotifications = notificationList?.length; //notificationList.filter((item?) => !item?.readed,);
    hasUnreadElement = unreadNotifications > 0 ? true : false;
    numberOfUnreadNotification.set(unreadNotifications);
  }

  let Cookie;
  $showCookieConsent =
    typeof data?.cookieConsent !== "undefined" ? false : true;

  onMount(async () => {
    if (data?.user?.id) {
      await loadWorker();
      /*
      const permissionGranted = await requestNotificationPermission();

      if (permissionGranted) {
        const isSubscribed = (await checkSubscriptionStatus()) || false;

        if (!isSubscribed) {
          await subscribeUser();
        }
      }
        */
    }

    await checkMarketHour();
    if ($showCookieConsent === true) {
      Cookie = (await import("$lib/components/Cookie.svelte")).default;
    }
    /*
    if (window?.innerWidth <= 768) {
      await detectSWUpdate();
    }
      */

    // Clear all the cache every 20 min
    const interval = setInterval(
      () => {
        clearCache();
      },
      20 * 60 * 1000,
    );

    return () => clearInterval(interval);
  });

  onDestroy(() => {
    clearCache();
  });

  beforeNavigate(async () => {
    NProgress.start();
  });

  afterNavigate(async ({ from }) => {
    $previousPage = from?.url.pathname || $previousPage;
    NProgress.done();
  });

  $: {
    if ($page.url.pathname) {
      $loginData = data?.user;
      //data.currentPath = $page.url.pathname
    }
  }

  $: {
    if ($stockTicker && !$clientSideCache[$stockTicker]) {
      $clientSideCache[$stockTicker] = {};
    }
  }

  $: {
    if ($etfTicker && !$clientSideCache[$etfTicker]) {
      $clientSideCache[$etfTicker] = {};
    }
  }

  const checkMarketHour = async () => {
    const holidays = [
      "2025-01-01",
      "2025-01-09",
      "2025-01-20",
      "2025-02-17",
      "2025-04-18",
      "2025-05-26",
      "2025-06-19",
      "2025-07-04",
      "2025-09-01",
      "2025-11-27",
      "2025-12-25",
    ];
    const currentDate = new Date().toISOString().split("T")[0];

    // Get the current time in the ET time zone
    const etTimeZone = "America/New_York";
    const currentTime = new Date().toLocaleString("en-US", {
      timeZone: etTimeZone,
    });

    // Determine if the NYSE is currently open or closed
    const currentHour = new Date(currentTime).getHours();
    const isWeekendValue =
      new Date(currentTime).getDay() === 6 ||
      new Date(currentTime).getDay() === 0;
    const isBeforeMarketOpenValue =
      currentHour < 9 ||
      (currentHour === 9 && new Date(currentTime).getMinutes() < 30);
    const isAfterMarketCloseValue = currentHour >= 16;

    isOpen.set(
      !(
        isWeekendValue ||
        isBeforeMarketOpenValue ||
        isAfterMarketCloseValue ||
        holidays?.includes(currentDate)
      ),
    );
    isWeekend.set(isWeekendValue);
    isBeforeMarketOpen.set(isBeforeMarketOpenValue);
    isAfterMarketClose.set(isAfterMarketCloseValue);
  };
</script>

<svelte:window bind:innerWidth={$screenWidth} />

<div class="app {$page?.url?.pathname === '/' ? 'bg-[#000]' : ''}">
  <div class="flex min-h-screen w-full flex-col bg-default">
    <div class="w-full">
      <div
        class="w-full navbar sticky {$screenWidth &&
        $screenWidth < 640 &&
        hideHeader
          ? 'invisible -mt-20'
          : ''} top-0 z-40 bg-default border-b border-gray-800 flex h-14 items-center gap-4 px-4 sm:h-auto sm:px-6"
      >
        <Sheet.Root>
          <Sheet.Trigger asChild let:builder>
            <Button
              builders={[builder]}
              size="icon"
              class="bg-default text-white sm:hover:bg-primary border-none"
            >
              <Menu class="h-5.5 w-5.5 sm:w-7 sm:h-7" />
              <span class="sr-only">Toggle Menu</span>
            </Button>
          </Sheet.Trigger>
          <Sheet.Content
            side="left"
            class="max-w-screen w-full sm:max-w-xs bg-[#141417] overflow-y-auto text-white"
          >
            <nav class=" grid gap-6 text-lg bg-[#141417]">
              <Sheet.Close asChild let:builder>
                <Button
                  builders={[builder]}
                  class="bg-[#141417] hover:bg-[#141417] -ml-4 mr-auto"
                >
                  <a
                    href="/"
                    class="flex items-center gap-4 px-0.5 text-white text-[1rem] font-semibold"
                  >
                    <img
                      class="avatar w-9 sm:w-10 rounded-full"
                      src={stocknear_logo}
                      alt="Stocknear Logo"
                    />
                    Stocknear
                  </a>
                </Button>
              </Sheet.Close>

              <Sheet.Close asChild let:builder>
                <Button
                  builders={[builder]}
                  type="submit"
                  class="w-full bg-[#141417] hover:bg-[#141417] -ml-4 mr-auto"
                >
                  <a
                    href="/"
                    class="w-full flex flex-row items-center mr-auto mt-5"
                  >
                    <div
                      class="flex h-9 w-9 items-center justify-center rounded-md text-white transition-colors hover:text-white md:h-8 md:w-8"
                    >
                      <Home class="h-5.5 w-5.5" />
                    </div>
                    <span class="ml-3 text-white text-[1rem]">Home</span>
                  </a>
                </Button>
              </Sheet.Close>

              <div class="flex flex-row items-center w-full">
                <Accordion.Root class="w-full">
                  <Accordion.Item value="item-1">
                    <Accordion.Trigger class="">
                      <Stock class="h-5.5 w-5.5 mr-3 text-white ml-1" />
                      <span class="text-white ml-1 mr-auto">Stocks</span>
                    </Accordion.Trigger>
                    <Accordion.Content
                      class="border-l border-gray-500 ml-2 mt-5"
                    >
                      <Sheet.Close asChild let:builder>
                        <div class="flex flex-col items-start">
                          <Button
                            builders={[builder]}
                            type="submit"
                            class="w-full bg-[#141417] hover:bg-[#141417]"
                          >
                            <a
                              href="/analysts"
                              class="text-start w-full text-[1rem] text-white ml-4 mt-2"
                              >Top Analyst</a
                            >
                          </Button>

                          <Button
                            builders={[builder]}
                            type="submit"
                            class="w-full bg-[#141417] hover:bg-[#141417]"
                          >
                            <a
                              href="/analysts/top-stocks"
                              class="text-start w-full text-[1rem] text-white ml-4 mt-4"
                              >Top Analyst Stocks</a
                            >
                          </Button>

                          <Button
                            builders={[builder]}
                            type="submit"
                            class="w-full bg-[#141417] hover:bg-[#141417]"
                          >
                            <a
                              href="/industry"
                              class="text-start w-full text-[1rem] text-white ml-4 mt-4"
                              >By Industry</a
                            >
                          </Button>

                          <Button
                            builders={[builder]}
                            type="submit"
                            class="w-full bg-[#141417] hover:bg-[#141417]"
                          >
                            <a
                              href="/stock-screener"
                              class="text-start w-full text-[1rem] text-white ml-4 mt-4"
                              >Stock Screener</a
                            >
                          </Button>
                          <Button
                            builders={[builder]}
                            type="submit"
                            class="w-full bg-[#141417] hover:bg-[#141417]"
                          >
                            <a
                              href="/market-mover/gainers"
                              class="text-start w-full text-[1rem] text-white ml-4 mt-4"
                              >Market Mover</a
                            >
                          </Button>

                          <Button
                            builders={[builder]}
                            type="submit"
                            class="w-full bg-[#141417] hover:bg-[#141417]"
                          >
                            <a
                              href="/heatmap"
                              class="text-start w-full text-[1rem] text-white ml-4 mt-4"
                              >Market Heatmap</a
                            >
                          </Button>

                          <Button
                            builders={[builder]}
                            type="submit"
                            class="w-full bg-[#141417] hover:bg-[#141417]"
                          >
                            <a
                              href="/list"
                              class="text-start w-full text-[1rem] text-white ml-4 mt-4"
                              >Stock Lists</a
                            >
                          </Button>
                        </div>
                      </Sheet.Close>
                    </Accordion.Content>
                  </Accordion.Item>
                </Accordion.Root>
              </div>

              <div class="flex flex-row items-center w-full">
                <Accordion.Root class="w-full">
                  <Accordion.Item value="item-1">
                    <Accordion.Trigger class="">
                      <Layers class="h-5.5 w-5.5 mr-3 text-white ml-1" />
                      <span class="text-white ml-1 mr-auto">ETFs</span>
                    </Accordion.Trigger>
                    <Accordion.Content
                      class="border-l border-gray-500 ml-2 mt-5"
                    >
                      <Sheet.Close asChild let:builder>
                        <div class="flex flex-col items-start">
                          <Button
                            builders={[builder]}
                            type="submit"
                            class="w-full bg-[#141417] hover:bg-[#141417]"
                          >
                            <a
                              href="/etf/new-launches"
                              class="text-start w-full text-[1rem] text-white ml-4 mt-2"
                              >New Launches</a
                            >
                          </Button>
                          <Button
                            builders={[builder]}
                            type="submit"
                            class="w-full bg-[#141417] hover:bg-[#141417]"
                          >
                            <a
                              href="/etf/etf-providers"
                              class="text-start w-full text-[1rem] text-white ml-4 mt-4"
                              >ETF Providers</a
                            >
                          </Button>
                        </div>
                      </Sheet.Close>
                    </Accordion.Content>
                  </Accordion.Item>
                </Accordion.Root>
              </div>

              <div class="flex flex-row items-center w-full">
                <Accordion.Root class="w-full">
                  <Accordion.Item value="item-1">
                    <Accordion.Trigger class="">
                      <Calendar class="h-5.5 w-5.5 mr-3 text-white ml-1" />
                      <span class="text-white ml-1 mr-auto">Calendar</span>
                    </Accordion.Trigger>
                    <Accordion.Content
                      class="border-l border-gray-500 ml-2 mt-5"
                    >
                      <Sheet.Close asChild let:builder>
                        <div class="flex flex-col items-start">
                          <Button
                            builders={[builder]}
                            type="submit"
                            class="w-full bg-[#141417] hover:bg-[#141417]"
                          >
                            <a
                              href="/dividends-calendar"
                              class="text-start w-full text-[1rem] text-white ml-4 mt-2"
                              >Dividends Calendar</a
                            >
                          </Button>
                          <Button
                            builders={[builder]}
                            type="submit"
                            class="w-full bg-[#141417] hover:bg-[#141417]"
                          >
                            <a
                              href="/earnings-calendar"
                              class="text-start w-full text-[1rem] text-white ml-4 mt-4"
                              >Earnings Calendar</a
                            >
                          </Button>
                          <!--
                          <Button
                            builders={[builder]}
                            type="submit"
                            class="w-full bg-[#141417] hover:bg-[#141417]"
                          >
                            <a
                              href="/fda-calendar"
                              class="text-start w-full text-[1rem] text-white ml-4 mt-4"
                              >FDA Calendar</a
                            >
                          </Button>
                          -->

                          <Button
                            builders={[builder]}
                            type="submit"
                            class="w-full bg-[#141417] hover:bg-[#141417]"
                          >
                            <a
                              href="/ipos"
                              class="text-start w-full text-[1rem] text-white ml-4 mt-4"
                              >IPO Calendar</a
                            >
                          </Button>

                          <Button
                            builders={[builder]}
                            type="submit"
                            class="w-full bg-[#141417] hover:bg-[#141417]"
                          >
                            <a
                              href="/economic-calendar"
                              class="text-start w-full text-[1rem] text-white ml-4 mt-4"
                              >Economic Calendar</a
                            >
                          </Button>
                          <Button
                            builders={[builder]}
                            type="submit"
                            class="w-full bg-[#141417] hover:bg-[#141417]"
                          >
                            <a
                              href="/economic-indicator"
                              class="text-start w-full text-[1rem] text-white ml-4 mt-4"
                              >Economic Indicator</a
                            >
                          </Button>
                          <!--

                          <Button
                            builders={[builder]}
                            type="submit"
                            class="w-full bg-[#141417] hover:bg-[#141417]"
                          >
                            <a
                              href="/stock-splits-calendar"
                              class="text-start w-full text-[1rem] text-white ml-4 mt-4"
                              >Stock Splits Calendar</a
                            >
                             
                          </Button>
                           -->
                        </div>
                      </Sheet.Close>
                    </Accordion.Content>
                  </Accordion.Item>
                </Accordion.Root>
              </div>

              <div class="flex flex-row items-center w-full">
                <Accordion.Root class="w-full">
                  <Accordion.Item value="item-1">
                    <Accordion.Trigger class="">
                      <HandShake class="h-5.5 w-5.5 mr-3 text-white ml-1" />
                      <span class="text-white ml-1 mr-auto">Congress</span>
                    </Accordion.Trigger>
                    <Accordion.Content
                      class="border-l border-gray-500 ml-2 mt-5"
                    >
                      <Sheet.Close asChild let:builder>
                        <div class="flex flex-col items-start">
                          <Button
                            builders={[builder]}
                            type="submit"
                            class="w-full bg-[#141417] hover:bg-[#141417]"
                          >
                            <a
                              href="/politicians/flow-data"
                              class="text-start w-full text-[1rem] text-white ml-4 mt-2"
                              >Congress Flow</a
                            >
                          </Button>
                          <Button
                            builders={[builder]}
                            type="submit"
                            class="w-full bg-[#141417] hover:bg-[#141417]"
                          >
                            <a
                              href="/politicians"
                              class="text-start w-full text-[1rem] text-white ml-4 mt-4"
                              >All Politicians</a
                            >
                          </Button>
                        </div>
                      </Sheet.Close>
                    </Accordion.Content>
                  </Accordion.Item>
                </Accordion.Root>
              </div>

              <div class="flex flex-row items-center w-full">
                <Accordion.Root class="w-full">
                  <Accordion.Item value="item-1">
                    <Accordion.Trigger class="">
                      <AudioLine class="h-5.5 w-5.5 mr-3 text-white ml-1" />
                      <span class="text-white ml-1 mr-auto"
                        >Tracker Datasets</span
                      >
                    </Accordion.Trigger>
                    <Accordion.Content
                      class="border-l border-gray-500 ml-2 mt-5"
                    >
                      <Sheet.Close asChild let:builder>
                        <div class="flex flex-col items-start">
                          <Button
                            builders={[builder]}
                            type="submit"
                            class="w-full bg-[#141417] hover:bg-[#141417]"
                          >
                            <a
                              href="/insider-tracker"
                              class="text-start w-full text-[1rem] text-white ml-4 mt-4"
                              >Insider Tracker</a
                            >
                          </Button>

                          <Button
                            builders={[builder]}
                            type="submit"
                            class="w-full bg-[#141417] hover:bg-[#141417]"
                          >
                            <a
                              href="/reddit-tracker"
                              class="text-start w-full text-[1rem] text-white ml-4 mt-4"
                              >Reddit Tracker</a
                            >
                          </Button>

                          <Button
                            builders={[builder]}
                            type="submit"
                            class="w-full bg-[#141417] hover:bg-[#141417]"
                          >
                            <a
                              href="/potus-tracker"
                              class="text-start w-full text-[1rem] text-white ml-4 mt-4"
                              >POTUS Tracker</a
                            >
                          </Button>

                          <!--
                          <Button
                            builders={[builder]}
                            type="submit"
                            class="w-full bg-[#141417] hover:bg-[#141417]"
                          >
                            <a
                              href="/sentiment-tracker"
                              class="text-start w-full text-[1rem] text-white ml-4 mt-4"
                              >Sentiment Tracker</a
                            >
                          </Button>
                          -->
                        </div>
                      </Sheet.Close>
                    </Accordion.Content>
                  </Accordion.Item>
                </Accordion.Root>
              </div>

              <div class="flex flex-row items-center w-full">
                <Accordion.Root class="w-full">
                  <Accordion.Item value="item-1">
                    <Accordion.Trigger class="">
                      <Flow class="h-5.5 w-5.5 mr-3 text-white ml-1" />
                      <span class="text-white ml-1 mr-auto">Flow Feed</span>
                    </Accordion.Trigger>
                    <Accordion.Content
                      class="border-l border-gray-500 ml-2 mt-5"
                    >
                      <Sheet.Close asChild let:builder>
                        <div class="flex flex-col items-start">
                          <Button
                            builders={[builder]}
                            type="submit"
                            class="w-full bg-[#141417] hover:bg-[#141417]"
                          >
                            <a
                              href="/market-flow"
                              class="text-start w-full text-[1rem] text-white ml-4 mt-2"
                              >Market Flow</a
                            >
                          </Button>

                          <Button
                            builders={[builder]}
                            type="submit"
                            class="w-full bg-[#141417] hover:bg-[#141417]"
                          >
                            <a
                              href="/options-flow"
                              class="text-start w-full text-[1rem] text-white ml-4 mt-4"
                              >Options Flow</a
                            >
                          </Button>
                          <Button
                            builders={[builder]}
                            type="submit"
                            class="w-full bg-[#141417] hover:bg-[#141417]"
                          >
                            <a
                              href="/dark-pool-flow"
                              class="text-start w-full text-[1rem] text-white ml-4 mt-4"
                              >Dark Pool Flow</a
                            >
                          </Button>
                        </div>
                      </Sheet.Close>
                    </Accordion.Content>
                  </Accordion.Item>
                </Accordion.Root>
              </div>

              <Sheet.Close asChild let:builder>
                <Button
                  builders={[builder]}
                  type="submit"
                  class="bg-[#141417] hover:bg-[#141417] -ml-4 w-full"
                >
                  <a
                    href="/hedge-funds"
                    class="flex flex-row items-center w-full -mt-2"
                  >
                    <div class="flex flex-row items-center mr-auto">
                      <div
                        class="flex h-9 w-9 items-center justify-center rounded-md text-white transition-colors hover:text-white md:h-8 md:w-8"
                      >
                        <Boxes class="h-5.5 w-5.5" />
                      </div>
                      <span class="ml-3 text-white text-[1rem]"
                        >Hedge Funds</span
                      >
                    </div>
                  </a>
                </Button>
              </Sheet.Close>

              <Sheet.Close asChild let:builder>
                <Button
                  builders={[builder]}
                  type="submit"
                  class="bg-[#141417] hover:bg-[#141417] -ml-4 w-full"
                >
                  <a
                    href="/market-news"
                    class="flex flex-row items-center w-full -mt-2"
                  >
                    <div class="flex flex-row items-center mr-auto">
                      <div
                        class="flex h-9 w-9 items-center justify-center rounded-md text-white transition-colors hover:text-white md:h-8 md:w-8"
                      >
                        <Newspaper class="h-5.5 w-5.5" />
                      </div>
                      <span class="ml-3 text-white text-[1rem]">News</span>
                    </div>
                  </a>
                </Button>
              </Sheet.Close>
              {#if data?.user?.tier !== "Pro"}
                <Sheet.Close asChild let:builder>
                  <Button
                    builders={[builder]}
                    type="submit"
                    class="bg-[#141417] hover:bg-[#141417] -ml-4 w-full"
                  >
                    <a
                      href="/pricing"
                      class="flex flex-row items-center w-full -mt-2"
                    >
                      <div class="flex flex-row items-center mr-auto">
                        <div
                          class="flex h-9 w-9 items-center justify-center rounded-md text-white transition-colors hover:text-white md:h-8 md:w-8"
                        >
                          <Gem class="h-5.5 w-5.5" />
                        </div>
                        <span class="ml-3 text-white text-[1rem]"
                          >Stock Analysis Pro</span
                        >
                      </div>
                    </a>
                  </Button>
                </Sheet.Close>
              {/if}
            </nav>
          </Sheet.Content>
        </Sheet.Root>

        <a href="/" class="-ml-2 flex shrink-0">
          <img
            class="avatar w-9 3xl:w-10 rounded-full"
            src={stocknear_logo}
            alt="Stocknear Logo"
          />
          <span class="text-white font-semibold ml-2 text-lg">Stocknear</span>
        </a>

        <div
          class="relative w-full flex flex-row justify-end sm:justify-between items-center"
        >
          <div class="sm:w-full sm:ml-2 2xl:ml-[75px]">
            <Searchbar />
          </div>
          <NotificationBell {data} {hasUnreadElement} />

          <div class="ml-4">
            {#if data?.user}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild let:builder>
                  <Button
                    size="icon"
                    aria-label="Settings"
                    class="overflow-hidden rounded-md bg-default sm:hover:bg-primary border border-gray-600 w-10 h-10"
                    builders={[builder]}
                  >
                    <svg
                      class="h-[28px] w-[28px] overflow-hidden rounded-full text-gray-300"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      ><path
                        fill="currentColor"
                        d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4"
                      /></svg
                    >
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="end">
                  <a href="/profile" class="cursor-pointer">
                    <DropdownMenu.Item
                      class="sm:hover:bg-primary cursor-pointer"
                    >
                      My Account
                    </DropdownMenu.Item>
                  </a>
                  <DropdownMenu.Separator />

                  <a href="/watchlist/stocks" class="cursor-pointer">
                    <DropdownMenu.Item
                      class="sm:hover:bg-primary cursor-pointer"
                    >
                      Watchlist
                    </DropdownMenu.Item>
                  </a>
                  <a href="/price-alert" class="cursor-pointer">
                    <DropdownMenu.Item
                      class="sm:hover:bg-primary cursor-pointer"
                    >
                      Price Alert
                    </DropdownMenu.Item>
                  </a>

                  <DropdownMenu.Separator />
                  <form class="cursor-pointer" action="/logout" method="POST">
                    <button
                      type="submit"
                      aria-label="Logout"
                      class="w-full text-start cursor-pointer"
                    >
                      <DropdownMenu.Item
                        class="sm:hover:bg-primary cursor-pointer"
                      >
                        <span class="text-start">Logout</span>
                      </DropdownMenu.Item>
                    </button>
                  </form>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            {:else}
              <a
                href="/login"
                class="inline-flex items-center justify-center rounded bg-[#fff] px-4 py-2 text-sm font-semibold text-black shadow-xs transition-all duration-150 sm:hover:bg-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600"
              >
                Login
              </a>
            {/if}
          </div>
        </div>
      </div>
      <div>
        <div class="flex w-full">
          <div class="hidden 3xl:block 3xl:w-[300px]">
            <aside
              class="fixed overflow-y-auto scroller overflow-hidden inset-y-0 left-0 z-50 3xl:flex w-64 flex-col 3xl:border-r 3xl:border-gray-800 bg-[#141417]"
            >
              <nav
                class="flex flex-col items-center mr-auto gap-y-4 3xl:py-5 w-full"
              >
                <a
                  href="/"
                  class="ml-3 mb-5 flex justify-end items-center h-9 w-9 shrink-0 gap-2 rounded-full text-lg font-semibold text-primary-foreground md:h-10 md:w-10 md:text-base"
                >
                  <img
                    class="avatar w-9 3xl:w-12 rounded-full"
                    src={stocknear_logo}
                    alt="Stocknear Logo"
                  />
                  <span class="text-white text-xl">Stocknear</span>
                </a>

                <a href="/" class="flex flex-row items-center ml-9 w-full">
                  <div
                    class="flex h-9 w-9 items-center justify-center rounded-md text-white transition-colors hover:text-white md:h-8 md:w-8"
                  >
                    <Home class="h-5.5 w-5.5" />
                  </div>
                  <span class="ml-3 text-white">Home</span>
                </a>

                <div class="flex flex-row items-center ml-9 w-full mt-3">
                  <Accordion.Root class="w-full">
                    <Accordion.Item value="item-1">
                      <Accordion.Trigger class="text-white ">
                        <Stock class="h-5.5 w-5.5 mr-3 text-white ml-1" />
                        <span class="text-white ml-1 mr-auto">Stocks</span>
                      </Accordion.Trigger>
                      <Accordion.Content
                        class="border-l border-gray-500 ml-2 mt-5"
                      >
                        <div class="flex flex-col items-start">
                          <a
                            href="/analysts"
                            class="text-[1rem] text-white ml-4 mt-4"
                            >Top Analyst</a
                          >

                          <a
                            href="/analysts/top-stocks"
                            class="text-[1rem] text-white ml-4 mt-4"
                            >Top Analyst Stocks</a
                          >

                          <a
                            href="/industry"
                            class="text-[1rem] text-white ml-4 mt-4"
                            >By Industry</a
                          >
                          <a
                            href="/stock-screener"
                            class="text-[1rem] text-white ml-4 mt-4"
                            >Stock Screener</a
                          >
                          <a
                            href="/market-mover/gainers"
                            class="text-[1rem] text-white ml-4 mt-4"
                            >Market Mover</a
                          >

                          <a
                            href="/heatmap"
                            class="text-[1rem] text-white ml-4 mt-4"
                            >Market Heatmap</a
                          >

                          <a
                            href="/list"
                            class="text-[1rem] text-white ml-4 mt-4"
                            >Stock Lists</a
                          >
                        </div>
                      </Accordion.Content>
                    </Accordion.Item>
                  </Accordion.Root>
                </div>

                <div class="flex flex-row items-center ml-9 w-full mt-3">
                  <Accordion.Root class="w-full">
                    <Accordion.Item value="item-1">
                      <Accordion.Trigger class="">
                        <Layers class="h-5.5 w-5.5 mr-3 text-white ml-1" />
                        <span class="text-white ml-1 mr-auto">ETFs</span>
                      </Accordion.Trigger>
                      <Accordion.Content
                        class="border-l border-gray-500 ml-2 mt-5"
                      >
                        <div class="flex flex-col items-start">
                          <a
                            href="/etf/new-launches"
                            class="text-[1rem] text-white ml-4 mt-4"
                            >New Launches</a
                          >
                          <a
                            href="/etf/etf-providers"
                            class="text-[1rem] text-white ml-4 mt-4"
                            >ETF Providers</a
                          >
                        </div>
                      </Accordion.Content>
                    </Accordion.Item>
                  </Accordion.Root>
                </div>

                <div class="flex flex-row items-center ml-9 w-full mt-3">
                  <Accordion.Root class="w-full">
                    <Accordion.Item value="item-1">
                      <Accordion.Trigger class="">
                        <Calendar class="h-5.5 w-5.5 mr-3 text-white ml-1" />
                        <span class="text-white ml-1 mr-auto">Calendar</span>
                      </Accordion.Trigger>
                      <Accordion.Content
                        class="border-l border-gray-500 ml-2 mt-5"
                      >
                        <div class="flex flex-col items-start">
                          <a
                            href="/dividends-calendar"
                            class="text-[1rem] text-white ml-4 mt-4"
                            >Dividends Calendar</a
                          >
                          <a
                            href="/earnings-calendar"
                            class="text-[1rem] text-white ml-4 mt-4"
                            >Earnings Calendar</a
                          >
                          <!--
                          <a
                            href="/fda-calendar"
                            class="text-[1rem] text-white ml-4 mt-4"
                            >FDA Calendar</a
                          >
                            -->

                          <a
                            href="/ipos"
                            class="text-[1rem] text-white ml-4 mt-4"
                            >IPO Calendar</a
                          >
                          <a
                            href="/economic-calendar"
                            class="text-[1rem] text-white ml-4 mt-4"
                            >Economic Calendar</a
                          >
                          <a
                            href="/economic-indicator"
                            class="text-[1rem] text-white ml-4 mt-4"
                            >Economic Indicator</a
                          >
                          <!--
                          <a
                            href="/stock-splits-calendar"
                            class="text-[1rem] text-white ml-4 mt-4"
                            >Stock Splits Calendar</a
                          >
                            -->
                        </div>
                      </Accordion.Content>
                    </Accordion.Item>
                  </Accordion.Root>
                </div>

                <div class="flex flex-row items-center ml-9 w-full mt-3">
                  <Accordion.Root class="w-full">
                    <Accordion.Item value="item-1">
                      <Accordion.Trigger class="">
                        <HandShake class="h-5.5 w-5.5 mr-3 text-white ml-1" />
                        <span class="text-white ml-1 mr-auto">Congress</span>
                      </Accordion.Trigger>

                      <Accordion.Content
                        class="border-l border-gray-500 ml-2 mt-5"
                      >
                        <div class="flex flex-col items-start">
                          <div class="flex flex-col items-start">
                            <a
                              href="/politicians/flow-data"
                              class="text-[1rem] text-white ml-4 mt-4"
                              >Congress Flow</a
                            >
                            <a
                              href="/politicians"
                              class="text-[1rem] text-white ml-4 mt-4"
                              >All Politicians</a
                            >
                          </div>
                        </div>
                      </Accordion.Content>
                    </Accordion.Item>
                  </Accordion.Root>
                </div>

                <div class="flex flex-row items-center ml-9 w-full mt-3">
                  <Accordion.Root class="w-full">
                    <Accordion.Item value="item-1">
                      <Accordion.Trigger class="">
                        <AudioLine class="h-5.5 w-5.5 mr-3 text-white ml-1" />
                        <span class="text-white ml-1 mr-auto"
                          >Tracker Datasets</span
                        >
                      </Accordion.Trigger>
                      <Accordion.Content
                        class="border-l border-gray-500 ml-2 mt-5"
                      >
                        <div class="flex flex-col items-start">
                          <a
                            href="/insider-tracker"
                            class="text-[1rem] text-white ml-4 mt-4"
                            >Insider Tracker</a
                          >

                          <a
                            href="/reddit-tracker"
                            class="text-[1rem] text-white ml-4 mt-4"
                            >Reddit Tracker</a
                          >

                          <a
                            href="/potus-tracker"
                            class="text-[1rem] text-white ml-4 mt-4"
                            >POTUS Tracker</a
                          >

                          <!--
                          <a
                            href="/sentiment-tracker"
                            class="text-[1rem] text-white ml-4 mt-4"
                            >Sentiment Tracker</a
                          >
                            -->
                        </div>
                      </Accordion.Content>
                    </Accordion.Item>
                  </Accordion.Root>
                </div>

                <div class="flex flex-row items-center ml-9 w-full mt-3">
                  <Accordion.Root class="w-full">
                    <Accordion.Item value="item-1">
                      <Accordion.Trigger class="">
                        <Flow class="h-5.5 w-5.5 mr-3 text-white ml-1" />
                        <span class="text-white ml-1 mr-auto">Flow Feed</span>
                      </Accordion.Trigger>
                      <Accordion.Content
                        class="border-l border-gray-500 ml-2 mt-5"
                      >
                        <div class="flex flex-col items-start">
                          <a
                            href="/market-flow"
                            class="text-[1rem] text-white ml-4 mt-4"
                            >Market Flow</a
                          >

                          <a
                            href="/options-flow"
                            class="text-[1rem] text-white ml-4 mt-4"
                            >Options Flow</a
                          >
                          <a
                            href="/dark-pool-flow"
                            class="text-[1rem] text-white ml-4 mt-4"
                            >Dark Pool Flow</a
                          >
                        </div>
                      </Accordion.Content>
                    </Accordion.Item>
                  </Accordion.Root>
                </div>

                <a
                  href="/hedge-funds"
                  class="flex flex-row items-center ml-9 w-full mt-3"
                >
                  <div
                    class="flex h-9 w-9 items-center justify-center rounded-md text-white transition-colors hover:text-white md:h-8 md:w-8"
                  >
                    <Boxes class="h-5.5 w-5.5" />
                  </div>
                  <span class="ml-3 text-white">Hedge Funds</span>
                </a>

                <a
                  href="/market-news"
                  class="flex flex-row items-center ml-9 w-full mt-3"
                >
                  <div
                    class="flex h-9 w-9 items-center justify-center rounded-md text-white transition-colors hover:text-white md:h-8 md:w-8"
                  >
                    <Newspaper class="h-5.5 w-5.5" />
                  </div>
                  <span class="ml-3 text-white">News</span>
                </a>
                {#if data?.user?.tier !== "Pro"}
                  <a
                    href="/pricing"
                    class="flex flex-row items-center ml-9 w-full mt-3"
                  >
                    <div
                      class="flex h-9 w-9 items-center justify-center rounded-md text-white transition-colors hover:text-white md:h-8 md:w-8"
                    >
                      <Gem class="h-5.5 w-5.5" />
                    </div>
                    <span class="ml-3 text-white">Stock Analysis Pro</span>
                  </a>
                {/if}
              </nav>
            </aside>
          </div>
          <div class="w-full">
            <main class="w-full overflow-y-auto bg-default sm:p-4">
              <!--
              <button on:click={handleNotificationClick}>
                Send Notification
              </button>
              -->

              <slot />
              <Toaster />

              {#if Cookie && $showCookieConsent === true}
                <Cookie />
              {/if}
            </main>
          </div>
        </div>
      </div>
      <div>
        <Footer />
      </div>
    </div>
  </div>
</div>

<style global lang="scss">
  .scroller {
    scrollbar-width: thin;
  }
</style>
