<script lang="ts">
  import { abbreviateNumber } from "$lib/utils";
  import { setCache, getCache, screenWidth } from "$lib/store";
  import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
  import { Button } from "$lib/components/shadcn/button/index.js";
  import Infobox from "$lib/components/Infobox.svelte";

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

  let optionHistoryList = [];
  let selectGraphType = "Vol/OI";
  let container;
  let rawDataHistory = [];
  let strikePrice;
  let optionType;
  let dateExpiration;
  let otmPercentage;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };
  function computeOTM(strikePrice, optionType) {
    // Get the current stock price
    const currentPrice = data?.getStockQuote?.price;

    let otmPercentage = 0;

    if (optionType === "C") {
      // Call option: OTM is positive if strike > currentPrice, negative (ITM) otherwise
      otmPercentage = (
        ((strikePrice - currentPrice) / currentPrice) *
        100
      )?.toFixed(2);
    } else if (optionType === "P") {
      // Put option: OTM is positive if strike < currentPrice, negative (ITM) otherwise
      otmPercentage = (
        ((currentPrice - strikePrice) / currentPrice) *
        100
      )?.toFixed(2);
    } else {
      otmPercentage = "n/a";
    }

    return otmPercentage; // Return the percentage rounded to two decimal places
  }

  function getScroll() {
    const scrollThreshold = container.scrollHeight * 0.8; // 80% of the container height

    // Check if the user has scrolled to the bottom based on the threshold
    const isBottom =
      container.scrollTop + container.clientHeight >= scrollThreshold;

    // Only load more data if at the bottom and there is still data to load
    if (isBottom && optionHistoryList?.length !== rawDataHistory?.length) {
      const nextIndex = optionHistoryList.length; // Ensure optionHistoryList is defined
      const filteredNewResults = rawDataHistory.slice(
        nextIndex,
        nextIndex + 25,
      ); // Ensure rawData is defined
      optionHistoryList = [...optionHistoryList, ...filteredNewResults];
    }
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

  let rawDataVolume = data?.getData?.volume?.map((item) => ({
    ...item,
    dte: daysLeft(item?.date_expiration),
    otm: computeOTM(item?.strike_price, item?.option_type),
  }));

  let rawDataOI = data?.getData?.openInterest?.map((item) => ({
    ...item,
    dte: daysLeft(item?.date_expiration),
    otm: computeOTM(item?.strike_price, item?.option_type),
  }));

  function plotContractHistory() {
    // Ensure rawDataHistory exists and sort it by date
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
          color: "#FAD776",
          yAxis: 2,
          animation: false,
          marker: { enabled: false },
        },
        {
          name: "Price",
          type: "spline",
          yAxis: 1,
          data: filteredData.map((item) => [
            new Date(item.date).getTime(),
            item.price,
          ]),
          color: "#fff",
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
          color: "#FAD776",
          yAxis: 2,
          lineWidth: 1,
          animation: false,
          marker: { enabled: false },
        },
        {
          name: "Price",
          type: "spline",
          yAxis: 1,
          data: filteredData.map((item) => [
            new Date(item.date).getTime(),
            item.price,
          ]),
          color: "#fff",
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
      credits: { enabled: false },
      title: {
        text: `<h3 class="mt-3 mb-1 text-[1rem] sm:text-lg">Contract History</h3>`,
        useHTML: true,
        style: { color: "white" },
      },
      // Disable markers globally on hover for all series
      plotOptions: {
        series: {
          color: "white",
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
          color: "#fff",
          width: 1,
          dashStyle: "Solid",
        },
        labels: {
          style: { color: "#fff" },
          distance: 20,
          formatter: function () {
            return new Date(this.value).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            });
          },
        },
        tickPositioner: function () {
          const positions = [];
          const info = this.getExtremes();
          const tickCount = 5; // Reduce number of ticks displayed
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
          gridLineColor: "#111827",
          labels: { style: { color: "white" } },
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
          let tooltipContent = `<span class=" m-auto text-black text-[1rem] font-[501]">${new Date(
            this.x,
          ).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}</span><br>`;

          this.points.forEach((point) => {
            tooltipContent += `<span class=" font-semibold text-sm">${point.series.name}:</span> 
          <span class=" font-normal text-sm" style="color:${point.color}">${abbreviateNumber(
            point.y,
          )}</span><br>`;
          });
          return tooltipContent;
        },
      },
      legend: { enabled: false },
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

  async function handleViewData(item) {
    isLoaded = false;
    selectGraphType = "Vol/OI";
    optionDetailsDesktopModal?.showModal();

    strikePrice = item?.strike_price;
    optionType = item?.option_type;
    dateExpiration = item?.date_expiration;
    otmPercentage = item?.otm;

    const output = await getContractHistory(item?.option_symbol);
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

      rawDataHistory = calculateDTE(rawDataHistory, dateExpiration);
      config = plotContractHistory();
      rawDataHistory = rawDataHistory?.sort(
        (a, b) => new Date(b?.date) - new Date(a?.date),
      );
      optionHistoryList = rawDataHistory?.slice(0, 20);
    } else {
      config = null;
    }

    isLoaded = true;
  }

  $: {
    if (selectGraphType) {
      isLoaded = false;
      if (rawDataHistory?.length > 0) {
        config = plotContractHistory();
      } else {
        config = null;
      }

      isLoaded = true;
    }
  }
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
                class="flex items-center justify-between space-x-2 px-1 py-1.5 text-smaller leading-tight sm:border-none py-3 sm:py-0 border-b border-gray-300 dark:border-gray-600"
              >
                <div class="hide-scroll">
                  Date Expiration
                  <span class="relative" role="tooltip"
                    ><label for="mobileTooltip" class="relative" role="tooltip">
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
                      class="border-gray-300 dark:border-none shadow-sm bg-white dark:bg-[#000] h-[35px] flex flex-row justify-between items-center min-w-[130px] w-[140px] sm:w-auto  px-3  rounded-md truncate"
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
                          on:click={() => (selectedDate = item)}
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
                class="flex items-center justify-between space-x-2 px-1 py-1.5 text-smaller leading-tight sm:border-none py-3 sm:py-0 border-b border-gray-300 dark:border-gray-600"
              >
                <div class="hide-scroll">
                  Strike Price
                  <span class="relative" role="tooltip"
                    ><label for="mobileTooltip" class="relative" role="tooltip">
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
                      class="border-gray-300 dark:border-none shadow-sm bg-white dark:bg-[#000] h-[35px] flex flex-row justify-between items-center min-w-[130px] w-[140px] sm:w-auto  px-3  rounded-md truncate"
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
                          on:click={() => (selectedStrike = item)}
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
                class="flex items-center justify-between space-x-2 px-1 py-1.5 text-smaller leading-tight sm:border-none py-3 sm:py-0 border-b border-gray-300 dark:border-gray-600"
              >
                <div class="hide-scroll">
                  Option Type
                  <span class="relative" role="tooltip"
                    ><label for="mobileTooltip" class="relative" role="tooltip">
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
                      class="border-gray-300 dark:border-none shadow-sm bg-white dark:bg-[#000] h-[35px] flex flex-row justify-between items-center min-w-[130px] w-[140px] sm:w-auto  px-3  rounded-md truncate"
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
                          on:click={() => (selectedOptionType = item)}
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
          {ticker} Mar 28, 2025 50.0 Call
        </h3>
        <h3
          class="text-gray-500 dark:text-gray-400 flex flex-row items-center text-sm sm:text-[1rem] mb-2 sm:mb-0"
        >
          NVDA250328C00050000
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
                  >n/a</td
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
                  >n/a</td
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
                  >n/a</td
                ></tr
              >

              <tr
                class="flex flex-col border-b border-gray-300 dark:border-gray-600 py-1 sm:table-row sm:py-0"
                ><td
                  class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
                  >Mid
                </td>
                <td
                  class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
                  >n/a</td
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
                  >n/a</td
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
                  >n/a</td
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
                  >n/a</td
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
                  >n/a</td
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
                  >n/a</td
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
                  n/a
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
                  n/a
                </td></tr
              >
              <tr class="flex flex-col py-1 sm:table-row sm:py-0"
                ><td
                  class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem] invisible"
                  >Vega</td
                >
                <td
                  class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem] invisible"
                >
                  n/a
                </td></tr
              >
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</section>

