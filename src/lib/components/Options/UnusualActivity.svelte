<script lang="ts">
  import { abbreviateNumber, abbreviateNumberWithColor } from "$lib/utils";
  import { screenWidth, setCache, getCache } from "$lib/store";

  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  import highcharts from "$lib/highcharts.ts";

  import { onMount } from "svelte";

  export let data;
  export let ticker = null;

  let isLoaded = false;
  let configContract = null;

  let optionHistoryList = [];
  let selectGraphType = "Vol/OI";
  let container;
  let rawDataHistory = [];
  let strikePrice;
  let optionType;
  let dateExpiration;

  const currentTime = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/New_York" }),
  )?.getTime();

  let rawData = data?.getData?.map((item) => ({
    ...item,
    dte: daysLeft(item?.expiry),
  }));

  let displayList = rawData?.slice(0, 150) || [];

  let configUnusual = plotData();

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

  function formatDate(dateStr) {
    // Convert the input date string to a Date object in New York time
    let date = new Date(dateStr + "T00:00:00Z"); // Assume input is in UTC

    // Convert to New York Time Zone
    let options = {
      timeZone: "Europe/Berlin",
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
    };

    let formatter = new Intl.DateTimeFormat("en-US", options);

    return formatter.format(date);
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

  function plotData() {
    let dates = [];
    let callData = [];
    let putData = [];
    let priceList = [];
    let totalPremiums = [];

    // Sort history by date
    const history = rawData?.sort(
      (a, b) => new Date(a?.date) - new Date(b?.date),
    );

    // Aggregate call size, put size, and premiums for each date
    const aggregatedData = {};

    history?.forEach((item) => {
      const { date, optionType, size, premium } = item;

      if (!aggregatedData[date]) {
        aggregatedData[date] = { callSize: 0, putSize: 0, totalPremium: 0 };
      }

      if (optionType === "Calls") {
        aggregatedData[date].callSize += size;
      } else if (optionType === "Puts") {
        aggregatedData[date].putSize += size;
      }

      aggregatedData[date].totalPremium += premium;
    });

    // Build data arrays from the aggregated data
    dates = Object.keys(aggregatedData);
    callData = dates?.map((date) => aggregatedData[date].callSize);
    putData = dates?.map((date) => aggregatedData[date].putSize);
    totalPremiums = dates?.map((date) => aggregatedData[date].totalPremium);

    // Get the historical prices for matching dates
    priceList = dates?.map((date) => {
      const matchingData = data?.getHistoricalPrice?.find(
        (d) => d?.time === date,
      );
      return matchingData?.close || null;
    });

    // Highcharts configuration options
    const options = {
      credits: {
        enabled: false,
      },
      plotOptions: {
        column: {
          groupPadding: 0.1, // Increase to add more space between groups of columns
          pointPadding: 0.1, // Adjust to fine-tune spacing within a group
          borderWidth: 0, // Optional: Remove borders if not needed
        },
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
      chart: {
        backgroundColor: "#09090B",
        plotBackgroundColor: "#09090B",
        height: 360,
        animation: false,
      },
      title: {
        text: `<h3 class="mt-3 mb-1 text-[1rem] sm:text-lg">${ticker} Unusual Options Activity</h3>`,
        style: {
          color: "white",
        },
        useHTML: true,
      },
      xAxis: {
        type: "datetime",
        endOnTick: false,
        categories: dates,
        crosshair: {
          color: "#fff",
          width: 1,
          dashStyle: "Solid",
        },
        labels: {
          style: {
            color: "#fff",
          },
          formatter: function () {
            const date = new Date(this.value);
            return date.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            });
          },
        },
        tickPositioner: function () {
          const positions = [];
          const info = this.getExtremes();
          const tickCount = 5;
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
          labels: {
            style: { color: "white" },
          },
          title: { text: null },
          opposite: true,
        },
        {
          title: {
            text: null,
          },
          gridLineWidth: 0,
          labels: {
            enabled: false,
          },
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
          let tooltipContent = `<span class="text-white m-auto text-black text-[1rem] font-[501]">${new Date(
            this?.x,
          ).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}</span><br>`;

          this.points.forEach((point) => {
            tooltipContent += `<span class="text-white font-semibold text-sm">${point.series.name}:</span> 
      <span class="text-white font-normal text-sm" style="color:${point.color}">${abbreviateNumber(
        point.y,
      )}</span><br>`;
          });

          return tooltipContent;
        },
      },
      series: [
        {
          name: "Call",
          type: "column",
          data: callData,
          color: "#00FC50",
          borderColor: "#00FC50",
          borderRadius: "0px",
          marker: {
            enabled: false,
          },
          animation: false,
        },
        {
          name: "Put",
          type: "column",
          data: putData,
          color: "#EE5365",
          borderColor: "#EE5365",
          borderRadius: "0px",
          marker: {
            enabled: false,
          },
          animation: false,
        },
        {
          name: "Stock Price",
          type: "area",
          yAxis: 1,
          data: priceList,
          color: "#fff",
          lineWidth: 1,
          marker: {
            enabled: false,
          },
          animation: false,
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
              [0, "rgba(255, 255, 255, 0.1)"],
              [1, "rgba(255, 255, 255, 0.001)"],
            ],
          },
        },
      ],
      legend: {
        enabled: false,
      },
    };

    return options;
  }

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;
    if (isBottom && displayList?.length !== rawData?.length) {
      const nextIndex = displayList?.length;
      const filteredNewResults = rawData?.slice(nextIndex, nextIndex + 50);
      displayList = [...displayList, ...filteredNewResults];
    }
  }
  onMount(async () => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

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
        backgroundColor: "#09090B",
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
          let tooltipContent = `<span class="text-white m-auto text-black text-[1rem] font-[501]">${new Date(
            this.x,
          ).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}</span><br>`;

          this.points.forEach((point) => {
            tooltipContent += `<span class="text-white font-semibold text-sm">${point.series.name}:</span> 
          <span class="text-white font-normal text-sm" style="color:${point.color}">${abbreviateNumber(
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

    strikePrice = item?.strike;
    optionType = item?.optionType;
    dateExpiration = item?.expiry;

    const output = await getContractHistory(item?.optionSymbol);
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
      configContract = plotContractHistory();
      rawDataHistory = rawDataHistory?.sort(
        (a, b) => new Date(b?.date) - new Date(a?.date),
      );
      optionHistoryList = rawDataHistory?.slice(0, 20);
    } else {
      configContract = null;
    }

    isLoaded = true;
  }

  $: columns = [
    { key: "date", label: "Date", align: "left" },
    { key: "optionSymbol", label: "Option Chain", align: "left" },
    { key: "dte", label: "DTE", align: "right" },
    { key: "unusualType", label: "Type", align: "right" },
    { key: "executionEst", label: "Exec", align: "right" },
    { key: "sentiment", label: "Sent.", align: "right" },
    { key: "size", label: "Size", align: "right" },
    { key: "price", label: "Spot", align: "right" },
    { key: "premium", label: "Prem", align: "right" },
  ];

  $: sortOrders = {
    date: { order: "none", type: "date" },
    optionSymbol: { order: "none", type: "string" },
    unusualType: { order: "none", type: "string" },
    executionEst: { order: "none", type: "string" },
    dte: { order: "none", type: "number" },
    sentiment: { order: "none", type: "sentiment" },
    size: { order: "none", type: "number" },
    price: { order: "none", type: "number" },
    premium: { order: "none", type: "number" },
  };

  const sortData = (key) => {
    // Reset all other keys to 'none' except the current key
    for (const k in sortOrders) {
      if (k !== key) {
        sortOrders[k].order = "none";
      }
    }

    // Cycle through 'none', 'asc', 'desc' for the clicked key
    const orderCycle = ["none", "asc", "desc"];
    let originalData = rawData;
    const currentOrderIndex = orderCycle.indexOf(sortOrders[key].order);
    sortOrders[key].order =
      orderCycle[(currentOrderIndex + 1) % orderCycle.length];
    const sortOrder = sortOrders[key].order;

    // Reset to original data when 'none' and stop further sorting
    if (sortOrder === "none") {
      displayList = [...originalData]?.slice(0, 150); // Reset originalData to rawData
      return;
    }

    // Define a generic comparison function
    const compareValues = (a, b) => {
      const { type } = sortOrders[key];
      let valueA, valueB;

      switch (type) {
        case "date":
          valueA = new Date(a[key]);
          valueB = new Date(b[key]);
          break;
        case "string":
          valueA = a[key].toUpperCase();
          valueB = b[key].toUpperCase();
          return sortOrder === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        case "sentiment":
          const sentimentOrder = { BULLISH: 1, NEUTRAL: 2, BEARISH: 3 };
          const sentimentA = sentimentOrder[a?.sentiment?.toUpperCase()] || 4;
          const sentimentB = sentimentOrder[b?.sentiment?.toUpperCase()] || 4;
          return sortOrder === "asc"
            ? sentimentA - sentimentB
            : sentimentB - sentimentA;

        case "number":
        default:
          valueA = parseFloat(a[key]);
          valueB = parseFloat(b[key]);
          break;
      }

      // Default comparison for numbers and fallback case
      if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
      if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    };

    // Sort using the generic comparison function
    displayList = [...originalData].sort(compareValues)?.slice(0, 150);
  };

  $: {
    if (typeof window !== "undefined" && selectGraphType) {
      isLoaded = false;
      if (rawDataHistory?.length > 0) {
        configContract = plotContractHistory();
      } else {
        configContract = null;
      }

      isLoaded = true;
    }
  }
</script>

<section
  class="w-full bg-default overflow-hidden text-white min-h-screen pb-40"
>
  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <div class="sm:pl-7 sm:pb-7 sm:pt-7 w-full m-auto mt-2 sm:mt-0">
        <h2
          class=" flex flex-row items-center text-white text-xl sm:text-2xl font-bold w-fit mb-2 sm:mb-0"
        >
          Unusual Activity
        </h2>
        <Infobox
          text="Unusual Options trades with a premium of at least 1 million dollar from big whales."
        />

        <div
          class="mt-5 border border-gray-800 rounded"
          use:highcharts={configUnusual}
        ></div>

        <div class="w-full overflow-x-auto text-white">
          <table
            class="w-full table table-sm table-compact bg-table border border-gray-800 rounded-none sm:rounded-md m-auto mt-4 overflow-x-auto"
          >
            <thead>
              <TableHeader {columns} {sortOrders} {sortData} />
            </thead>
            <tbody>
              {#each data?.user?.tier !== "Pro" ? displayList?.slice(0, 3) : displayList as item, index}
                <tr
                  class="sm:hover:bg-[#245073]/10 odd:bg-odd border-b border-gray-800 {index +
                    1 ===
                    rawData?.slice(0, 3)?.length &&
                  !['Pro']?.includes(data?.user?.tier)
                    ? 'opacity-[0.1]'
                    : ''}"
                >
                  <td
                    class="text-white text-sm sm:text-[1rem] text-start whitespace-nowrap"
                  >
                    {formatDate(item?.date)}
                  </td>

                  <td
                    class="text-sm sm:text-[1rem] text-start whitespace-nowrap flex justify-between"
                  >
                    <span
                      class="inline-block px-2 {item?.optionType === 'Calls'
                        ? 'text-[#00FC50]'
                        : 'text-[#FF2F1F]'}"
                    >
                      {item?.optionType}
                    </span>
                    <label
                      on:click={() => handleViewData(item)}
                      on:mouseover={() =>
                        getContractHistory(item?.option_symbol)}
                      class="cursor-pointer text-[#04D9FF] sm:hover:text-white sm:hover:underline sm:hover:underline-offset-4"
                    >
                      {item?.strike}

                      {" " + item?.expiry}

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="inline-block w-4 h-4 -mt-1"
                        viewBox="0 0 512 512"
                        fill="#04D9FF"
                        ><path
                          d="M104 496H72a24 24 0 01-24-24V328a24 24 0 0124-24h32a24 24 0 0124 24v144a24 24 0 01-24 24zM328 496h-32a24 24 0 01-24-24V232a24 24 0 0124-24h32a24 24 0 0124 24v240a24 24 0 01-24 24zM440 496h-32a24 24 0 01-24-24V120a24 24 0 0124-24h32a24 24 0 0124 24v352a24 24 0 01-24 24zM216 496h-32a24 24 0 01-24-24V40a24 24 0 0124-24h32a24 24 0 0124 24v432a24 24 0 01-24 24z"
                        ></path></svg
                      >
                    </label>
                  </td>

                  <td
                    class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                  >
                    {item?.dte}
                  </td>

                  <td
                    class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                  >
                    {item?.unusualType}
                  </td>

                  <td
                    class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                  >
                    {item?.executionEst}
                  </td>

                  <td
                    class="text-sm sm:text-[1rem] text-end whitespace-nowrap {item?.sentiment ===
                    'Bullish'
                      ? 'text-[#00FC50]'
                      : item?.sentiment === 'Bearish'
                        ? 'text-[#FF2F1F]'
                        : 'text-[#C8A32D]'} "
                  >
                    {item?.sentiment}
                  </td>
                  <td
                    class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                  >
                    {item?.size?.toLocaleString("en-US")}
                  </td>

                  <td
                    class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                  >
                    {item?.price}
                  </td>
                  <td
                    class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                  >
                    {@html abbreviateNumberWithColor(
                      item?.premium,
                      false,
                      true,
                    )}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <UpgradeToPro {data} display={true} />
      </div>
    </div>
  </div>
</section>

<dialog
  id="optionDetailsDesktopModal"
  class="modal {$screenWidth < 640 ? 'modal-bottom ' : ''} bg-[#000]/40 sm:px-5"
>
  <div
    class="modal-box w-full {rawDataHistory?.length > 0
      ? 'max-w-7xl'
      : 'w-full'} rounded-md bg-default border-t sm:border border-gray-800 min-h-48 h-auto"
  >
    <form
      method="dialog"
      class="modal-backdrop backdrop-blur-[4px] flex flex-row items-center w-full justify-between"
    >
      <p class="text-white text-[1rem] sm:text-xl font-semibold cursor-text">
        Contract: <span
          class={optionType === "Calls" ? "text-[#00FC50]" : "text-[#FF2F1F]"}
          >{ticker}
          {strikePrice}
          {optionType}
          {dateExpiration} ({daysLeft(dateExpiration)})
        </span>
      </p>
      <button
        class="cursor-pointer text-[1.8rem] text-white focus:outline-hidden"
      >
        <svg
          class="w-8 h-8"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          ><path
            fill="white"
            d="m6.4 18.308l-.708-.708l5.6-5.6l-5.6-5.6l.708-.708l5.6 5.6l5.6-5.6l.708.708l-5.6 5.6l5.6 5.6l-.708.708l-5.6-5.6z"
          />
        </svg>
      </button>
    </form>
    {#if rawDataHistory?.length > 0}
      <div
        class="border-b border-gray-800 w-full mt-2 mb-2 sm:mb-3 sm:mt-3"
      ></div>

      <div class="hidden sm:flex flex-wrap text-white pb-2">
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

      <div class="pb-8 sm:pb-2 rounded-md bg-default overflow-hidden">
        <div
          class="flex flex-row items-center justify-between gap-x-2 ml-auto w-fit mt-2"
        >
          {#each ["Vol/OI", "IV"] as item}
            <label
              on:click={() => (selectGraphType = item)}
              class="px-3 py-1.5 {selectGraphType === item
                ? 'bg-white text-black '
                : 'text-white bg-default text-opacity-[0.6] border border-gray-600'} transition ease-out duration-100 sm:hover:bg-white sm:hover:text-black rounded-md cursor-pointer"
            >
              {item}
            </label>
          {/each}
        </div>
        <div
          class="mt-2 border border-gray-800 rounded"
          use:highcharts={configContract}
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
              class="table table-pin-cols table-sm bg-table border border-gray-800 table-compact rounded-none sm:rounded-md w-full m-auto mt-4 overflow-x-auto"
            >
              <thead class="bg-default">
                <tr class="">
                  <td class="text-white font-semibold text-sm text-start"
                    >Date</td
                  >
                  <td class="text-white font-semibold text-sm text-end">Vol</td>
                  <td class="text-white font-semibold text-sm text-end">OI</td>
                  <td class="text-white font-semibold text-sm text-end"
                    >OI Change</td
                  >
                  <td class="text-white font-semibold text-sm text-end"
                    >% Change OI</td
                  >
                  <td class="text-white font-semibold text-sm text-end"
                    >Last Price</td
                  >
                  <td class="text-white font-semibold text-sm text-end"
                    >Avg Price</td
                  >
                  <td class="text-white font-semibold text-sm text-end">IV</td>
                  <td class="text-white font-semibold text-sm text-end"
                    >Total Prem</td
                  >
                  <td class="text-white font-semibold text-sm text-end">GEX</td>
                  <td class="text-white font-semibold text-sm text-end">DEX</td>
                </tr>
              </thead>
              <tbody>
                {#each optionHistoryList as item}
                  <!-- row -->
                  <tr class="odd:bg-odd border-b border-gray-800">
                    <td class="text-sm sm:text-[1rem] text-start text-white">
                      {formatDate(item?.date)}
                    </td>

                    <td class="text-sm sm:text-[1rem] text-end text-white">
                      {item?.volume !== null
                        ? item?.volume?.toLocaleString("en-US")
                        : 0}
                    </td>

                    <td class="text-sm sm:text-[1rem] text-end text-white">
                      {item?.open_interest !== undefined
                        ? item?.open_interest?.toLocaleString("en-US")
                        : "n/a"}
                    </td>
                    <td class="text-sm sm:text-[1rem] text-end text-white">
                      {#if item?.changeOI >= 0 && item?.changeOI !== null}
                        <span class="text-[#00FC50]"
                          >+{item?.changeOI?.toLocaleString("en-US")}</span
                        >
                      {:else if item?.changeOI < 0 && item?.changeOI !== null}
                        <span class="text-[#FF2F1F]"
                          >{item?.changeOI?.toLocaleString("en-US")}</span
                        >
                      {:else}
                        n/a
                      {/if}
                    </td>

                    <td class="text-sm sm:text-[1rem] text-end text-white">
                      {#if item?.changesPercentageOI > 0 && item?.changesPercentageOI !== undefined}
                        <span class="text-[#00FC50]"
                          >+{item?.changesPercentageOI + "%"}</span
                        >
                      {:else if item?.changesPercentageOI < 0 && item?.changesPercentageOI !== undefined}
                        <span class="text-[#FF2F1F]"
                          >{item?.changesPercentageOI + "%"}</span
                        >
                      {:else if item?.changesPercentageOI === 0 && item?.changesPercentageOI !== undefined}
                        0%
                      {:else}
                        n/a
                      {/if}
                    </td>

                    <td class="text-sm sm:text-[1rem] text-end text-white">
                      {item?.close}
                    </td>

                    <td class="text-sm sm:text-[1rem] text-end text-white">
                      {item?.mark}
                    </td>

                    <td class="text-sm sm:text-[1rem] text-end text-white">
                      {(item?.implied_volatility * 100)?.toLocaleString(
                        "en-US",
                      ) + "%"}
                    </td>

                    <td class="text-sm sm:text-[1rem] text-end text-white">
                      {@html abbreviateNumberWithColor(
                        item?.total_premium,
                        false,
                        true,
                      )}
                    </td>
                    <td class="text-sm sm:text-[1rem] text-end text-white">
                      {@html abbreviateNumberWithColor(item?.gex, false, true)}
                    </td>
                    <td class="text-sm sm:text-[1rem] text-end text-white">
                      {@html abbreviateNumberWithColor(item?.dex, false, true)}
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
        class="mt-10 flex justify-center sm:justify-start items-center w-full text-white"
      >
        No historical data available yet for the given contract
      </div>
    {/if}
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
