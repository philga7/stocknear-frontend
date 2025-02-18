<script lang="ts">
  import { screenWidth } from "$lib/store";
  import { abbreviateNumberWithColor, sectorNavigation } from "$lib/utils";

  import VirtualList from "svelte-tiny-virtual-list";
  import HoverStockChart from "$lib/components/HoverStockChart.svelte";

  export let data;
  export let displayedData = [];
  export let filteredData = [];
  export let rawData = [];

  function formatToNewYorkTime(isoString) {
    const date = new Date(isoString);

    // Get the date components in New York time zone
    const options = {
      year: "2-digit", // Shortened year
      month: "numeric",
      day: "2-digit", // Ensures day has two digits
      hour: "numeric",
      minute: "numeric",
      timeZone: "America/New_York",
      hour12: true, // Enable AM/PM format
    };

    // Format date for New York timezone
    const formatter = new Intl.DateTimeFormat("en-US", options);
    const parts = formatter.formatToParts(date);

    const year = parts.find((p) => p.type === "year").value;
    const month = parts.find((p) => p.type === "month").value;
    const day = parts.find((p) => p.type === "day").value.padStart(2, "0");
    const hour = parts.find((p) => p.type === "hour").value.padStart(2, "0");
    const minute = parts
      .find((p) => p.type === "minute")
      .value.padStart(2, "0");
    const ampm = parts.find((p) => p.type === "dayPeriod").value; // AM/PM

    return `${month}/${day}/${year} ${hour}:${minute} ${ampm}`;
  }

  let sortOrders = {
    date: "none",
    ticker: "none",
    price: "none",
    premium: "none",
    assetType: "none",
    volume: "none",
    sizeAvgVolRatio: "none",
    sizeVolRatio: "none",
    size: "none",
    sector: "none",
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
      ticker: (a, b) => {
        const tickerA = a.ticker.toUpperCase();
        const tickerB = b.ticker.toUpperCase();
        return sortOrder === "asc"
          ? tickerA.localeCompare(tickerB)
          : tickerB.localeCompare(tickerA);
      },
      sector: (a, b) => {
        const sectorA = a.sector || ""; // Default to empty string if undefined
        const sectorB = b.sector || ""; // Default to empty string if undefined

        // Check if either sector is an empty string and ensure it's placed at the bottom
        if (sectorA === "" && sectorB !== "") return 1; // Move empty string to the bottom
        if (sectorB === "" && sectorA !== "") return -1; // Move empty string to the bottom

        // If both are non-empty, sort normally
        const stringA = sectorA.toUpperCase();
        const stringB = sectorB.toUpperCase();

        return sortOrder === "asc"
          ? stringA.localeCompare(stringB)
          : stringB.localeCompare(stringA);
      },
      date: (a, b) => {
        const timeA = new Date(a.date);
        const timeB = new Date(b.date);
        return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
      },
      price: (a, b) => {
        const priceA = parseFloat(a.price);
        const priceB = parseFloat(b.price);
        return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
      },
      premium: (a, b) => {
        const premiumA = parseFloat(a.premium);
        const premiumB = parseFloat(b.premium);
        return sortOrder === "asc" ? premiumA - premiumB : premiumB - premiumA;
      },
      size: (a, b) => {
        const volA = parseFloat(a?.size);
        const volB = parseFloat(b?.size);
        return sortOrder === "asc" ? volA - volB : volB - volA;
      },
      volume: (a, b) => {
        const volA = parseFloat(a.volume);
        const volB = parseFloat(b.volume);
        return sortOrder === "asc" ? volA - volB : volB - volA;
      },
      sizeVolRatio: (a, b) => {
        const volA = parseFloat(a.sizeVolRatio);
        const volB = parseFloat(b.sizeVolRatio);
        return sortOrder === "asc" ? volA - volB : volB - volA;
      },
      sizeAvgVolRatio: (a, b) => {
        const volA = parseFloat(a.sizeAvgVolRatio);
        const volB = parseFloat(b.sizeAvgVolRatio);
        return sortOrder === "asc" ? volA - volB : volB - volA;
      },
      assetType: (a, b) => {
        const typeOrder = { STOCK: 1, ETF: 2 };
        const typeA = typeOrder[a.assetType?.toUpperCase()] || 3;
        const typeB = typeOrder[b.assetType?.toUpperCase()] || 3;
        return sortOrder === "asc" ? typeA - typeB : typeB - typeA;
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
      <div
        slot="header"
        class="tr th m-auto sticky z-40 top-0 border border-gray-800"
      >
        <!-- Table headers -->
        <div
          on:click={() => sortData("date")}
          class="td cursor-pointer select-none bg-default text-white font-bold text-xs text-start uppercase"
        >
          Date
          <svg
            class="flex-shrink-0 w-4 h-4 inline-block {sortOrders['date'] ===
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
          Premium
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
          on:click={() => sortData("volume")}
          class="td cursor-pointer select-none bg-default text-white font-bold text-xs text-start uppercase"
        >
          Volume
          <svg
            class="flex-shrink-0 w-4 h-4 inline-block {sortOrders['volume'] ===
            'asc'
              ? 'rotate-180'
              : sortOrders['volume'] === 'desc'
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
          on:click={() => sortData("sizeVolRatio")}
          class="td cursor-pointer select-none bg-default text-white font-bold text-xs text-start uppercase"
        >
          % Size / Vol
          <svg
            class="flex-shrink-0 w-4 h-4 inline-block {sortOrders[
              'sizeVolRatio'
            ] === 'asc'
              ? 'rotate-180'
              : sortOrders['sizeVolRatio'] === 'desc'
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
          on:click={() => sortData("sizeAvgVolRatio")}
          class="td cursor-pointer select-none bg-default text-white font-bold text-xs text-start uppercase"
        >
          % Size / Avg Vol
          <svg
            class="flex-shrink-0 w-4 h-4 inline-block {sortOrders[
              'sizeAvgVolRatio'
            ] === 'asc'
              ? 'rotate-180'
              : sortOrders['sizeAvgVolRatio'] === 'desc'
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
          on:click={() => sortData("sector")}
          class="td cursor-pointer select-none bg-default text-white font-bold text-xs text-start uppercase"
        >
          Sector
          <svg
            class="flex-shrink-0 w-4 h-4 inline-block {sortOrders['sector'] ===
            'asc'
              ? 'rotate-180'
              : sortOrders['sector'] === 'desc'
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
          on:click={() => sortData("assetType")}
          class="td cursor-pointer select-none bg-default text-white font-bold text-xs text-start uppercase"
        >
          Asset Type
          <svg
            class="flex-shrink-0 w-4 h-4 inline-block {sortOrders[
              'assetType'
            ] === 'asc'
              ? 'rotate-180'
              : sortOrders['assetType'] === 'desc'
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
          style="justify-content: center; "
          class=" td w-full text-white text-xs sm:text-sm whitespace-nowrap m-auto"
        >
          {$screenWidth < 640
            ? formatToNewYorkTime(displayedData[index]?.date)?.slice(0, -3)
            : formatToNewYorkTime(displayedData[index]?.date)}
        </div>
        <div
          on:click|stopPropagation
          style="justify-content: center;"
          class="td text-sm sm:hover:text-white sm:text-[1rem] text-blue-400 font-normal"
        >
          <HoverStockChart
            symbol={displayedData[index]?.ticker}
            assetType={displayedData[index]?.assetType}
          />
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
            displayedData[index]?.premium,
            true,
            true,
          )}
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
          {@html abbreviateNumberWithColor(
            displayedData[index]?.volume,
            false,
            true,
          )}
        </div>

        <div
          style="justify-content: center;"
          class="td text-sm sm:text-[1rem] text-white text-end"
        >
          {displayedData[index]?.sizeVolRatio > 0.01
            ? displayedData[index]?.sizeVolRatio?.toFixed(2) + "%"
            : "< 0.01%"}
        </div>

        <div
          style="justify-content: center;"
          class="td text-sm sm:text-[1rem] text-white text-end"
        >
          {displayedData[index]?.sizeAvgVolRatio > 0.01
            ? displayedData[index]?.sizeAvgVolRatio?.toFixed(2) + "%"
            : "< 0.01%"}
        </div>

        <div
          style="justify-content: start;"
          class="td text-sm sm:text-[1rem] text-white text-start"
        >
          <a
            href={sectorNavigation?.find(
              (item) => item?.title === displayedData[index]?.sector,
            )?.link}
            class="sm:hover:text-blue-400 text-white"
            >{displayedData[index]?.sector?.length > 13
              ? displayedData[index]?.sector?.slice(0, 13) + "..."
              : displayedData[index]?.sector}</a
          >
        </div>

        <div
          style="justify-content: center;"
          class="td text-sm sm:text-[1rem] text-white text-end"
        >
          {displayedData[index]?.assetType}
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
</style>