<dialog
  id="optionDetailsDesktopModal"
  class="modal {$screenWidth < 640 ? 'modal-bottom ' : ''} bg-[#000]/40 sm:px-5"
>
  <div
    class="modal-box bg-white dark:bg-default w-full {rawDataHistory?.length > 0
      ? 'max-w-7xl'
      : 'w-full'} rounded-md border-t sm:border border-gray-300 dark:border-gray-800 min-h-48 h-auto"
  >
    <form
      method="dialog"
      class="modal-backdrop backdrop-blur-[4px] flex flex-row items-center w-full justify-between"
    >
      <p
        class="text-muted dark:text-white text-[1rem] sm:text-xl font-semibold cursor-text"
      >
        Contract: <span
          class={optionType === "Calls"
            ? "text-green-600 dark:text-[#00FC50]"
            : "text-red-600 dark:text-[#FF2F1F]"}
          >{ticker}
          {strikePrice}
          {optionType}
          {dateExpiration} ({daysLeft(dateExpiration)})
        </span>
      </p>
      <button class="cursor-pointer text-[1.8rem] focus:outline-hidden">
        <svg
          class="w-8 h-8 text-muted dark:text-white"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          ><path
            fill="currentColor"
            d="m6.4 18.308l-.708-.708l5.6-5.6l-5.6-5.6l.708-.708l5.6 5.6l5.6-5.6l.708.708l-5.6 5.6l5.6 5.6l-.708.708l-5.6-5.6z"
          />
        </svg>
      </button>
    </form>
    {#if rawDataHistory?.length > 0}
      <div
        class="border-b border-gray-300 dark:border-gray-800 w-full mt-2 mb-2 sm:mb-3 sm:mt-3"
      ></div>

      <div class="hidden sm:flex flex-wrap pb-2">
        <div class="mr-3 whitespace-nowrap">
          {formatDate(optionHistoryList?.at(0)?.date)}:
        </div>
        <div class="mr-3 whitespace-nowrap">
          <span class="text-[var(--light-text-color)] font-normal">Vol:</span>
          {optionHistoryList?.at(0)?.volume?.toLocaleString("en-US")}
        </div>
        <div class="mr-3 whitespace-nowrap">
          <span class="text-[var(--light-text-color)] font-normal">OI:</span>
          {optionHistoryList?.at(0)?.open_interest?.toLocaleString("en-US")}
        </div>
        <div class="mr-3 whitespace-nowrap">
          <span class="text-[var(--light-text-color)] font-normal">Avg:</span>
          ${optionHistoryList?.at(0)?.mark}
        </div>
        <div class="mr-3 whitespace-nowrap">
          <span class="text-[var(--light-text-color)] font-normal">Prem:</span>
          {abbreviateNumber(optionHistoryList?.at(0)?.total_premium, true)}
        </div>
        <div class="mr-3 whitespace-nowrap">
          <span class="text-[var(--light-text-color)] font-normal">IV:</span>
          {(optionHistoryList?.at(0)?.implied_volatility * 100)?.toLocaleString(
            "en-US",
          )}%
        </div>
      </div>

      <div class="pb-8 sm:pb-2 rounded-md overflow-hidden">
        <div
          class="flex flex-row items-center justify-between gap-x-2 ml-auto w-fit mt-2"
        >
          {#each ["Vol/OI", "IV"] as item}
            <label
              on:click={() => (selectGraphType = item)}
              class="px-3 py-1.5 {selectGraphType === item
                ? 'shadow-sm bg-gray-100 dark:bg-white text-black '
                : 'shadow-sm text-opacity-[0.6] border border-gray-300 dark:border-gray-600'} transition ease-out duration-100 sm:hover:bg-white sm:hover:text-black rounded-md cursor-pointer"
            >
              {item}
            </label>
          {/each}
        </div>
        <div
          class="mt-2 border border-gray-300 dark:border-gray-800 rounded"
          use:highcharts={config}
        ></div>
      </div>

      <div
        bind:this={container}
        on:scroll={getScroll}
        class="h-full max-h-[500px] overflow-y-auto overflow-x-auto"
      >
        <div class="flex justify-start items-center m-auto cursor-normal">
          {#if isLoaded}
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
                {#each optionHistoryList as item}
                  <!-- row -->
                  <tr
                    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                  >
                    <td class="text-sm sm:text-[1rem] text-start">
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
                      {abbreviateNumber(item?.total_premium, false, true)}
                    </td>
                    <td class="text-sm sm:text-[1rem] text-end">
                      {abbreviateNumber(item?.gex, false, true)}
                    </td>
                    <td class="text-sm sm:text-[1rem] text-end">
                      {abbreviateNumber(item?.dex, false, true)}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          {:else}
            <div class="m-auto flex justify-center items-center h-80">
              <div class="relative">
                <label
                  class="bg-[#272727] rounded-xl h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                >
                  <span class="loading loading-spinner loading-md text-gray-400"
                  ></span>
                </label>
              </div>
            </div>
          {/if}
        </div>
      </div>
    {:else}
      <div
        class="mt-10 flex justify-center sm:justify-start items-center w-full"
      >
        No historical data available yet for the given contract
      </div>
    {/if}
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
