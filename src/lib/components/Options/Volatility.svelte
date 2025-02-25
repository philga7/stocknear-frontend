<script lang="ts">
  import {
    removeCompanyStrings,
    abbreviateNumberWithColor,
    abbreviateNumber,
  } from "$lib/utils";
  import { displayCompanyName } from "$lib/store";
  import { onMount } from "svelte";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";
  import highcharts from "$lib/highcharts.ts";

  export let data;

  let rawData = data?.getData || [];
  rawData = rawData?.map((item) => ({
    ...item,
    volatilitySpread:
      item?.rv !== null ? (item?.iv - item?.rv)?.toFixed(2) : null,
  }));

  const avgIV =
    rawData?.reduce((acc, entry) => acc + entry.iv, 0) / rawData?.length;
  const avgRV =
    rawData?.reduce((acc, entry) => acc + entry.rv, 0) / rawData?.length;

  let displayList = rawData?.slice(0, 150);
  let timePeriod = "3M";

  let config = null;

  function filterDataByPeriod(historicalData, period = "3M") {
    const currentDate = new Date();
    let startDate = new Date();

    // Calculate the start date based on the period input
    switch (period) {
      case "3M":
        startDate.setMonth(currentDate.getMonth() - 3);
        break;
      case "6M":
        startDate.setMonth(currentDate.getMonth() - 6);
        break;
      case "1Y":
        startDate.setFullYear(currentDate.getFullYear() - 1);
        break;
      default:
        throw new Error(`Unsupported period: ${period}`);
    }

    // Filter the data based on the calculated start date
    let filteredData = historicalData?.filter((item) => {
      if (!item?.date) return false;
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= currentDate;
    });

    filteredData?.forEach((entry) => {
      const matchingData = data?.getHistoricalPrice?.find(
        (d) => d?.time === entry?.date,
      );
      if (matchingData) {
        entry.price = matchingData?.close;
      }
    });

    // Extract the dates and gamma values from the filtered data
    const dateList = filteredData?.map((item) => item.date);
    const impliedVolatility = filteredData?.map((item) => item?.iv);
    const realizedVolatility = filteredData?.map((item) => item?.rv);

    const volatilitySpread = filteredData?.map((item) =>
      item?.volatilitySpread ? Number(item?.volatilitySpread) : null,
    );
    const priceList = filteredData?.map((item) => item.price);

    return {
      dateList,
      impliedVolatility,
      realizedVolatility,
      volatilitySpread,
      priceList,
    };
  }

  function plotData() {
    // Sort and filter the raw data as before
    const data = rawData?.sort((a, b) => new Date(a?.date) - new Date(b?.date));
    const {
      dateList,
      impliedVolatility,
      realizedVolatility,
      volatilitySpread,
      priceList,
    } = filterDataByPeriod(data, timePeriod);

    console.log(volatilitySpread);
    const options = {
      chart: {
        backgroundColor: "#09090B",
        animation: false,
        height: 360,
      },
      credits: { enabled: false },
      legend: { enabled: false },
      title: {
        text: `<h3 class="mt-3 mb-1">Volatiltiy Exposure</h3>`,
        useHTML: true,
        style: { color: "white" },
      },
      // Disable markers globally on hover for all series
      xAxis: {
        type: "datetime",
        endOnTick: false,
        categories: dateList,
        crosshair: {
          color: "#fff", // Set the color of the crosshair line
          width: 1, // Adjust the line width as needed
          dashStyle: "Solid",
        },
        labels: {
          style: {
            color: "#fff",
          },
          distance: 20, // Increases space between label and axis
          formatter: function () {
            const date = new Date(this.value);
            return date.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            });
          },
        },
        tickPositioner: function () {
          // Create custom tick positions with wider spacing
          const positions = [];
          const info = this.getExtremes();
          const tickCount = 5; // Reduce number of ticks displayed
          const interval = Math?.floor((info?.max - info?.min) / tickCount);

          for (let i = 0; i <= tickCount; i++) {
            positions?.push(info?.min + i * interval);
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
          // Primary yAxis (left) – for volatility series
          labels: { enabled: false },
          title: { text: null },
          gridLineWidth: 0,
        },
        {
          // Primary yAxis (left) – for volatility series
          labels: { enabled: false },
          title: { text: null },
          gridLineWidth: 0,
        },
      ],
      tooltip: {
        shared: true,
        useHTML: true,
        backgroundColor: "rgba(0, 0, 0, 0.8)", // Semi-transparent black
        borderColor: "rgba(255, 255, 255, 0.2)", // Slightly visible white border
        borderWidth: 1,
        style: {
          color: "#fff",
          fontSize: "16px",
          padding: "10px",
        },
        borderRadius: 4,
        formatter: function () {
          // Format the x value to display time in hh:mm format
          let tooltipContent = `<span class="text-white m-auto text-black text-[1rem] font-[501]">${new Date(
            this?.x,
          ).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}</span><br>`;

          // Loop through each point in the shared tooltip
          this.points.forEach((point) => {
            tooltipContent += `<span class="text-white font-semibold text-sm">${point.series.name}:</span> 
          <span class="text-white font-normal text-sm" style="color:${point.color}">${abbreviateNumber(
            point.y,
          )}</span><br>`;
          });

          return tooltipContent;
        },
      },
      // Disable markers globally on hover for all series
      plotOptions: {
        series: {
          marker: {
            enabled: false,
            states: {
              hover: {
                enabled: false,
              },
            },
          },
        },
      },
      series: [
        {
          name: "Stock Price",
          type: "spline", // smooth line
          data: priceList,
          yAxis: 1,
          lineWidth: 2,
          color: "#fff",
          animation: false,
        },
        {
          name: "Implied Volatility",
          type: "spline",
          data: impliedVolatility,
          lineWidth: 2,
          yAxis: 0,
          color: "#FAD776",
          animation: false,
        },
        {
          name: "Realized Volatility",
          type: "spline",
          data: realizedVolatility,
          lineWidth: 2,
          yAxis: 0,
          color: "#007BFF",
          animation: false,
        },
        {
          name: "Vol. Spread",
          type: "column", // Highcharts column chart for bars
          yaxis: 2,
          data: volatilitySpread,
          color: "#9B5DC4",
          borderColor: "#9B5DC4",
          borderRadius: "1px",
          animation: false,
        },
      ],
    };

    return options;
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

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;

    if (isBottom && displayList?.length !== rawData?.length) {
      const nextIndex = displayList?.length;
      const filteredNewResults = rawData?.slice(nextIndex, nextIndex + 50);
      displayList = [...displayList, ...filteredNewResults];
    }
  }

  onMount(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  $: columns = [
    { key: "date", label: "Date", align: "left" },
    {
      key: "changesPercentage",
      label: "% Change",
      align: "right",
    },
    {
      key: "putCallRatio",
      label: "P/C",
      align: "right",
    },
    {
      key: "total_open_interest",
      label: "Total OI",
      align: "right",
    },
    {
      key: "changesPercentageOI",
      label: "% OI Change",
      align: "right",
    },
    {
      key: "iv",
      label: "Implied Volatility",
      align: "right",
    },
    {
      key: "rv",
      label: "Realized Vol.",
      align: "right",
    },
    { key: "volatilitySpread", label: "Vol. Spread", align: "right" },
  ];

  $: sortOrders = {
    date: { order: "none", type: "date" },
    changesPercentage: { order: "none", type: "number" },
    putCallRatio: { order: "none", type: "number" },
    iv: { order: "none", type: "number" },
    rv: { order: "none", type: "number" },
    volatilitySpread: { order: "none", type: "number" },
    total_open_interest: { order: "none", type: "number" },
    changesPercentageOI: { order: "none", type: "number" },
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
    let originalData = rawData?.sort(
      (a, b) => new Date(b?.date) - new Date(a?.date),
    );
    const currentOrderIndex = orderCycle.indexOf(sortOrders[key].order);
    sortOrders[key].order =
      orderCycle[(currentOrderIndex + 1) % orderCycle.length];
    const sortOrder = sortOrders[key].order;

    // Reset to original data when 'none' and stop further sorting
    if (sortOrder === "none") {
      originalData = [...rawData]; // Reset originalData to rawDataVolume
      displayList = originalData;
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
    displayList = [...originalData].sort(compareValues);
  };

  $: {
    if (timePeriod) {
      config = plotData();
    }
  }
</script>

<div class="sm:pl-7 sm:pb-7 sm:pt-7 w-full m-auto mt-2 sm:mt-0">
  <h2
    class=" flex flex-row items-center text-white text-xl sm:text-2xl font-bold w-fit"
  >
    Volatility Exposure
  </h2>
  <div class="w-full mt-2">
    {removeCompanyStrings($displayCompanyName)} has experienced an average implied
    volatility of {avgIV?.toFixed(2)} and an average realized volatility of {avgRV?.toFixed(
      2,
    )}.
  </div>

  <div class="w-full overflow-hidden m-auto">
    {#if config !== null}
      <div class="flex justify-end pt-5 pb-2 space-x-2 ml-auto z-10">
        {#each ["3M", "6M", "1Y"] as item, index}
          {#if data?.user?.tier === "Pro" || index === 0}
            <label
              on:click={() => (timePeriod = item)}
              class="px-3 py-1 text-sm {timePeriod === item
                ? 'bg-white text-black '
                : 'text-white bg-table text-opacity-[0.6]'} transition ease-out duration-100 sm:hover:bg-white sm:hover:text-black rounded-md cursor-pointer"
            >
              {item}
            </label>
          {:else if data?.user?.tier !== "Pro"}
            <a
              href="/pricing"
              class="px-3 py-1 text-sm flex flex-row items-center {timePeriod ===
              item
                ? 'bg-white text-black '
                : 'text-white bg-table text-opacity-[0.6]'} transition ease-out duration-100 sm:hover:bg-white sm:hover:text-black rounded-md cursor-pointer"
            >
              {item}
              <svg
                class="ml-1 -mt-w-3.5 h-3.5 inline-block"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                ><path
                  fill="#A3A3A3"
                  d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                /></svg
              >
            </a>
          {/if}
        {/each}
      </div>

      <div
        class="border border-gray-800 rounded w-full"
        use:highcharts={config}
      ></div>
    {/if}
  </div>

  <h3 class="mt-5 text-xl sm:text-2xl text-white font-bold mb-2 sm:mb-0">
    Volatility History
  </h3>
  <div class="w-full overflow-x-scroll text-white mt-5">
    <table
      class="w-full table table-sm table-compact bg-table border border-gray-800 rounded-none sm:rounded-md m-auto overflow-x-auto"
    >
      <thead>
        <TableHeader {columns} {sortOrders} {sortData} />
      </thead>
      <tbody>
        {#each data?.user?.tier === "Pro" ? displayList : displayList?.slice(0, 3) as item, index}
          <tr
            class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-odd border-b border-gray-800 {index +
              1 ===
              displayList?.slice(0, 3)?.length && data?.user?.tier !== 'Pro'
              ? 'opacity-[0.1]'
              : ''}"
          >
            <td
              class="text-white text-sm sm:text-[1rem] text-start whitespace-nowrap"
            >
              {formatDate(item?.date)}
            </td>

            <td class="text-white text-sm sm:text-[1rem] text-end">
              {#if item?.changesPercentage >= 0 && item?.changesPercentage !== null}
                <span class="text-[#00FC50]"
                  >+{item?.changesPercentage >= 1000
                    ? abbreviateNumberWithColor(item?.changesPercentage)
                    : item?.changesPercentage?.toFixed(2)}%</span
                >
              {:else if item?.changesPercentage < 0 && item?.changesPercentage !== null}
                <span class="text-[#FF2F1F]"
                  >{item?.changesPercentage <= -1000
                    ? abbreviateNumberWithColor(item?.changesPercentage)
                    : item?.changesPercentage?.toFixed(2)}%
                </span>
              {:else}
                n/a
              {/if}
            </td>

            <td class="text-sm sm:text-[1rem] text-end text-white">
              {item?.putCallRatio}
            </td>

            <td class="text-sm sm:text-[1rem] text-end text-white">
              {@html abbreviateNumberWithColor(
                item?.total_open_interest,
                false,
                true,
              )}
            </td>

            <td class="text-white text-sm sm:text-[1rem] text-end">
              {#if item?.changesPercentageOI >= 0 && item?.changesPercentageOI !== null}
                <span class="text-[#00FC50]"
                  >+{item?.changesPercentageOI >= 1000
                    ? abbreviateNumberWithColor(item?.changesPercentageOI)
                    : item?.changesPercentageOI?.toFixed(2)}%</span
                >
              {:else if item?.changesPercentageOI < 0 && item?.changesPercentageOI !== null}
                <span class="text-[#FF2F1F]"
                  >{item?.changesPercentageOI <= -1000
                    ? abbreviateNumberWithColor(item?.changesPercentageOI)
                    : item?.changesPercentageOI?.toFixed(2)}%
                </span>
              {:else}
                <span class="text-white"> n/a </span>
              {/if}
            </td>

            <td
              class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
            >
              {item?.iv}
            </td>
            <td
              class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
            >
              {item?.rv ?? "n/a"}
            </td>

            <td
              class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
            >
              {item?.volatilitySpread ?? "n/a"}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <UpgradeToPro {data} />
</div>
