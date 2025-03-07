<script lang="ts">
  import {
    wsBidPrice,
    wsAskPrice,
    globalForm,
    scoreComponent,
    screenWidth,
    openPriceAlert,
    currentPortfolioPrice,
    realtimePrice,
    isCrosshairMoveActive,
    currentPrice,
    priceIncrease,
    stockTicker,
    assetType,
    displayCompanyName,
    isOpen,
    shouldUpdatePriceChart,
    priceChartData,
    previousPage,
  } from "$lib/store";

  import { onMount, onDestroy, afterUpdate } from "svelte";
  import { page } from "$app/stores";
  import { toast } from "svelte-sonner";

  import { convertTimestamp } from "$lib/utils";
  import AIScore from "$lib/components/AIScore.svelte";
  import PriceAlert from "$lib/components/PriceAlert.svelte";

  export let data;
  let prePostData = data?.getPrePostQuote || {};
  $: $realtimePrice = data?.getStockQuote?.price?.toFixed(2);
  let oneDayPrice = [];
  let previousRealtimePrice = null;
  let previousTicker;
  let socket;

  $stockTicker = data?.getParams;
  $assetType = "stock";
  $displayCompanyName = data?.companyName;

  let isScrolled = false;
  let y;

  let userWatchList = data?.getUserWatchlist ?? [];
  let isTickerIncluded = false;
  //let userPortfolio = data?.getUserPortfolio ?? [];
  //let holdingShares = 0;
  //let availableCash = 0;

  let displaySection = "";
  let displayLegend = {};

  function shareContent(url) {
    if (navigator.share) {
      navigator
        ?.share({
          title: document.title,
          url,
        })
        ?.then(() => console.log("Content shared successfully."))
        ?.catch((error) => console.log("Error sharing content:", error));
    } else {
      toast.error("Sharing is not supported by your device", {
        style:
          "border-radius: 5px; background: #fff; color: #000; border-color: #4B5563; font-size: 15px;",
      });
    }
  }

  function changeSection(state) {
    const sectionMap = {
      insider: "/insider",
      options: "/options",
      "dark-pool": "/dark-pool",
      dividends: "/dividends",
      statistics: "/statistics",
      metrics: "metrics",
      forecast: "/forecast",
      financials: "/financials",
      history: "/history",
      profile: "/profile",
    };

    if (state !== "overview" && sectionMap[state]) {
      displaySection = state;
      //goto(`/stocks/${$stockTicker}${sectionMap[state]}`);
    } else {
      displaySection = "overview";
      //goto(`/stocks/${$stockTicker}/`);
    }
  }

  async function toggleUserWatchlist(watchListId: string) {
    try {
      // Find the index of the watchlist
      const watchlistIndex = userWatchList?.findIndex(
        (item) => item?.id === watchListId,
      );

      if (watchlistIndex !== -1 && watchlistIndex !== undefined) {
        const watchlist = userWatchList[watchlistIndex];
        const existingTickerIndex = watchlist?.ticker?.indexOf($stockTicker);

        let updatedTickers = [...(watchlist?.ticker || [])]; // Ensure we don't mutate directly

        if (existingTickerIndex !== -1) {
          // Remove the ticker if it exists
          updatedTickers.splice(existingTickerIndex, 1);
        } else {
          // Add the ticker if it doesn't exist
          updatedTickers.push($stockTicker);

          // Check tier limits
          if (
            !["Pro", "Plus"]?.includes(data?.user?.tier) &&
            updatedTickers.length > 5
          ) {
            toast.error("Upgrade to Pro to add unlimited stocks!", {
              style:
                "border-radius: 5px; background: #fff; color: #000; border-color: #4B5563; font-size: 15px;",
            });
            return;
          }
        }

        // Update the local state immutably
        userWatchList = userWatchList.map((item, idx) =>
          idx === watchlistIndex ? { ...item, ticker: updatedTickers } : item,
        );

        // Send API request
        const response = await fetch("/api/update-watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ watchListId, ticker: $stockTicker }),
        });

        const output = await response.json();

        // Update userWatchList based on API response
        userWatchList = userWatchList.map((item) =>
          item.id === watchListId ? output : item,
        );
      } else {
        // If watchlist doesn't exist, create a new entry
        const response = await fetch("/api/update-watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ watchListId, ticker: $stockTicker }),
        });

        const output = await response.json();
        userWatchList = [...userWatchList, output];
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }

  function sendMessage(message) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON?.stringify(message));
    } else {
      console.error("WebSocket is not open. Unable to send message.");
    }
  }

  async function websocketRealtimeData() {
    try {
      socket = new WebSocket(data?.wsURL + "/price-data");

      socket.addEventListener("open", () => {
        console.log("WebSocket connection opened");
        // Send only current watchlist symbols
        const tickerList = [$stockTicker?.toUpperCase()] || [];
        sendMessage(tickerList);
      });

      socket.addEventListener("message", (event) => {
        const data = event.data;
        //console.log("Received message:", data);
        try {
          const parsedData = JSON.parse(data);
          const { type, lp, time, bp, ap, avgPrice } = parsedData?.at(0) || {};

          if (type === "T") {
            $realtimePrice = typeof lp !== "undefined" ? lp : null;
            $priceChartData = {
              time: typeof time !== "undefined" ? time : null,
              price: typeof lp !== "undefined" ? Number(lp) : null,
            };
            shouldUpdatePriceChart.set(true);
          } else if (type === "Q") {
            $wsBidPrice = typeof bp !== "undefined" ? bp : null;
            $wsAskPrice = typeof ap !== "undefined" ? ap : null;
            $realtimePrice =
              typeof avgPrice !== "undefined" ? avgPrice?.toFixed(2) : null;
          }

          // Update price increase state
          if ($realtimePrice !== previousRealtimePrice) {
            $priceIncrease = $realtimePrice > previousRealtimePrice;
            previousRealtimePrice = $realtimePrice;
          }

          $isCrosshairMoveActive = false;
        } catch (e) {
          console.log(e);
        }
      });

      socket.addEventListener("close", (event) => {
        console.log("WebSocket connection closed:", event.reason);
      });
    } catch (error) {
      console.error("WebSocket connection error:", error);
    }
  }

  let LoginPopup;

  $: if ($isOpen) {
    websocketRealtimeData();
  }

  onMount(async () => {
    if (!data?.user) {
      LoginPopup = (await import("$lib/components/LoginPopup.svelte")).default;
    }
  });

  afterUpdate(async () => {
    if (previousTicker !== $stockTicker && typeof socket !== "undefined") {
      previousTicker = $stockTicker;
      //socket.send('close')
      socket?.close();
      await new Promise((resolve, reject) => {
        socket?.addEventListener("close", resolve);
      });

      if (socket?.readyState === WebSocket?.CLOSED) {
        await websocketRealtimeData();
        console.log("connecting again");
      }
      $wsAskPrice = null;
      $wsBidPrice = null;
    }
  });

  onDestroy(() => {
    try {
      //socket?.send('close')
      socket?.close();
    } catch (e) {
      console.log(e);
    }

    //$displayCompanyName = '';
    $currentPortfolioPrice = null;
    $currentPrice = null;
    $priceIncrease = null;
    $wsAskPrice = null;
    $wsBidPrice = null;
    //$traded = false
  });

  $: {
    if ($stockTicker && $stockTicker?.length !== 0) {
      // add a check to see if running on client-side
      $stockTicker = data?.getParams;
      $assetType = "stock";
      $displayCompanyName = data?.companyName;
      $currentPortfolioPrice = data?.getStockQuote?.price?.toFixed(2);
      prePostData = data?.getPrePostQuote || {};
      const output = [...data?.getOneDayPrice] ?? [];
      oneDayPrice = output?.map((item) => ({
        time: Date?.parse(item?.time + "Z") / 1000,
        open: item?.open !== null ? item?.open : NaN,
        high: item?.high !== null ? item?.high : NaN,
        low: item?.low !== null ? item?.low : NaN,
        close: item?.close !== null ? item?.close : NaN,
      }));

      let changesPercentage = null;
      let change = null;
      let currentDataRowOneDay;
      let baseClose =
        data?.getStockQuote?.previousClose || oneDayPrice?.at(0)?.open;

      const length = oneDayPrice?.length;
      for (let i = length - 1; i >= 0; i--) {
        if (!isNaN(oneDayPrice[i]?.close)) {
          currentDataRowOneDay = oneDayPrice[i];
          break;
        }
      }

      // Calculate percentage change if baseClose and currentDataRow are valid
      const closeValue =
        $realtimePrice !== null && $realtimePrice !== undefined
          ? $realtimePrice
          : currentDataRowOneDay?.close || currentDataRowOneDay?.value;

      if (closeValue && baseClose) {
        change = (closeValue - baseClose)?.toFixed(2);
        changesPercentage = ((closeValue / baseClose - 1) * 100)?.toFixed(2);
      }

      // Format date
      const date = new Date(currentDataRowOneDay?.time * 1000);

      const options = {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "UTC",
      };

      const formattedDate = date?.toLocaleString("en-US", options);

      const safeFormattedDate =
        formattedDate === "Invalid Date"
          ? convertTimestamp(data?.getStockQuote?.timestamp)
          : formattedDate;

      // Set display legend
      displayLegend = {
        close:
          $realtimePrice !== null && $realtimePrice !== undefined
            ? $realtimePrice
            : currentDataRowOneDay?.close?.toFixed(2) ||
              data?.getStockQuote?.price?.toFixed(2),
        date: safeFormattedDate,
        changesPercentage,
        change,
      };
    }
  }

  $: isTickerIncluded = userWatchList?.some(
    (item) =>
      item.user === data?.user?.id && item.ticker?.includes($stockTicker),
  );

  $: charNumber = $screenWidth < 640 ? 25 : 40;

  $: {
    if ($stockTicker && $page.url.pathname === `/stocks/${$stockTicker}`) {
      displaySection = "overview";
    }
  }

  $: {
    if ($page?.url?.pathname) {
      const parts = $page?.url?.pathname?.split("/");
      const sectionMap = {
        statistics: "statistics",
        financials: "financials",
        options: "options",
        "dark-pool": "dark-pool",
        metrics: "metrics",
        insider: "insider",
        dividends: "dividends",
        forecast: "forecast",
        history: "history",
        profile: "profile",
      };
      displaySection =
        sectionMap[
          parts?.find((part) => Object?.keys(sectionMap)?.includes(part))
        ] || "overview";
    }
  }

  $: isScrolled = y > 0;
