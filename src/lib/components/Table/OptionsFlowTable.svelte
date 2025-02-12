<script lang="ts">
  import { screenWidth } from "$lib/store";
  import { abbreviateNumberWithColor } from "$lib/utils";

  import VirtualList from "svelte-tiny-virtual-list";
  import HoverStockChart from "$lib/components/HoverStockChart.svelte";
  import toast from "svelte-french-toast";

  export let data;
  export let optionsWatchlist;
  export let displayedData = [];
  export let filteredData = [];
  export let rawData = [];

  let animationClass = "";
  let animationId = "";

  function formatTime(timeString) {
    // Split the time string into components
    const [hours, minutes, seconds] = timeString?.split(":").map(Number);

    // Determine AM or PM
    const period = hours >= 12 ? "PM" : "AM";

    // Convert hours from 24-hour to 12-hour format
    const formattedHours = hours % 12 || 12; // Converts 0 to 12 for midnight

    // Format the time string
    const formattedTimeString = `${formattedHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${period}`;

    return formattedTimeString;
  }

  function reformatDate(dateString) {
    return (
      dateString.substring(5, 7) +
      "/" +
      dateString.substring(8) +
      "/" +
      dateString.substring(2, 4)
    );
  }

  async function addToWatchlist(itemId) {
    if (data?.user?.tier === "Pro") {
      try {
        const postData = {
          itemIdList: [itemId],
          id: optionsWatchlist?.id,
        };

        if (optionsWatchlist?.optionsId?.includes(itemId)) {
          // Remove ticker from the watchlist.
          optionsWatchlist.optionsId = optionsWatchlist?.optionsId.filter(
            (item) => item !== itemId,
          );
        } else {
          // Add ticker to the watchlist.
          animationId = itemId;
          animationClass = "heartbeat";
          const removeAnimation = () => {
            animationId = "";
            animationClass = "";
          };
          optionsWatchlist.optionsId = [...optionsWatchlist?.optionsId, itemId];
          const heartbeatElement = document.getElementById(itemId);
          if (heartbeatElement) {
            // Only add listener if it's not already present
            if (!heartbeatElement.classList.contains("animation-added")) {
              heartbeatElement.addEventListener(
                "animationend",
                removeAnimation,
              );
              heartbeatElement.classList.add("animation-added"); // Prevent re-adding listener
            }
          }
        }

        const response = await fetch("/api/update-options-watchlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        });

        optionsWatchlist.id = await response.json();
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
      } catch (error) {
        console.error("An error occurred:", error);
        // Handle the error appropriately (e.g., show an error message to the user)
      }
    } else {
      toast.error("Only for Pro Members", {
        style:
          "border-radius: 5px; background: #fff; color: #000; border-color: #4B5563; font-size: 15px;",
      });
    }
  }

  let sortOrders = {
    time: "none",
    ticker: "none",
    expiry: "none",
    dte: "none",
    strike: "none",
    callPut: "none",
    sentiment: "none",
    spot: "none",
    price: "none",
    premium: "none",
    type: "none",
    exec: "none",
    vol: "none",
    oi: "none",
  };

  // Generalized sorting function
  function sortData(key) {
    // Reset all other keys to 'none' except the current key
    for (const k in sortOrders) {
      if (k !== key) {
        sortOrders[k] = "none";
      }
    }

    // Cycle through 'none', 'asc', 'desc' for the clicked key
    const orderCycle = ["none", "asc", "desc"];
    const currentOrderIndex = orderCycle.indexOf(sortOrders[key]);
    sortOrders[key] = orderCycle[(currentOrderIndex + 1) % orderCycle.length];

    const sortOrder = sortOrders[key];
    const originalData =
      filteredData?.length !== 0 ? [...filteredData] : [...rawData];

    // Reset to original data when 'none'
    if (sortOrder === "none") {
      displayedData = originalData;
      return;
    }

    const compareFunctions = {
      time: (a, b) => {
        const timeA = new Date("1970-01-01T" + a.time).getTime();
        const timeB = new Date("1970-01-01T" + b.time).getTime();
        return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
      },
      ticker: (a, b) => {
        const tickerA = a.ticker.toUpperCase();
        const tickerB = b.ticker.toUpperCase();
        return sortOrder === "asc"
          ? tickerA.localeCompare(tickerB)
          : tickerB.localeCompare(tickerA);
      },
      expiry: (a, b) => {
        const timeA = new Date(a.date_expiration);
        const timeB = new Date(b.date_expiration);
        return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
      },
      dte: (a, b) => {
        const timeA = new Date(a.date_expiration);
        const timeB = new Date(b.date_expiration);
        return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
      },
      strike: (a, b) => {
        const strikeA = parseFloat(a.strike_price);
        const strikeB = parseFloat(b.strike_price);
        return sortOrder === "asc" ? strikeA - strikeB : strikeB - strikeA;
      },
      spot: (a, b) => {
        const spotA = parseFloat(a.underlying_price);
        const spotB = parseFloat(b.underlying_price);
        return sortOrder === "asc" ? spotA - spotB : spotB - spotA;
      },
      price: (a, b) => {
        const priceA = parseFloat(a.price);
        const priceB = parseFloat(b.price);
        return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
      },
      premium: (a, b) => {
        const premiumA = parseFloat(a.cost_basis);
        const premiumB = parseFloat(b.cost_basis);
        return sortOrder === "asc" ? premiumA - premiumB : premiumB - premiumA;
      },
      size: (a, b) => {
        const volA = parseFloat(a?.size);
        const volB = parseFloat(b?.size);
        return sortOrder === "asc" ? volA - volB : volB - volA;
      },
      vol: (a, b) => {
        const volA = parseFloat(a.volume);
        const volB = parseFloat(b.volume);
        return sortOrder === "asc" ? volA - volB : volB - volA;
      },
      oi: (a, b) => {
        const oiA = parseFloat(a.open_interest);
        const oiB = parseFloat(b.open_interest);
        return sortOrder === "asc" ? oiA - oiB : oiB - oiA;
      },
      callPut: (a, b) => {
        const callPutA = a.put_call?.toUpperCase();
        const callPutB = b.put_call?.toUpperCase();
        return sortOrder === "asc"
          ? callPutA.localeCompare(callPutB)
          : callPutB.localeCompare(callPutA);
      },
      sentiment: (a, b) => {
        const sentimentOrder = { BULLISH: 1, NEUTRAL: 2, BEARISH: 3 };
        const sentimentA = sentimentOrder[a?.sentiment?.toUpperCase()] || 4;
        const sentimentB = sentimentOrder[b?.sentiment?.toUpperCase()] || 4;
        return sortOrder === "asc"
          ? sentimentA - sentimentB
          : sentimentB - sentimentA;
      },
      type: (a, b) => {
        const typeOrder = { SWEEP: 1, TRADE: 2 };
        const typeA = typeOrder[a.option_activity_type?.toUpperCase()] || 3;
        const typeB = typeOrder[b.option_activity_type?.toUpperCase()] || 3;
        return sortOrder === "asc" ? typeA - typeB : typeB - typeA;
      },
      exec: (a, b) => {
        const tickerA = a?.execution_estimate?.toUpperCase();
        const tickerB = b?.execution_estimate?.toUpperCase();
        return sortOrder === "asc"
          ? tickerA.localeCompare(tickerB)
          : tickerB.localeCompare(tickerA);
      },
    };

    // Sort using the appropriate comparison function
    displayedData = originalData.sort(compareFunctions[key]);
  }
</script>

<div class="table-container">
  <div class="table">
    <VirtualList
      width="100%"
      height={$screenWidth < 640
        ? data?.user?.tier === "Pro"
          ? 550
          : 250
        : data?.user?.tier === "Pro"
          ? 850
          : 250}
      itemCount={displayedData.length}
      itemSize={40}
    >
      <div slot="header" class="tr th sticky z-40 top-0 border border-gray-800">
        <!-- Table headers -->
        <div
          on:click={() => sortData("time")}
          class="td cursor-pointer select-none bg-default text-white font-bold text-xs text-start uppercase"
        >
          Time
          <svg
            class="flex-shrink-0 w-4 h-4 inline-block {sortOrders['time'] ===
            'asc'
              ? 'rotate-180'
              : ''} "
            viewBox="0 0 20 20"
            fill="currentColor"
            style="max-width:50px"
            ><path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path></svg
          >
        </div>
        <div
          on:click={() => sortData("ticker")}
          class="td cursor-pointer select-none bg-default font-bold text-white text-xs text-start uppercase"
        >
          Symbol
          <svg
            class="flex-shrink-0 w-4 h-4 inline-block {sortOrders['ticker'] ===
            'asc'
              ? 'rotate-180'
              : sortOrders['ticker'] === 'desc'
                ? ''
                : 'hidden'} "
            viewBox="0 0 20 20"
            fill="currentColor"
            style="max-width:50px"
            ><path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path></svg
          >
        </div>
        <div
          class="td select-none bg-default text-white font-bold text-xs text-start uppercase"
        >
          Save
        </div>
        <div
          on:click={() => sortData("expiry")}
          class="td cursor-pointer select-none bg-default text-white font-bold text-xs text-start uppercase"
        >
          Expiry
          <svg
            class="flex-shrink-0 w-4 h-4 inline-block {sortOrders['expiry'] ===
            'asc'
              ? 'rotate-180'
              : sortOrders['expiry'] === 'desc'
                ? ''
                : 'hidden'} "
            viewBox="0 0 20 20"
            fill="currentColor"
            style="max-width:50px"
            ><path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path></svg
          >
        </div>
        <div
          on:click={() => sortData("dte")}
          class="td cursor-pointer select-none bg-default text-white font-bold text-xs text-start uppercase"
        >
          DTE
          <svg
            class="flex-shrink-0 w-4 h-4 inline-block {sortOrders['dte'] ===
            'asc'
              ? 'rotate-180'
              : sortOrders['dte'] === 'desc'
                ? ''
                : 'hidden'} "
            viewBox="0 0 20 20"
            fill="currentColor"
            style="max-width:50px"
            ><path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path></svg
          >
        </div>
        <div
          on:click={() => sortData("strike")}
          class="td cursor-pointer select-none bg-default text-white font-bold text-xs text-start uppercase"
        >
          Strike
          <svg
            class="flex-shrink-0 w-4 h-4 inline-block {sortOrders['strike'] ===
            'asc'
              ? 'rotate-180'
              : sortOrders['strike'] === 'desc'
                ? ''
                : 'hidden'} "
            viewBox="0 0 20 20"
            fill="currentColor"
            style="max-width:50px"
            ><path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path></svg
          >
        </div>
        <div
          on:click={() => sortData("callPut")}
          class="td cursor-pointer select-none bg-default text-white font-bold text-xs text-start uppercase"
        >
          C/P
          <svg
            class="flex-shrink-0 w-4 h-4 inline-block {sortOrders['callPut'] ===
            'asc'
              ? 'rotate-180'
              : sortOrders['callPut'] === 'desc'
                ? ''
                : 'hidden'} "
            viewBox="0 0 20 20"
            fill="currentColor"
            style="max-width:50px"
            ><path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path></svg
          >
        </div>
        <div
          on:click={() => sortData("sentiment")}
          class="td cursor-pointer select-none bg-default text-white font-bold text-xs text-start uppercase"
        >
          Sent.
          <svg
            class="flex-shrink-0 w-4 h-4 inline-block {sortOrders[
              'sentiment'
            ] === 'asc'
              ? 'rotate-180'
              : sortOrders['sentiment'] === 'desc'
                ? ''
                : 'hidden'} "
            viewBox="0 0 20 20"
            fill="currentColor"
            style="max-width:50px"
            ><path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path></svg
          >
        </div>
        <div
          on:click={() => sortData("spot")}
          class="td cursor-pointer select-none bg-default text-white font-bold text-xs text-start uppercase"
        >
          Spot
          <svg
            class="flex-shrink-0 w-4 h-4 inline-block {sortOrders['spot'] ===
            'asc'
              ? 'rotate-180'
              : sortOrders['spot'] === 'desc'
                ? ''
                : 'hidden'} "
            viewBox="0 0 20 20"
            fill="currentColor"
            style="max-width:50px"
            ><path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path></svg
          >
        </div>
        <div
          on:click={() => sortData("price")}
          class="td cursor-pointer select-none bg-default text-white font-bold text-xs text-start uppercase"
        >
          Price
          <svg
            class="flex-shrink-0 w-4 h-4 inline-block {sortOrders['price'] ===
            'asc'
              ? 'rotate-180'
              : sortOrders['price'] === 'desc'
                ? ''
                : 'hidden'} "
            viewBox="0 0 20 20"
            fill="currentColor"
            style="max-width:50px"
            ><path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path></svg
          >
        </div>
        <div
          on:click={() => sortData("premium")}
          class="td cursor-pointer select-none bg-default text-white font-bold text-xs text-start uppercase"
        >
          Prem
          <svg
            class="flex-shrink-0 w-4 h-4 inline-block {sortOrders['premium'] ===
            'asc'
              ? 'rotate-180'
              : sortOrders['premium'] === 'desc'
                ? ''
                : 'hidden'} "
            viewBox="0 0 20 20"
            fill="currentColor"
            style="max-width:50px"
            ><path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path></svg
          >
        </div>
        <div
          on:click={() => sortData("type")}
          class="td cursor-pointer select-none bg-default text-white font-bold text-xs text-start uppercase"
        >
          Type
          <svg
            class="flex-shrink-0 w-4 h-4 inline-block {sortOrders['type'] ===
            'asc'
              ? 'rotate-180'
              : sortOrders['type'] === 'desc'
                ? ''
                : 'hidden'} "
            viewBox="0 0 20 20"
            fill="currentColor"
            style="max-width:50px"
            ><path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path></svg
          >
        </div>
        <div
          on:click={() => sortData("exec")}
          class="td cursor-pointer select-none bg-default text-white font-bold text-xs text-start uppercase"
        >
          Exec
          <svg
            class="flex-shrink-0 w-4 h-4 inline-block {sortOrders['exec'] ===
            'asc'
              ? 'rotate-180'
              : sortOrders['exec'] === 'desc'
                ? ''
                : 'hidden'} "
            viewBox="0 0 20 20"
            fill="currentColor"
            style="max-width:50px"
            ><path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path></svg
          >
        </div>
        <div
          on:click={() => sortData("size")}
          class="td cursor-pointer select-none bg-default text-white font-bold text-xs text-start uppercase"
        >
          Size
          <svg
            class="flex-shrink-0 w-4 h-4 inline-block {sortOrders['size'] ===
            'asc'
              ? 'rotate-180'
              : sortOrders['size'] === 'desc'
                ? ''
                : 'hidden'} "
            viewBox="0 0 20 20"
            fill="currentColor"
            style="max-width:50px"
            ><path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path></svg
          >
        </div>
        <div
          on:click={() => sortData("vol")}
          class="td cursor-pointer select-none bg-default text-white font-bold text-xs text-start uppercase"
        >
          Vol
          <svg
            class="flex-shrink-0 w-4 h-4 inline-block {sortOrders['vol'] ===
            'asc'
              ? 'rotate-180'
              : sortOrders['vol'] === 'desc'
                ? ''
                : 'hidden'} "
            viewBox="0 0 20 20"
            fill="currentColor"
            style="max-width:50px"
            ><path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path></svg
          >
        </div>
        <div
          on:click={() => sortData("oi")}
          class="td cursor-pointer select-none bg-default text-white font-bold text-xs text-start uppercase"
        >
          OI
          <svg
            class="flex-shrink-0 w-4 h-4 inline-block {sortOrders['oi'] ===
            'asc'
              ? 'rotate-180'
              : sortOrders['oi'] === 'desc'
                ? ''
                : 'hidden'} "
            viewBox="0 0 20 20"
            fill="currentColor"
            style="max-width:50px"
            ><path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path></svg
          >
        </div>
      </div>

      <div
        slot="item"
        let:index
        let:style
        {style}
        class="tr {index % 2 === 0 ? 'bg-[#19191F]' : 'bg-[#121217]'} {index +
          1 ===
          rawData?.length && data?.user?.tier !== 'Pro'
          ? 'opacity-[0.3]'
          : ''}"
      >
        <!-- Row data -->

        <div
          style="justify-content: center;"
          class="td text-white text-xs sm:text-sm text-start m-auto whitespace-nowrap"
        >
          {formatTime(displayedData[index]?.time)}
        </div>
        <div
          on:click|stopPropagation
          style="justify-content: center;"
          class="td text-sm sm:hover:text-white sm:text-[1rem] text-blue-400 font-normal"
        >
          <HoverStockChart
            symbol={displayedData[index]?.ticker}
            assetType={displayedData[index]?.underlying_type}
          />
        </div>

        <div
          id={displayedData[index]?.id}
          on:click|stopPropagation={() =>
            addToWatchlist(displayedData[index]?.id)}
          style="justify-content: center;"
          class="td {optionsWatchlist.optionsId?.includes(
            displayedData[index]?.id,
          )
            ? 'text-[#FBCE3C]'
            : 'text-white'}"
        >
          <svg
            class="{displayedData[index]?.id === animationId
              ? animationClass
              : ''} w-4 sm:w-5 sm:h-5 inline-block cursor-pointer flex-shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            ><path
              fill="currentColor"
              d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327l4.898.696c.441.062.612.636.282.95l-3.522 3.356l.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"
            /></svg
          >
        </div>

        <div
          style="justify-content: center;"
          class="td text-sm sm:text-[1rem] text-white text-start"
        >
          {reformatDate(displayedData[index]?.date_expiration)}
        </div>

        <div
          style="justify-content: center;"
          class="td text-sm sm:text-[1rem] text-white text-start"
        >
          {displayedData[index]?.dte < 0
            ? "expired"
            : displayedData[index]?.dte + "d"}
        </div>

        <div
          style="justify-content: center;"
          class="td text-sm sm:text-[1rem] text-white text-start"
        >
          {displayedData[index]?.strike_price}
        </div>

        <div
          style="justify-content: center;"
          class="td text-sm sm:text-[1rem] {displayedData[index]?.put_call ===
          'Calls'
            ? 'text-[#00FC50]'
            : 'text-[#c44536]'} text-start"
        >
          {displayedData[index]?.put_call}
        </div>

        <div
          style="justify-content: center;"
          class="td text-sm sm:text-[1rem] {displayedData[index]?.sentiment ===
          'Bullish'
            ? 'text-[#00FC50]'
            : displayedData[index]?.sentiment === 'Bearish'
              ? 'text-[#FF2F1F]'
              : 'text-[#C6A755]'} text-start"
        >
          {displayedData[index]?.sentiment}
        </div>

        <div
          style="justify-content: center;"
          class="td text-sm sm:text-[1rem] text-start text-white"
        >
          {displayedData[index]?.underlying_price}
        </div>

        <div
          style="justify-content: center;"
          class="td text-sm sm:text-[1rem] text-start text-white"
        >
          {displayedData[index]?.price}
        </div>

        <div
          style="justify-content: center;"
          class="td text-sm sm:text-[1rem] text-start text-white"
        >
          {@html abbreviateNumberWithColor(
            displayedData[index]?.cost_basis,
            false,
            true,
          )}
        </div>

        <div
          style="justify-content: center;"
          class="td text-sm sm:text-[1rem] uppercase text-start {displayedData[
            index
          ]?.option_activity_type === 'Sweep'
            ? 'text-[#C6A755]'
            : 'text-[#976DB7]'}"
        >
          {displayedData[index]?.option_activity_type}
        </div>

        <div
          style="justify-content: center;"
          class="td text-sm sm:text-[1rem] uppercase text-start {[
            'At Ask',
            'Above Ask',
          ]?.includes(displayedData[index]?.execution_estimate)
            ? 'text-[#C8A32D]'
            : ['At Bid', 'Below Bid']?.includes(
                  displayedData[index]?.execution_estimate,
                )
              ? 'text-[#8F82FE]'
              : 'text-[#A98184]'}"
        >
          {displayedData[index]?.execution_estimate
            ?.replace("At", "")
            ?.replace("Above", "")
            ?.replace("Below", "")
            ?.replace("Midpoint", "Mid")}
        </div>

        <div
          style="justify-content: center;"
          class="td text-sm sm:text-[1rem] text-white text-end"
        >
          {new Intl.NumberFormat("en", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(displayedData[index]?.size)}
        </div>

        <div
          style="justify-content: center;"
          class="td text-sm sm:text-[1rem] text-white text-end"
        >
          {new Intl.NumberFormat("en", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(displayedData[index]?.volume)}
        </div>

        <div
          style="justify-content: center;"
          class="td text-sm sm:text-[1rem] text-white text-end"
        >
          {new Intl.NumberFormat("en", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(displayedData[index]?.open_interest)}
        </div>
      </div>
    </VirtualList>
  </div>
</div>

<style>
  .table-container {
    width: 100%;
    overflow-x: auto;
  }

  .table :global(.virtual-list-inner) {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  @media (max-width: 768px) {
    .table {
      width: 1000px;
    }
  }

  .table .virtual-list-inner {
    flex-flow: column nowrap;
    font-size: 0.8rem;
    line-height: 1.5;
    flex: 1 1 auto;
  }

  .th {
    display: none;
    font-weight: 700;
  }

  .th > .td {
    white-space: nowrap;
    justify-content: center;
  }

  .tr {
    width: 100%;
    display: flex;
    flex-flow: row nowrap;
  }

  .tr.even {
    background-color: #2a2e39;
  }

  .tr.odd {
    background-color: #09090b;
  }

  .td {
    display: flex;
    flex-flow: row nowrap;
    flex-grow: 1;
    flex-basis: 0;
    padding: 0.5em;
    word-break: break-word;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0px;
    white-space: nowrap;
  }

  .heartbeat {
    animation: heartbeat-animation 0.3s;
    animation-timing-function: ease-in-out;
  }

  @keyframes heartbeat-animation {
    0% {
      transform: rotate(0deg) scale(0.95);
    }
    25% {
      transform: rotate(10deg) scale(1.05);
    }
    50% {
      transform: rotate(0deg) scale(1.2);
    }
    75% {
      transform: rotate(-10deg) scale(1.05);
    }
    100% {
      transform: rotate(0deg) scale(0.95);
    }
  }
</style>
