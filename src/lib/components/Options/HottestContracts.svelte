<script lang="ts">
  import { abbreviateNumberWithColor, abbreviateNumber } from "$lib/utils";
  import { setCache, getCache, screenWidth } from "$lib/store";

  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";
  import highcharts from "$lib/highcharts.ts";

  export let data;
  export let ticker;

  let isLoaded = false;
  let config = null;

  let optionHistoryList = [];
  let selectGraphType = "Vol/OI";
  let container;
  let rawDataHistory = [];
  let strikePrice;
  let optionType;
  let dateExpiration;
  let otmPercentage;

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

  let volumeList = rawDataVolume;
  let openInterestList = rawDataOI;

  $: columns = [
    { key: "strike_price", label: "Chain", align: "left" },
    { key: "dte", label: "DTE", align: "right" },
    { key: "otm", label: "% OTM", align: "right" },
    { key: "last", label: "Last", align: "right" },
    { key: "high", label: "Low-High", align: "right" },
    { key: "volume", label: "Volume", align: "right" },
    { key: "open_interest", label: "OI", align: "right" },
    { key: "open_interest_change", label: "OI Change", align: "right" },
    { key: "iv", label: "IV", align: "right" },
    { key: "total_premium", label: "Total Prem", align: "right" },
  ];

  $: sortOrders = {
    strike_price: { order: "none", type: "number" },
    dte: { order: "none", type: "number" },
    otm: { order: "none", type: "number" },
    last: { order: "none", type: "number" },
    high: { order: "none", type: "number" },
    volume: { order: "none", type: "number" },
    open_interest: { order: "none", type: "number" },
    open_interest_change: { order: "none", type: "number" },
    iv: { order: "none", type: "number" },
    total_premium: { order: "none", type: "number" },
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
    let originalData = rawDataVolume;
    const currentOrderIndex = orderCycle.indexOf(sortOrders[key].order);
    sortOrders[key].order =
      orderCycle[(currentOrderIndex + 1) % orderCycle.length];
    const sortOrder = sortOrders[key].order;

    // Reset to original data when 'none' and stop further sorting
    if (sortOrder === "none") {
      originalData = [...rawDataVolume]; // Reset originalData to rawDataVolume
      volumeList = originalData;
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
        case "number":
        default:
          valueA = parseFloat(a[key]);
          valueB = parseFloat(b[key]);
          break;
      }

      if (sortOrder === "asc") {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    };

    // Sort using the generic comparison function
    volumeList = [...originalData].sort(compareValues);
  };

  const sortDataOI = (key) => {
    // Reset all other keys to 'none' except the current key
    for (const k in sortOrders) {
      if (k !== key) {
        sortOrders[k].order = "none";
      }
    }

    // Cycle through 'none', 'asc', 'desc' for the clicked key
    const orderCycle = ["none", "asc", "desc"];
    let originalData = rawDataOI;
    const currentOrderIndex = orderCycle.indexOf(sortOrders[key].order);
    sortOrders[key].order =
      orderCycle[(currentOrderIndex + 1) % orderCycle.length];
    const sortOrder = sortOrders[key].order;

    // Reset to original data when 'none' and stop further sorting
    if (sortOrder === "none") {
      originalData = [...rawDataOI]; // Reset originalData to rawDataOI
      volumeList = originalData;
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
        case "number":
        default:
          valueA = parseFloat(a[key]);
          valueB = parseFloat(b[key]);
          break;
      }

      if (sortOrder === "asc") {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    };

    // Sort using the generic comparison function
    openInterestList = [...originalData].sort(compareValues);
  };

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
          Hottest Contracts (Highest Volume)
        </h2>
        <div class="w-full overflow-x-auto text-white">
          <table
            class="w-full table table-sm table-compact bg-table border border-gray-800 rounded-none sm:rounded-md m-auto mt-4 overflow-x-auto"
          >
            <thead>
              <TableHeader {columns} {sortOrders} {sortData} />
            </thead>
            <tbody>
              {#each volumeList as item, index}
                <tr
                  class="sm:hover:bg-[#245073]/10 odd:bg-odd border-b border-gray-800 {index +
                    1 ===
                    volumeList?.slice(0, 3)?.length &&
                  !['Pro']?.includes(data?.user?.tier)
                    ? 'opacity-[0.1]'
                    : ''}"
                >
                  <td
                    class=" text-sm sm:text-[1rem] text-start whitespace-nowrap"
                  >
                    <span
                      class={item?.option_type === "C"
                        ? "text-[#00FC50]"
                        : "text-[#FF2F1F]"}
                    >
                      {item?.option_type === "C" ? "Call" : "Put"}
                    </span>
                    <label
                      on:click={() => handleViewData(item)}
                      on:mouseover={() =>
                        getContractHistory(item?.option_symbol)}
                      class="px-2 sm:px-0 cursor-pointer text-[#04D9FF] sm:hover:text-white sm:hover:underline sm:hover:underline-offset-4"
                    >
                      {item?.strike_price}

                      {" " + item?.date_expiration}

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
                    {item?.otm}%
                  </td>
                  <td
                    class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                  >
                    {item?.last ?? "n/a"}
                  </td>
                  <td
                    class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                  >
                    {#if item?.low && item?.high}
                      {item?.low}-{item?.high}
                    {:else}
                      n/a
                    {/if}
                  </td>
                  <td
                    class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                  >
                    {item?.volume?.toLocaleString("en-US")}
                  </td>
                  <td
                    class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                  >
                    {item?.open_interest?.toLocaleString("en-US")}
                  </td>
                  <td
                    class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                  >
                    {#if item?.changeOI >= 0}
                      <span class="text-[#00FC50]"
                        >+{item?.changeOI?.toLocaleString("en-US")}</span
                      >
                    {:else if item?.changeOI < 0}
                      <span class="text-[#FF2F1F]"
                        >{item?.changeOI?.toLocaleString("en-US")}</span
                      >
                    {:else}
                      n/a
                    {/if}
                  </td>
                  <td class="text-sm sm:text-[1rem] text-end">
                    {item?.iv ? item?.iv + "%" : "n/a"}
                  </td>
                  <td
                    class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                  >
                    {@html abbreviateNumberWithColor(
                      item?.total_premium,
                      false,
                      true,
                    )}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <h2
          class=" flex flex-row items-center text-white text-xl sm:text-2xl font-bold w-fit mt-10"
        >
          Highest OI Contracts
        </h2>
        <div class="w-full overflow-x-auto text-white">
          <table
            class="w-full table table-sm table-compact bg-table border border-gray-800 rounded-none sm:rounded-md m-auto mt-4 overflow-x-auto"
          >
            <thead>
              <TableHeader {columns} {sortOrders} sortData={sortDataOI} />
            </thead>
            <tbody>
              {#each openInterestList as item, index}
                <tr
                  class="sm:hover:bg-[#245073]/10 odd:bg-odd border-b border-gray-800 {index +
                    1 ===
                    openInterestList?.slice(0, 3)?.length &&
                  !['Pro']?.includes(data?.user?.tier)
                    ? 'opacity-[0.1]'
                    : ''}"
                >
                  <td
                    class=" text-sm sm:text-[1rem] text-start whitespace-nowrap"
                  >
                    <span
                      class={item?.option_type === "C"
                        ? "text-[#00FC50]"
                        : "text-[#FF2F1F]"}
                    >
                      {item?.option_type === "C" ? "Call" : "Put"}
                    </span>
                    <label
                      on:click={() => handleViewData(item)}
                      on:mouseover={() =>
                        getContractHistory(item?.option_symbol)}
                      class="cursor-pointer text-[#04D9FF] sm:hover:text-white sm:hover:underline sm:hover:underline-offset-4"
                    >
                      {item?.strike_price}

                      {" " + item?.date_expiration}

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="inline-block w-4 h-4"
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
                    {item?.otm}%
                  </td>
                  <td
                    class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                  >
                    {item?.last ?? "n/a"}
                  </td>
                  <td
                    class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                  >
                    {#if item?.low && item?.high}
                      {item?.low}-{item?.high}
                    {:else}
                      n/a
                    {/if}
                  </td>
                  <td
                    class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                  >
                    {item?.volume?.toLocaleString("en-US")}
                  </td>
                  <td
                    class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                  >
                    {item?.open_interest?.toLocaleString("en-US")}
                  </td>
                  <td
                    class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                  >
                    {#if item?.changeOI >= 0}
                      <span class="text-[#00FC50]"
                        >+{item?.changeOI?.toLocaleString("en-US")}</span
                      >
                    {:else if item?.changeOI < 0}
                      <span class="text-[#FF2F1F]"
                        >{item?.changeOI?.toLocaleString("en-US")}</span
                      >
                    {:else}
                      n/a
                    {/if}
                  </td>
                  <td class="text-sm sm:text-[1rem] text-end">
                    {item?.iv ? item?.iv + "%" : "n/a"}
                  </td>
                  <td
                    class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                  >
                    {@html abbreviateNumberWithColor(
                      item?.total_premium,
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