</script>

<svelte:window bind:scrollY={y} />

<body
  class="bg-default w-full max-w-screen sm:max-w-[1250px] min-h-screen overflow-hidden"
>
  <!-- Page wrapper -->
  <div class="mt-5 flex flex-col w-full relative w-full sm:max-w-[1250px]">
    <main class="grow w-full">
      <section class="">
        <div class="w-full">
          <div class="sm:flex sm:justify-start w-full">
            <!--Start Mobile Navbar-->
            <div class="fixed top-0 left-0 right-0 z-20 bg-default sm:hidden">
              <div class="navbar w-full px-4 py-2">
                <div
                  class="{isScrolled
                    ? 'border-b border-gray-600 ease-in'
                    : 'ease-out'} m-auto w-full"
                >
                  <div
                    class="flex-1 shrink-0 flex flex-row items-center justify-between -mt-2"
                  >
                    <a
                      href={/^\/(stocks|etf|index)/.test($previousPage || "")
                        ? "/"
                        : $previousPage || "/"}
                    >
                      <svg
                        class="w-5 h-5 inline-block"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1024 1024"
                        ><g transform="rotate(-90 512 512)"
                          ><path
                            fill="white"
                            d="M104.704 685.248a64 64 0 0 0 90.496 0l316.8-316.8l316.8 316.8a64 64 0 0 0 90.496-90.496L557.248 232.704a64 64 0 0 0-90.496 0L104.704 594.752a64 64 0 0 0 0 90.496z"
                          /></g
                        ></svg
                      >
                    </a>

                    <div
                      class={!isScrolled
                        ? "hidden"
                        : "flex flex-col items-center ml-6 transition-transform ease-in"}
                    >
                      <span class="text-white text-xs font-semibold">
                        {$stockTicker}
                      </span>
                      <span class="text-white text-sm">
                        {#if $currentPortfolioPrice !== null && $currentPortfolioPrice !== 0}
                          {$currentPortfolioPrice}
                        {:else}
                          {data?.getStockQuote?.price}
                        {/if}
                      </span>
                    </div>

                    <!--Start Search Button-->
                    <label class="ml-auto mr-4" for="searchBarModal">
                      <svg
                        class="w-6 h-6 inline-block"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        ><path
                          fill="none"
                          stroke="white"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1.5"
                          d="m21 21l-4.343-4.343m0 0A8 8 0 1 0 5.343 5.343a8 8 0 0 0 11.314 11.314"
                        /></svg
                      >
                    </label>
                    <!--End Search Button-->

                    <!--Start Share Button-->
                    <label
                      class="mr-4"
                      on:click={() =>
                        shareContent(
                          "https://stocknear.com/stocks/" + $stockTicker,
                        )}
                    >
                      <svg
                        class="w-6 h-6 inline-block"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        stroke="#fff"
                        ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
                          id="SVGRepo_tracerCarrier"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></g><g id="SVGRepo_iconCarrier">
                          <path
                            d="M20.3359 3.22136L3.87333 8.70889C3.56801 8.81066 3.55033 9.23586 3.84614 9.36263L9.89655 11.9557C9.96078 11.9832 10.0347 11.9752 10.0916 11.9346L16.0235 7.69749C16.2073 7.56618 16.4338 7.79266 16.3025 7.97648L12.0654 13.9084C12.0248 13.9653 12.0168 14.0392 12.0443 14.1034L14.6374 20.1539C14.7641 20.4497 15.1893 20.432 15.2911 20.1267L20.7786 3.66408C20.8698 3.39046 20.6095 3.13015 20.3359 3.22136Z"
                            fill="#fff"
                          ></path>
                        </g></svg
                      >
                    </label>
                    <!--End Share Button-->

                    <!--Start Watchlist-->

                    {#if data?.user}
                      <div class="flex flex-col mr-4">
                        {#if userWatchList?.length !== 0}
                          <label
                            for="addWatchListModal"
                            class="cursor-pointer shrink-0"
                          >
                            {#if isTickerIncluded}
                              <svg
                                class="w-6 h-6 inline-block"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 16 16"
                                ><path
                                  fill="#fff"
                                  d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327l4.898.696c.441.062.612.636.282.95l-3.522 3.356l.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"
                                /></svg
                              >
                            {:else}
                              <svg
                                class="w-6 h-6 inline-block"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 16 16"
                                ><path
                                  fill="white"
                                  d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256l4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73l3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356l-.83 4.73zm4.905-2.767l-3.686 1.894l.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575l-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957l-3.686-1.894a.503.503 0 0 0-.461 0z"
                                /></svg
                              >
                            {/if}
                          </label>
                        {:else if userWatchList?.length === 0}
                          <label
                            on:click={() => toggleUserWatchlist("firstList")}
                            class="cursor-pointer shrink-0"
                          >
                            {#if isTickerIncluded}
                              <svg
                                class="w-6 h-6 inline-block"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 16 16"
                                ><path
                                  fill="#fff"
                                  d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327l4.898.696c.441.062.612.636.282.95l-3.522 3.356l.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"
                                /></svg
                              >
                            {:else}
                              <svg
                                class="w-6 h-6 inline-block"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 16 16"
                                ><path
                                  fill="white"
                                  d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256l4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73l3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356l-.83 4.73zm4.905-2.767l-3.686 1.894l.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575l-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957l-3.686-1.894a.503.503 0 0 0-.461 0z"
                                /></svg
                              >
                            {/if}
                          </label>
                        {/if}
                      </div>
                    {:else}
                      <label
                        for="userLogin"
                        class="cursor-pointer shrink-0 text-white mr-4"
                      >
                        <svg
                          class="w-6 h-6 inline-block"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 16 16"
                          ><path
                            fill="white"
                            d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256l4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73l3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356l-.83 4.73zm4.905-2.767l-3.686 1.894l.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575l-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957l-3.686-1.894a.503.503 0 0 0-.461 0z"
                          /></svg
                        >
                      </label>
                    {/if}
                    <!--End Watchlist-->

                    <!--Start Price Alert-->
                    <label
                      on:click={() => ($openPriceAlert = true)}
                      for={data?.user ? "priceAlertModal" : "userLogin"}
                      class="mr-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-7 h-7 inline-block mt-1"
                        viewBox="0 0 24 24"
                        ><g
                          fill="none"
                          stroke="white"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1.5"
                          ><path d="M3 5.231L6.15 3M21 5.231L17.85 3" /><circle
                            cx="12"
                            cy="13"
                            r="8"
                          /><path d="M9.5 13h5M12 10.5v5" /></g
                        ></svg
                      >
                    </label>
                    <!--End Price Alert -->
                  </div>
                </div>
              </div>
            </div>
            <!--End Mobile Navbar-->

            <div class="pt-14 sm:pt-0 w-full px-3 sm:px-0 lg:pr-3">
              <div
                class="md:flex md:justify-between md:divide-x md:divide-slate-800"
              >
                <!-- Main content -->
                <div class="pb-12 md:pb-20 w-full">
                  <div class="">
                    <!-----Start-Header-CandleChart-Indicators------>

                    <div class="m-auto pl-0 sm:pl-4 overflow-hidden mb-3">
                      <div
                        class="hidden sm:flex flex-row w-full justify-between items-center"
                      >
                        <!--Start Watchlist-->

                        {#if data?.user}
                          <div class="flex flex-col ml-auto mr-2">
                            {#if userWatchList?.length !== 0}
                              <div
                                class="shrink-0 rounded-full sm:hover:bg-white/10 transition ease-out w-12 h-12 relative bg-default flex items-center justify-center"
                              >
                                <label
                                  for="addWatchListModal"
                                  class="cursor-pointer shrink-0"
                                >
                                  {#if isTickerIncluded}
                                    <svg
                                      class="w-7 h-7 inline-block"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 16 16"
                                      ><path
                                        fill="#fff"
                                        d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327l4.898.696c.441.062.612.636.282.95l-3.522 3.356l.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"
                                      /></svg
                                    >
                                  {:else}
                                    <svg
                                      class="w-7 h-7 inline-block"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 16 16"
                                      ><path
                                        fill="white"
                                        d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256l4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73l3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356l-.83 4.73zm4.905-2.767l-3.686 1.894l.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575l-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957l-3.686-1.894a.503.503 0 0 0-.461 0z"
                                      /></svg
                                    >
                                  {/if}
                                </label>
                              </div>
                            {:else if userWatchList?.length === 0}
                              <div
                                class="shrink-0 rounded-full sm:hover:bg-white/10 transition ease-out w-12 h-12 relative bg-default flex items-center justify-center"
                              >
                                <label
                                  on:click={() =>
                                    toggleUserWatchlist("firstList")}
                                  class="cursor-pointer shrink-0"
                                >
                                  {#if isTickerIncluded}
                                    <svg
                                      class="w-7 h-7 inline-block"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 16 16"
                                      ><path
                                        fill="#fff"
                                        d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327l4.898.696c.441.062.612.636.282.95l-3.522 3.356l.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"
                                      /></svg
                                    >
                                  {:else}
                                    <svg
                                      class="w-7 h-7 inline-block"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 16 16"
                                      ><path
                                        fill="white"
                                        d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256l4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73l3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356l-.83 4.73zm4.905-2.767l-3.686 1.894l.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575l-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957l-3.686-1.894a.503.503 0 0 0-.461 0z"
                                      /></svg
                                    >
                                  {/if}
                                </label>
                              </div>
                            {/if}
                          </div>
                        {:else}
                          <div
                            class="shrink-0 ml-auto mr-2 rounded-full sm:hover:bg-white/10 transition ease-out w-12 h-12 relative bg-default flex items-center justify-center"
                          >
                            <label
                              for="userLogin"
                              class="cursor-pointer shrink-0 text-white"
                            >
                              <svg
                                class="w-7 h-7 inline-block"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 16 16"
                                ><path
                                  fill="white"
                                  d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256l4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73l3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356l-.83 4.73zm4.905-2.767l-3.686 1.894l.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575l-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957l-3.686-1.894a.503.503 0 0 0-.461 0z"
                                /></svg
                              >
                            </label>
                          </div>
                        {/if}
                        <!--End Watchlist-->

                        <!--Start Price Alert -->

                        <div
                          class="shrink-0 rounded-full sm:hover:bg-white/10 transition ease-out w-12 h-12 relative bg-default flex items-center justify-center"
                        >
                          <label
                            on:click={() => ($openPriceAlert = true)}
                            for={data?.user ? "priceAlertModal" : "userLogin"}
                            class="cursor-pointer shrink-0 text-white"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              class="w-8 h-8 inline-block"
                              viewBox="0 0 24 24"
                              ><g
                                fill="none"
                                stroke="white"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                                ><path
                                  d="M3 5.231L6.15 3M21 5.231L17.85 3"
                                /><circle cx="12" cy="13" r="8" /><path
                                  d="M9.5 13h5M12 10.5v5"
                                /></g
                              ></svg
                            >
                          </label>
                        </div>
                        <!--End Price Alert -->

                        <div
                          class="hidden sm:flex items-end justify-end absolute right-1.5 top-12 {$scoreComponent ===
                          false
                            ? 'invisible'
                            : ''}"
                        >
                          <AIScore
                            score={data?.getStockDeck?.score}
                            tier={data?.user?.tier}
                          />
                        </div>
                      </div>

                      <!-- svelte-ignore a11y-click-events-have-key-events -->
                      <!-- svelte-ignore a11y-label-has-associated-control -->

                      <div class="flex items-center w-full mt-5">
                        <div
                          class="flex flex-row justify-start w-full items-center"
                        >
                          <div class="flex flex-col items-start w-full">
                            <div
                              class="flex flex-row justify-between items-center w-full sm:-mt-[50px] mb-5 sm:mb-10"
                            >
                              <h1
                                class="text-2xl lg:text-3xl font-bold text-white"
                              >
                                {$displayCompanyName?.length > charNumber
                                  ? $displayCompanyName?.slice(0, charNumber) +
                                    "..."
                                  : $displayCompanyName}
                                <span class="hidden sm:inline-block"
                                  >({$stockTicker?.toUpperCase()})</span
                                >
                              </h1>
                              <div
                                class="sm:hidden items-end justify-end absolute right-3 top-14 {$scoreComponent ===
                                false
                                  ? 'invisible'
                                  : ''}"
                              >
                                <AIScore
                                  score={data?.getStockDeck?.score}
                                  tier={data?.user?.tier}
                                />
                              </div>
                            </div>

                            <div
                              class="-mt-5 sm:-mt-8 mb-5 flex flex-row items-end space-x-2 xs:space-x-3 sm:space-x-5 text-white"
                            >
                              <div class="w-full max-w-[50%] whitespace-nowrap">
                                <div
                                  class="text-3xl sm:text-4xl font-bold {Object?.keys(
                                    prePostData,
                                  )?.length === 0
                                    ? 'inline'
                                    : 'block sm:inline'}"
                                >
                                  {displayLegend?.close}
                                </div>
                                <div
                                  class="font-semibold {Object?.keys(
                                    prePostData,
                                  )?.length === 0
                                    ? 'inline'
                                    : 'block sm:inline'} text-lg xs:text-xl sm:text-2xl"
                                >
                                  <span
                                    class={displayLegend?.change >= 0
                                      ? "before:content-['+'] text-[#00FC50]"
                                      : "text-[#FF2F1F]"}
                                  >
                                    {displayLegend?.change}
                                  </span>
                                  <span
                                    class={displayLegend?.changesPercentage >= 0
                                      ? "text-[#00FC50]"
                                      : "text-[#FF2F1F]"}
                                  >
                                    ({displayLegend?.changesPercentage}%)
                                  </span>
                                </div>
                                <div class="mt-0.5 text-xs sm:text-sm">
                                  {#if !$isOpen}
                                    <span
                                      class="block font-semibold sm:inline mb-0.5 sm:mb-0"
                                      >At close:</span
                                    >
                                  {/if}
                                  {displayLegend?.date}
                                  {#if $isOpen}
                                    <span
                                      class="{Object?.keys(prePostData)
                                        ?.length !== 0
                                        ? 'block sm:inline'
                                        : 'inline'} mb-0.5 sm:mb-0"
                                      >- Market open</span
                                    >
                                  {/if}
                                </div>
                              </div>
                              {#if Object?.keys(prePostData)?.length !== 0 && !$isOpen}
                                <div
                                  class="border-l border-default pl-3 bp:pl-5"
                                >
                                  <div
                                    class="block text-2xl sm:text-[1.7rem] font-semibold leading-5 text-faded sm:inline"
                                  >
                                    {prePostData?.price?.toFixed(2)}
                                  </div>
                                  <div
                                    class="mt-1.5 block text-sm xs:text-base sm:mt-0 sm:inline sm:text-lg {prePostData?.changesPercentage >=
                                    0
                                      ? "before:content-['+'] text-[#00FC50]"
                                      : 'text-[#FF2F1F]'}"
                                  >
                                    {prePostData?.changesPercentage?.toFixed(
                                      2,
                                    )}%
                                  </div>
                                  <div class="mt-1 text-xs sm:flex">
                                    <span class="flex items-center">
                                      {#if prePostData?.time?.includes("AM")}
                                        <svg
                                          class="h-4 w-4 inline text-yellow-500"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                          style="max-width:40px"
                                          ><path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                                          ></path></svg
                                        >
                                      {:else}
                                        <svg
                                          class="h-4 w-4 inline text-blue-400"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                          style="max-width:40px"
                                          ><path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                                          ></path></svg
                                        >
                                      {/if}
                                      <span
                                        class="ml-0.5 whitespace-nowrap font-semibold md:ml-1 mb-0.5 sm:mb-0"
                                        >{prePostData?.time?.includes("AM")
                                          ? "Pre-market"
                                          : "After-hours"}:</span
                                      ></span
                                    >
                                    <span class="sm:ml-1 whitespace-nowrap"
                                      >{prePostData?.time}</span
                                    >
                                  </div>
                                </div>
                              {/if}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-----End-Header-CandleChart-Indicators------>

                    <!--Start Ticker Section-->

                    <nav
                      class="sm:ml-4 border-b-[2px] overflow-x-auto whitespace-nowrap no-scrollbar"
                    >
                      <ul
                        class="flex flex-row items-center w-full text-[1rem] text-white"
                      >
                        <a
                          href={`/stocks/${$stockTicker}`}
                          on:click={() => changeSection("overview")}
                          class="p-2 px-5 cursor-pointer {displaySection ===
                          'overview'
                            ? 'text-white bg-secondary font-semibold'
                            : 'text-gray-400 sm:hover:text-white sm:hover:bg-secondary'}"
                        >
                          Overview
                        </a>
                        <a
                          href={`/stocks/${$stockTicker}/financials`}
                          on:click={() => changeSection("financials")}
                          class="p-2 px-5 cursor-pointer {displaySection ===
                          'financials'
                            ? 'text-white bg-secondary font-semibold'
                            : 'text-gray-400 sm:hover:text-white sm:hover:bg-secondary'}"
                        >
                          Financials
                        </a>
                        <a
                          href={`/stocks/${$stockTicker}/statistics`}
                          on:click={() => changeSection("statistics")}
                          class="p-2 px-5 cursor-pointer {displaySection ===
                          'statistics'
                            ? 'text-white bg-secondary font-semibold'
                            : 'text-gray-400 sm:hover:text-white sm:hover:bg-secondary'}"
                          >Statistics</a
                        >

                        <a
                          href={`/stocks/${$stockTicker}/metrics`}
                          on:click={() => changeSection("metrics")}
                          class="p-2 px-5 cursor-pointer {displaySection ===
                          'metrics'
                            ? 'text-white bg-secondary font-semibold'
                            : 'text-gray-400 sm:hover:text-white sm:hover:bg-secondary'}"
                          >Metrics</a
                        >

                        {#if Object?.keys(data?.getAnalystSummary ?? {})?.length > 0}
                          <a
                            href={`/stocks/${$stockTicker}/forecast`}
                            on:click={() => changeSection("forecast")}
                            class="p-2 px-5 cursor-pointer {displaySection ===
                            'forecast'
                              ? 'text-white bg-secondary font-semibold'
                              : 'text-gray-400 sm:hover:text-white sm:hover:bg-secondary'}"
                          >
                            Forecast
                          </a>
                        {/if}
                        <a
                          href={`/stocks/${$stockTicker}/dark-pool`}
                          on:click={() => changeSection("dark-pool")}
                          class="p-2 px-5 cursor-pointer {displaySection ===
                          'dark-pool'
                            ? 'text-white bg-secondary font-semibold'
                            : 'text-gray-400 sm:hover:text-white sm:hover:bg-secondary'}"
                        >
                          Dark Pool
                        </a>
                        <a
                          href={`/stocks/${$stockTicker}/options`}
                          on:click={() => changeSection("options")}
                          class="p-2 px-5 cursor-pointer {displaySection ===
                          'options'
                            ? 'text-white bg-secondary font-semibold'
                            : 'text-gray-400 sm:hover:text-white sm:hover:bg-secondary'}"
                        >
                          Options
                        </a>

                        <a
                          href={`/stocks/${$stockTicker}/insider`}
                          on:click={() => changeSection("insider")}
                          class="p-2 px-5 cursor-pointer {displaySection ===
                          'insider'
                            ? 'text-white bg-secondary font-semibold'
                            : 'text-gray-400 sm:hover:text-white sm:hover:bg-secondary'}"
                        >
                          Insider
                        </a>
                        <a
                          href={`/stocks/${$stockTicker}/dividends`}
                          on:click={() => changeSection("dividends")}
                          class="p-2 px-5 cursor-pointer {displaySection ===
                          'dividends'
                            ? 'text-white bg-secondary font-semibold'
                            : 'text-gray-400 sm:hover:text-white sm:hover:bg-secondary'}"
                        >
                          Dividends
                        </a>
                        <a
                          href={`/stocks/${$stockTicker}/history`}
                          on:click={() => changeSection("history")}
                          class="p-2 px-5 cursor-pointer {displaySection ===
                          'history'
                            ? 'text-white bg-secondary font-semibold'
                            : 'text-gray-400 sm:hover:text-white sm:hover:bg-secondary'}"
                        >
                          History
                        </a>
                        <a
                          href={`/stocks/${$stockTicker}/profile`}
                          on:click={() => changeSection("profile")}
                          class="p-2 px-5 cursor-pointer {displaySection ===
                          'profile'
                            ? 'text-white bg-secondary font-semibold'
                            : 'text-gray-400 sm:hover:text-white sm:hover:bg-secondary'}"
                        >
                          Profile
                        </a>
                      </ul>
                    </nav>

                    <!--Start-Main Content-->

                    <slot />
                    <!--End Main Content-->
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</body>

