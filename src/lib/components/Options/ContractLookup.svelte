<script lang="ts">
  import { abbreviateNumber } from "$lib/utils";
  import { setCache, getCache, screenWidth } from "$lib/store";
  import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
  import { Button } from "$lib/components/shadcn/button/index.js";
  import Infobox from "$lib/components/Infobox.svelte";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";

  import { onMount } from "svelte";

  import highcharts from "$lib/highcharts.ts";
  import { mode } from "mode-watcher";

  export let data;
  export let ticker;

  let isLoaded = false;
  let config = null;
  let selectedOptionType = "Call";
  let optionData = data?.getData[selectedOptionType];

  let dateList = Object?.keys(optionData);

  let selectedDate = Object?.keys(optionData)[0];

  let strikeList = optionData[selectedDate] || [];

  let selectedStrike = strikeList?.at(0) || [];
  let optionSymbol = "n/a";

  let displayList = [];
  let selectGraphType = "Vol/OI";
  let rawDataHistory = [];
  let infoText = {};
  let tooltipTitle;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  function buildOptionSymbol(dateExpiration, optionType, strikePrice) {
    // Format the expiration date as YYMMDD
    const date = new Date(dateExpiration);
    const year = date.getFullYear() % 100; // Last two digits of the year
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-indexed
    const day = date.getDate().toString().padStart(2, "0");
    const expirationStr = `${year}${month}${day}`;

    // Convert option type to a single uppercase letter (C for Call, P for Put)
    const optionTypeChar = optionType.charAt(0).toUpperCase();

    // Format strike price as 8 digits (multiply by 1000 and pad with leading zeros)
    const strikePriceScaled = Math.round(strikePrice * 1000);
    const strikeStr = strikePriceScaled.toString().padStart(8, "0");

    // Combine all components into the final option symbol
    return `${ticker}${expirationStr}${optionTypeChar}${strikeStr}`;
  }

  const currentTime = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/New_York" }),
  )?.getTime();

  function daysLeft(targetDate) {
    const targetTime = new Date(targetDate).getTime();
    const difference = targetTime - currentTime;

    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const daysLeft = Math?.ceil(difference / millisecondsPerDay);

    return daysLeft + "D";
  }

  function calculateDTE(data, dateExpiration) {
    // Convert the expiration date to a Date object
    const expirationDate = new Date(dateExpiration);

    return data.map((item) => {
      const itemDate = new Date(item.date); // Convert item.date to a Date object
      const timeDifference = expirationDate - itemDate; // Difference in milliseconds
      const dte = Math.ceil(timeDifference / (1000 * 60 * 60 * 24)); // Convert ms to days

      // Add the calculated DTE to the object
      return {
        ...item,
        dte, // Add DTE as a new property
      };
    });
  }

  function plotData() {
    const sortedData =
      rawDataHistory?.sort((a, b) => new Date(a?.date) - new Date(b?.date)) ||
      [];

    // Filter out data points that have an undefined price so they don't appear in any series
    const filteredData = sortedData.filter((item) => item?.price !== undefined);

    // Build series based on the selected graph type, using filteredData
    let series = [];
    if (selectGraphType == "Vol/OI") {
      series = [
        {
          name: "Volume",
          type: "column",
          data: filteredData.map((item) => [
            new Date(item.date).getTime(),
            item.volume,
          ]),
          color: "#FD7E14",
          borderColor: "#FD7E14",
          borderRadius: "2px",
          yAxis: 0,
          animation: false,
        },
        {
          name: "OI",
          type: "column",
          data: filteredData.map((item) => [
            new Date(item.date).getTime(),
            item.open_interest,
          ]),
          color: "#33B890",
          borderColor: "#33B890",
          borderRadius: "2px",
          yAxis: 0,
          animation: false,
        },
        {
          name: "Avg Fill",
          type: "spline", // smooth line
          data: filteredData.map((item) => [
            new Date(item.date).getTime(),
            item.mark,
          ]),
          color: "#FF0006",
          yAxis: 2,
          animation: false,
          marker: { enabled: false },
        },
        {
          name: "Stock Price",
          type: "spline",
          yAxis: 1,
          data: filteredData.map((item) => [
            new Date(item.date).getTime(),
            item.price,
          ]),
          color: $mode === "light" ? "#005AFF" : "white",
          lineWidth: 1,
          marker: { enabled: false },
          animation: false,
        },
      ];
    } else {
      series = [
        {
          name: "IV",
          type: "spline",
          data: filteredData.map((item) => [
            new Date(item.date).getTime(),
            Math.floor(item.implied_volatility * 100),
          ]),
          color: "#B24BF3",
          yAxis: 0,
          animation: false,
          marker: { enabled: false },
        },
        {
          name: "Avg Fill",
          type: "spline",
          data: filteredData.map((item) => [
            new Date(item.date).getTime(),
            item.mark,
          ]),
          color: "#FF0006",
          yAxis: 2,
          lineWidth: 1,
          animation: false,
          marker: { enabled: false },
        },
        {
          name: "Stock Price",
          type: "spline",
          yAxis: 1,
          data: filteredData.map((item) => [
            new Date(item.date).getTime(),
            item.price,
          ]),
          color: $mode === "light" ? "#005AFF" : "white",
          lineWidth: 1,
          marker: { enabled: false },
          animation: false,
        },
      ];
    }

    // Highcharts configuration object
    const options = {
      chart: {
        backgroundColor: $mode === "light" ? "#fff" : "#09090B",
        animation: false,
        height: 360,
      },
      legend: {
        enabled: true,
        align: $screenWidth < 640 ? "center" : "left", // Positions legend at the left edge
        verticalAlign: "top", // Positions legend at the top
        layout: "horizontal", // Align items horizontally (use 'vertical' if preferred)
        itemStyle: {
          color: $mode === "light" ? "black" : "white",
        },
        symbolWidth: 16, // Controls the width of the legend symbol
        symbolRadius: 8, // Creates circular symbols (adjust radius as needed)
        squareSymbol: false, // Ensures symbols are circular, not square
      },
      credits: { enabled: false },
      title: {
        text: `<h3 class="mt-3 mb-1 text-[1rem] sm:text-lg">${ticker}
          ${formatDate(selectedDate)}
          ${selectedStrike}
          ${selectedOptionType}</h3>`,
        useHTML: true,
        style: { color: $mode === "light" ? "black" : "white" },
      },
      // Disable markers globally on hover for all series
      plotOptions: {
        series: {
          color: $mode === "light" ? "black" : "white",
          animation: false, // Disable series animation
          states: {
            hover: {
              enabled: false, // Disable hover effect globally
            },
          },
        },
      },
      xAxis: {
        type: "datetime",
        endOnTick: false,
        crosshair: {
          color: $mode === "light" ? "black" : "white",
          width: 1,
          dashStyle: "Solid",
        },
        labels: {
          style: { color: $mode === "light" ? "black" : "white" },
          distance: 20,
          formatter: function () {
            return new Date(this.value).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
          },
        },
        tickPositioner: function () {
          const positions = [];
          const info = this.getExtremes();
          const tickCount = 3; // Reduce number of ticks displayed
          const interval = Math.floor((info.max - info.min) / tickCount);

          for (let i = 0; i <= tickCount; i++) {
            positions.push(info.min + i * interval);
          }
          return positions;
        },
      },
      yAxis: [
        {
          gridLineWidth: 1,
          gridLineColor: $mode === "light" ? "#d1d5dc" : "#111827",
          labels: { style: { color: $mode === "light" ? "black" : "white" } },
          title: { text: null },
          opposite: true,
        },
        {
          title: { text: null },
          gridLineWidth: 0,
          labels: { enabled: false },
        },
        {
          title: { text: null },
          gridLineWidth: 0,
          labels: { enabled: false },
        },
        {
          title: { text: null },
          gridLineWidth: 0,
          labels: { enabled: false },
        },
      ],
      tooltip: {
        shared: true,
        useHTML: true,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        style: {
          color: "#fff",
          fontSize: "16px",
          padding: "10px",
        },
        borderRadius: 4,
        formatter: function () {
          let tooltipContent = `<span class=" m-auto  text-[1rem] font-[501]">${new Date(
            this.x,
          ).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}</span><br>`;

          this.points.forEach((point) => {
            tooltipContent += `<span class=" font-semibold text-sm">${point.series.name}:</span> 
          <span class=" font-normal text-sm" >${abbreviateNumber(
            point.y,
          )}</span><br>`;
          });
          return tooltipContent;
        },
      },
      series: series,
    };

    return options;
  }

  const getContractHistory = async (contractId) => {
    let output;
    const cachedData = getCache(contractId, "getContractHistory");
    if (cachedData) {
      output = cachedData;
    } else {
      const postData = {
        ticker: ticker,
        contract: contractId,
      };

      // make the POST request to the endpoint
      const response = await fetch("/api/options-contract-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      output = await response.json();

      setCache(contractId, output, "getContractHistory");
    }

    return output;
  };

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;

    if (isBottom && displayList?.length !== rawDataHistory?.length) {
      const nextIndex = displayList?.length;
      const filteredNewResults = rawDataHistory?.slice(
        nextIndex,
        nextIndex + 50,
      );
      displayList = [...displayList, ...filteredNewResults];
    }
  }

  async function loadData(state: string) {
    isLoaded = false;
    optionData = data?.getData[selectedOptionType];

    dateList = [...Object?.keys(optionData)];

    strikeList = [...optionData[selectedDate]];

    if (!strikeList?.includes(selectedStrike)) {
      selectedStrike = strikeList?.at(0); // Set to first element if not found
    }

    displayList = [];
    rawDataHistory = [];

    optionSymbol = buildOptionSymbol(
      selectedDate,
      selectedOptionType,
      selectedStrike,
    );
    const output = await getContractHistory(optionSymbol);
    rawDataHistory = output?.history;

    if (rawDataHistory?.length > 0) {
      rawDataHistory.forEach((entry) => {
        const matchingData = data?.getHistoricalPrice?.find(
          (d) => d?.time === entry?.date,
        );
        if (matchingData) {
          entry.price = matchingData?.close;
        }
      });

      rawDataHistory = calculateDTE(rawDataHistory, selectedDate);
      config = plotData();
      rawDataHistory = rawDataHistory?.sort(
        (a, b) => new Date(b?.date) - new Date(a?.date),
      );
      displayList = rawDataHistory?.slice(0, 20);
    } else {
      config = null;
    }
    isLoaded = true;
  }

  async function getInfoText(parameter, title) {
    tooltipTitle = title;
    const cachedData = getCache(parameter, "getInfoText");
    if (cachedData) {
      infoText = cachedData;
    } else {
      const postData = { parameter };
      const response = await fetch("/api/info-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      infoText = await response.json();
      setCache(parameter, infoText, "getInfoText");
    }
  }

  onMount(async () => {
    await loadData("default");

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });
</script>

<section class="w-full overflow-hidden">
  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <div class="sm:pl-7 sm:pb-7 sm:pt-7 w-full m-auto mt-2 sm:mt-0">
        <h2
          class=" flex flex-row items-center text-xl sm:text-2xl font-bold mb-3"
        >
          Option Contract Lookup
        </h2>

        <Infobox
          text="Search for specific option contracts by expiration date, strike price and option type."
        />

        <div
          class="rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 shadow-sm dark:bg-primary p-2 mt-5"
        >
          <div class="items-end">
            <div
              class="sm:grid sm:gap-x-2.5 gap-y-3 md:grid-cols-2 xl:grid-cols-3 w-full"
            >
              <!--Start Added Rules-->
              <div
                class="flex items-center justify-between space-x-2 px-1 py-1.5 leading-tight sm:py-0 border-b border-gray-300 dark:border-gray-600"
              >
                <div class="hide-scroll mb-1">
                  Date Expiration
                  <span class="relative" role="tooltip"
                    ><label
                      for="mobileTooltip"
                      on:click={() =>
                        getInfoText("dateExpiration", "Date Expiration")}
                      class="relative"
                      role="tooltip"
                    >
                      <span
                        class="absolute -right-[15px] -top-[3px] cursor-pointer p-1 text-gray-500 dark:text-gray-300 dark:sm:hover:text-white"
                      >
                        <svg
                          class="h-[10.5px] w-[10.5px]"
                          viewBox="0 0 4 16"
                          fill="currentColor"
                          style="max-width:20px"
                          ><path
                            d="M0 6h4v10h-4v-10zm2-6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"
                          ></path></svg
                        >
                      </span>
                    </label></span
                  >
                </div>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild let:builder>
                    <Button
                      builders={[builder]}
                      class="mb-1 border-gray-300 dark:border-none shadow-sm bg-white dark:bg-[#000] h-[35px] flex flex-row justify-between items-center min-w-[130px] w-[140px] sm:w-auto  px-3  rounded-md truncate"
                    >
                      <span class="truncate text-sm"
                        >{formatDate(selectedDate)}</span
                      >
                      <svg
                        class="-mr-1 ml-2 h-5 w-5 inline-block"
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
                    class="w-auto max-w-60 max-h-[400px] overflow-y-auto scroller relative"
                  >
                    <!-- Dropdown items -->
                    <DropdownMenu.Group class="pb-2"
                      >{#each dateList as item}
                        <DropdownMenu.Item
                          on:click={() => {
                            selectedDate = item;
                            loadData("default");
                          }}
                          class="sm:hover:bg-gray-200 dark:sm:hover:bg-primary cursor-pointer "
                        >
                          {formatDate(item)}
                        </DropdownMenu.Item>
                      {/each}</DropdownMenu.Group
                    >
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </div>
              <div
                class="flex items-center justify-between space-x-2 px-1 py-1.5 leading-tight sm:py-0 border-b border-gray-300 dark:border-gray-600"
              >
                <div class="hide-scroll mb-1">
                  Strike Price
                  <span class="relative" role="tooltip"
                    ><label
                      for="mobileTooltip"
                      on:click={() =>
                        getInfoText("strikePrice", "Strike Price")}
                      class="relative"
                      role="tooltip"
                    >
                      <span
                        class="absolute -right-[15px] -top-[3px] cursor-pointer p-1 text-gray-500 dark:text-gray-300 dark:sm:hover:text-white"
                      >
                        <svg
                          class="h-[10.5px] w-[10.5px]"
                          viewBox="0 0 4 16"
                          fill="currentColor"
                          style="max-width:20px"
                          ><path
                            d="M0 6h4v10h-4v-10zm2-6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"
                          ></path></svg
                        >
                      </span>
                    </label></span
                  >
                </div>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild let:builder>
                    <Button
                      builders={[builder]}
                      class="mb-1 border-gray-300 dark:border-none shadow-sm bg-white dark:bg-[#000] h-[35px] flex flex-row justify-between items-center min-w-[130px] w-[140px] sm:w-auto  px-3  rounded-md truncate"
                    >
                      <span class="truncate text-sm">{selectedStrike}</span>
                      <svg
                        class="-mr-1 ml-2 h-5 w-5 inline-block"
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
                    class="w-auto max-w-60 max-h-[400px] overflow-y-auto scroller relative"
                  >
                    <!-- Dropdown items -->
                    <DropdownMenu.Group class="pb-2">
                      <!-- Added padding to avoid overlapping with Reset button -->
                      {#each strikeList as item}
                        <DropdownMenu.Item
                          on:click={() => {
                            selectedStrike = item;
                            loadData("default");
                          }}
                          class="sm:hover:bg-gray-200 dark:sm:hover:bg-primary cursor-pointer "
                        >
                          {item}
                        </DropdownMenu.Item>
                      {/each}
                    </DropdownMenu.Group>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </div>
              <div
                class="flex items-center justify-between space-x-2 px-1 py-1.5 leading-tight sm:py-0 border-b border-gray-300 dark:border-gray-600"
              >
                <div class="hide-scroll mb-1">
                  Option Type
                  <span class="relative" role="tooltip"
                    ><label
                      for="mobileTooltip"
                      on:click={() => getInfoText("optionType", "Option Type")}
                      class="relative"
                      role="tooltip"
                    >
                      <span
                        class="absolute -right-[15px] -top-[3px] cursor-pointer p-1 text-gray-500 dark:text-gray-300 dark:sm:hover:text-white"
                      >
                        <svg
                          class="h-[10.5px] w-[10.5px]"
                          viewBox="0 0 4 16"
                          fill="currentColor"
                          style="max-width:20px"
                          ><path
                            d="M0 6h4v10h-4v-10zm2-6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"
                          ></path></svg
                        >
                      </span>
                    </label></span
                  >
                </div>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild let:builder>
                    <Button
                      builders={[builder]}
                      class="mb-1 border-gray-300 dark:border-none shadow-sm bg-white dark:bg-[#000] h-[35px] flex flex-row justify-between items-center min-w-[130px] w-[140px] sm:w-auto  px-3  rounded-md truncate"
                    >
                      <span class="truncate text-sm">{selectedOptionType}</span>
                      <svg
                        class="-mr-1 ml-2 h-5 w-5 inline-block"
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
                    class="w-auto max-w-60 max-h-[400px] overflow-y-auto scroller relative"
                  >
                    <!-- Dropdown items -->
                    <DropdownMenu.Group class="pb-2"
                      >{#each ["Call", "Put"] as item}
                        <DropdownMenu.Item
                          on:click={() => {
                            selectedOptionType = item;
                            loadData("optionType");
                          }}
                          class="sm:hover:bg-gray-200 dark:sm:hover:bg-primary cursor-pointer "
                        >
                          {item}
                        </DropdownMenu.Item>
                      {/each}</DropdownMenu.Group
                    >
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </div>
              <!--End Added Rules-->
            </div>
          </div>
        </div>

        <h3
          class=" flex flex-row items-center text-xl sm:text-xl font-bold mt-10"
        >
          {ticker}
          {formatDate(selectedDate)}
          {selectedStrike}
          {selectedOptionType}
        </h3>
        <h3
          class="text-gray-500 dark:text-gray-400 flex flex-row items-center text-sm sm:text-[1rem] mb-2 sm:mb-0"
        >
          {optionSymbol}
        </h3>

        <div
          class="mt-5 order-5 lg:order-1 flex flex-row space-x-2 sm:space-x-3 xs:space-x-4"
        >
          <table class="w-[50%] text-sm sm:text-[1rem] xl:min-w-[300px]">
            <tbody
              ><tr
                class="flex flex-col border-b border-gray-300 dark:border-gray-600 py-1 sm:table-row sm:py-0"
                ><td
                  class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
                  >Last</td
                >
                <td
                  class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
                  >{rawDataHistory?.at(0)?.close || "n/a"}</td
                ></tr
              >

              <tr
                class="flex flex-col border-b border-gray-300 dark:border-gray-600 py-1 sm:table-row sm:py-0"
                ><td
                  class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
                  >High</td
                >
                <td
                  class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
                  >{rawDataHistory?.at(0)?.high || "n/a"}</td
                ></tr
              >

              <tr
                class="flex flex-col border-b border-gray-300 dark:border-gray-600 py-1 sm:table-row sm:py-0"
                ><td
                  class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
                  >Low</td
                >
                <td
                  class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
                  >{rawDataHistory?.at(0)?.low || "n/a"}</td
                ></tr
              >

              <tr
                class="flex flex-col border-b border-gray-300 dark:border-gray-600 py-1 sm:table-row sm:py-0"
                ><td
                  class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
                  >Open
                </td>
                <td
                  class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
                  >{rawDataHistory?.at(0)?.open || "n/a"}</td
                ></tr
              >
              <tr
                class="flex flex-col border-b border-gray-300 dark:border-gray-600 py-1 sm:table-row sm:py-0"
                ><td
                  class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
                  >Volume
                </td>
                <td
                  class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
                  >{rawDataHistory?.at(0)?.volume?.toLocaleString("en-US") ||
                    "n/a"}</td
                ></tr
              >
              <tr
                class="flex flex-col border-b border-gray-300 dark:border-gray-600 py-1 sm:table-row sm:py-0"
                ><td
                  class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
                  >Open Interest
                </td>
                <td
                  class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
                  >{rawDataHistory
                    ?.at(0)
                    ?.open_interest?.toLocaleString("en-US") || "n/a"}</td
                ></tr
              >
            </tbody>
          </table>
          <table class="w-[50%] text-sm xl:min-w-[300px]">
            <tbody
              ><tr
                class="flex flex-col border-b border-gray-300 dark:border-gray-600 py-1 sm:table-row sm:py-0"
                ><td
                  class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
                  >Implied Volatility (IV)</td
                >
                <td
                  class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
                  >{Math.floor(
                    rawDataHistory?.at(0)?.implied_volatility * 100,
                  ) + "%" || "n/a"}</td
                ></tr
              >

              <tr
                class="flex flex-col border-b border-gray-300 dark:border-gray-600 py-1 sm:table-row sm:py-0"
                ><td
                  class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
                  >Delta</td
                >
                <td
                  class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
                  >{rawDataHistory?.at(0)?.delta || "n/a"}</td
                ></tr
              >

              <tr
                class="flex flex-col border-b border-gray-300 dark:border-gray-600 py-1 sm:table-row sm:py-0"
                ><td
                  class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
                  >Gamma</td
                >
                <td
                  class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
                  >{rawDataHistory?.at(0)?.gamma || "n/a"}</td
                ></tr
              >

              <tr
                class="flex flex-col border-b border-gray-300 dark:border-gray-600 py-1 sm:table-row sm:py-0"
                ><td
                  class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
                  >Theta</td
                >
                <td
                  class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
                >
                  {rawDataHistory?.at(0)?.theta || "n/a"}
                </td></tr
              >
              <tr
                class="flex flex-col border-b border-gray-300 dark:border-gray-600 py-1 sm:table-row sm:py-0"
                ><td
                  class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
                  >Vega</td
                >
                <td
                  class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
                >
                  {rawDataHistory?.at(0)?.vega || "n/a"}
                </td></tr
              >
              <tr class="flex flex-col py-1 sm:table-row sm:py-0"
                ><td
                  class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem] invisible"
                  >XXX</td
                >
                <td
                  class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem] invisible"
                >
                  XXX
                </td></tr
              >
            </tbody>
          </table>
        </div>

        <div class="pb-8 sm:pb-2 rounded-md overflow-hidden">
          <div
            class="flex flex-row items-center justify-between gap-x-2 ml-auto w-fit mt-2"
          >
            {#each ["Vol/OI", "IV"] as item}
              <label
                on:click={() => {
                  selectGraphType = item;
                  loadData("default");
                }}
                class="px-3 py-1.5 {selectGraphType === item
                  ? 'shadow-sm bg-gray-100 dark:bg-white text-black '
                  : 'shadow-sm text-opacity-[0.6] border border-gray-300 dark:border-gray-600'} transition ease-out duration-100 sm:hover:bg-white sm:hover:text-black rounded-md cursor-pointer"
              >
                {item}
              </label>
            {/each}
          </div>
          {#if config}
            <div>
              <div class="grow pt-5">
                <div class="relative">
                  <!-- Apply the blur class to the chart -->
                  <div
                    class="{!['Pro']?.includes(data?.user?.tier)
                      ? 'blur-[3px]'
                      : ''} mt-5 shadow-sm sm:mt-0 sm:border sm:border-gray-300 dark:border-gray-800 rounded"
                    use:highcharts={config}
                  ></div>
                  <!-- Overlay with "Upgrade to Pro" -->
                  {#if !["Pro"]?.includes(data?.user?.tier)}
                    <div
                      class="font-bold text-lg sm:text-xl absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center text-muted dark:text-white"
                    >
                      <a
                        href="/pricing"
                        class="sm:hover:text-blue-600 dark:sm:hover:text-white dark:text-white flex flex-row items-center"
                      >
                        <span>Upgrade to Pro</span>
                        <svg
                          class="ml-1 w-5 h-5 sm:w-6 sm:h-6 inline-block"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          ><path
                            fill="currentColor"
                            d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                          /></svg
                        >
                      </a>
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          {/if}
        </div>

        {#if isLoaded && displayList?.length > 0}
          <div
            class="flex justify-start items-center m-auto overflow-x-auto cursor-normal"
          >
            <table
              class="table table-sm table-compact no-scrollbar rounded-none sm:rounded-md w-full bg-white dark:bg-table border border-gray-300 dark:border-gray-800 m-auto mt-4"
            >
              <thead class="text-muted dark:text-white dark:bg-default">
                <tr class="">
                  <td class=" font-semibold text-sm text-start">Date</td>
                  <td class=" font-semibold text-sm text-end">Vol</td>
                  <td class=" font-semibold text-sm text-end">OI</td>
                  <td class=" font-semibold text-sm text-end">OI Change</td>
                  <td class=" font-semibold text-sm text-end">% Change OI</td>
                  <td class=" font-semibold text-sm text-end">Last Price</td>
                  <td class=" font-semibold text-sm text-end">Avg Price</td>
                  <td class=" font-semibold text-sm text-end">IV</td>
                  <td class=" font-semibold text-sm text-end">Total Prem</td>
                  <td class=" font-semibold text-sm text-end">GEX</td>
                  <td class=" font-semibold text-sm text-end">DEX</td>
                </tr>
              </thead>
              <tbody>
                {#each data?.user?.tier === "Pro" ? displayList : displayList?.slice(0, 3) as item, index}
                  <tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd {index +
                      1 ===
                      displayList?.slice(0, 3)?.length &&
                    !['Pro']?.includes(data?.user?.tier)
                      ? 'opacity-[0.1]'
                      : ''}"
                  >
                    <td
                      class="text-sm sm:text-[1rem] text-start whitespace-nowrap"
                    >
                      {formatDate(item?.date)}
                    </td>

                    <td class="text-sm sm:text-[1rem] text-end">
                      {item?.volume !== null
                        ? item?.volume?.toLocaleString("en-US")
                        : 0}
                    </td>

                    <td class="text-sm sm:text-[1rem] text-end">
                      {item?.open_interest !== undefined
                        ? item?.open_interest?.toLocaleString("en-US")
                        : "n/a"}
                    </td>
                    <td class="text-sm sm:text-[1rem] text-end">
                      {#if item?.changeOI >= 0 && item?.changeOI !== null}
                        <span class="text-green-600 dark:text-[#00FC50]"
                          >+{item?.changeOI?.toLocaleString("en-US")}</span
                        >
                      {:else if item?.changeOI < 0 && item?.changeOI !== null}
                        <span class="text-red-600 dark:text-[#FF2F1F]"
                          >{item?.changeOI?.toLocaleString("en-US")}</span
                        >
                      {:else}
                        n/a
                      {/if}
                    </td>

                    <td class="text-sm sm:text-[1rem] text-end">
                      {#if item?.changesPercentageOI > 0 && item?.changesPercentageOI !== undefined}
                        <span class="text-green-600 dark:text-[#00FC50]"
                          >+{item?.changesPercentageOI + "%"}</span
                        >
                      {:else if item?.changesPercentageOI < 0 && item?.changesPercentageOI !== undefined}
                        <span class="text-red-600 dark:text-[#FF2F1F]"
                          >{item?.changesPercentageOI + "%"}</span
                        >
                      {:else if item?.changesPercentageOI === 0 && item?.changesPercentageOI !== undefined}
                        0%
                      {:else}
                        n/a
                      {/if}
                    </td>

                    <td class="text-sm sm:text-[1rem] text-end">
                      {item?.close}
                    </td>

                    <td class="text-sm sm:text-[1rem] text-end">
                      {item?.mark}
                    </td>

                    <td class="text-sm sm:text-[1rem] text-end">
                      {(item?.implied_volatility * 100)?.toLocaleString(
                        "en-US",
                      ) + "%"}
                    </td>

                    <td class="text-sm sm:text-[1rem] text-end">
                      {abbreviateNumber(item?.total_premium)}
                    </td>
                    <td class="text-sm sm:text-[1rem] text-end">
                      {abbreviateNumber(item?.gex?.toFixed(2))}
                    </td>
                    <td class="text-sm sm:text-[1rem] text-end">
                      {abbreviateNumber(item?.dex?.toFixed(2))}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
        <UpgradeToPro {data} display={true} />
      </div>
    </div>
  </div>
</section>

<input type="checkbox" id="mobileTooltip" class="modal-toggle" />

<dialog id="mobileTooltip" class="modal p-3">
  <label for="mobileTooltip" class="cursor-pointer modal-backdrop"></label>

  <!-- Desktop modal content -->
  <div
    class="modal-box rounded-md border border-gray-300 dark:border-gray-600 w-full bg-white dark:bg-secondary flex flex-col items-center"
  >
    <div class=" mb-5 text-center">
      <h3 class="font-bold text-2xl mb-5">{tooltipTitle}</h3>
      <span class=" text-[1rem] font-normal">{infoText?.text ?? "n/a"}</span>
      {#if infoText?.equation !== undefined}
        <div class="w-5/6 m-auto mt-5"></div>
        <div class="text-[1rem] w-full pt-3 pb-3 m-auto">
          {infoText?.equation}
        </div>
      {/if}
    </div>

    <div class="border-t border-gray-300 dark:border-gray-600 mt-2 w-full">
      <label
        for="mobileTooltip"
        class="cursor-pointer mt-4 font-semibold text-xl m-auto flex justify-center"
      >
        Close
      </label>
    </div>
  </div>
</dialog>