<!--Start Login Modal-->
{#if LoginPopup}
  <LoginPopup form={$globalForm} />
{/if}
<!--End Login Modal-->

<!--Start SellTrade Modal-->
<PriceAlert {data} ticker={$stockTicker} assetType="stock" />

<!--Start Add Watchlist Modal-->
<input type="checkbox" id="addWatchListModal" class="modal-toggle" />

<dialog id="addWatchListModal" class="modal bg-[#000]/40 p-3 sm:p-0">
  <label
    id="addWatchListModal"
    for="addWatchListModal"
    class="cursor-pointer modal-backdrop"
  ></label>

  <div class="modal-box rounded-md w-full bg-secondary border border-gray-600">
    <label
      for="addWatchListModal"
      class="cursor-pointer bg-secondary absolute right-5 top-2 text-[1rem] sm:text-[1.5rem] text-white"
    >
      ✕
    </label>

    <div class="text-white">
      <h3 class="font-semibold text-lg sm:text-xl mb-10">Add to Watchlist</h3>

      <div class="flex flex-col items-center w-full max-w-3xl bg-secondary">
        {#each userWatchList as item}
          <label
            on:click|stopPropagation={() => toggleUserWatchlist(item?.id)}
            class="cursor-pointer w-full flex flex-row justify-start items-center mb-5"
          >
            <div
              class="flex flex-row items-center w-full border p-3 rounded-md {item?.ticker?.includes(
                $stockTicker,
              )
                ? 'border border-gray-400'
                : 'border-gray-600'}"
            >
              <div class="flex flex-col items-center w-full">
                <span class="ml-1 text-white mr-auto">
                  {item?.title}
                </span>
                <span class="ml-1 text-white text-sm mr-auto">
                  {item?.ticker?.length}
                  {item?.ticker?.length !== 1 ? "Companies" : "Company"}
                </span>
              </div>

              <div
                class="rounded-full w-8 h-8 relative border border-[#737373]"
              >
                {#if item?.ticker?.includes($stockTicker)}
                  <svg
                    class="w-full h-full rounded-full"
                    viewBox="0 0 48 48"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    fill="#09090B000"
                    ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
                      id="SVGRepo_tracerCarrier"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></g><g id="SVGRepo_iconCarrier">
                      <!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
                      <title>ic_fluent_checkmark_circle_48_filled</title>
                      <desc>Created with Sketch.</desc>
                      <g
                        stroke="none"
                        stroke-width="1"
                        fill="none"
                        fill-rule="evenodd"
                      >
                        <g
                          id="ic_fluent_checkmark_circle_48_filled"
                          fill="#fff"
                          fill-rule="nonzero"
                        >
                          <path
                            d="M24,4 C35.045695,4 44,12.954305 44,24 C44,35.045695 35.045695,44 24,44 C12.954305,44 4,35.045695 4,24 C4,12.954305 12.954305,4 24,4 Z M32.6338835,17.6161165 C32.1782718,17.1605048 31.4584514,17.1301307 30.9676119,17.5249942 L30.8661165,17.6161165 L20.75,27.732233 L17.1338835,24.1161165 C16.6457281,23.6279612 15.8542719,23.6279612 15.3661165,24.1161165 C14.9105048,24.5717282 14.8801307,25.2915486 15.2749942,25.7823881 L15.3661165,25.8838835 L19.8661165,30.3838835 C20.3217282,30.8394952 21.0415486,30.8698693 21.5323881,30.4750058 L21.6338835,30.3838835 L32.6338835,19.3838835 C33.1220388,18.8957281 33.1220388,18.1042719 32.6338835,17.6161165 Z"
                          >
                          </path>
                        </g>
                      </g>
                    </g></svg
                  >
                {/if}
              </div>
            </div>
          </label>
        {/each}
      </div>
    </div>
  </div>
</dialog>

<!--End Add Watchlist Modal-->

<style lang="scss">
  .scrollbar {
    display: grid;
    grid-gap: 17px;
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
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

  ::-webkit-scrollbar {
    height: 7px;
    width: 10px;
    background: #09090b;
  }

  ::-webkit-scrollbar-thumb {
    background: #6b6f79;
    -webkit-border-radius: 1ex;
    -webkit-box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.75);
  }

  ::-webkit-scrollbar-corner {
    background: #09090b;
  }
</style>
