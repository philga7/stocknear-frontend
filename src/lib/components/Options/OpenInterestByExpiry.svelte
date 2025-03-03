<script lang="ts">
  import { abbreviateNumberWithColor, abbreviateNumber } from "$lib/utils";
  import { onMount } from "svelte";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";
  import highcharts from "$lib/highcharts.ts";

  export let data;

  let rawData = data?.getData || [];

  const today = new Date();

  rawData = rawData?.reduce((result, item) => {
    const itemDate = new Date(item?.expiry);
    if (itemDate >= today) {
      result.push({
        ...item,
        put_call_ratio:
          item?.call_oi > 0
            ? Math.abs((item?.put_oi || 0) / item.call_oi)
            : null,
      });
    }
    return result;
  }, []);

  let displayList = rawData?.slice(0, 150);

  function plotData() {
    const processedData = rawData?.map((d) => ({
      expiry: d?.expiry,
      callValue: d?.call_oi,
      putValue: d?.put_oi,
    }));

    const categories = processedData?.map((d) => d.expiry);
    const callValues = processedData?.map(
      (d) => parseFloat(d.callValue?.toFixed(2)) || 0,
    );
    const putValues = processedData?.map(
      (d) => parseFloat(d.putValue?.toFixed(2)) || 0,
    );

    const options = {
      chart: {
        backgroundColor: "#09090B",
        animation: false,
        height: 360,
      },
      credits: { enabled: false },
      legend: { enabled: false },
      title: {
        text: `<h3 class="mt-3 mb-1">Open Interest By Expiry</h3>`,
        useHTML: true,
        style: { color: "white" },
      },
      xAxis: {
        type: "category",
        categories: categories,
        crosshair: {
          color: "#fff",
          width: 1,
          dashStyle: "Solid",
        },
        labels: {
          style: {
            color: "#fff",
          },
          distance: 10, // Adjust space between labels and axis
          formatter: function () {
            const date = new Date(this.value);
            return date.toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short", // "Jan", "Feb", etc.
              year: "numeric",
            });
          },
        },
        tickInterval: Math.max(1, Math.floor(categories.length / 5)), // Ensures better spacing
        tickPositioner: function () {
          const positions = [];
          const tickCount = 5; // Reduce number of ticks displayed
          const totalPoints = this.categories.length;
          const interval = Math.max(1, Math.floor(totalPoints / tickCount));

          for (let i = 0; i < totalPoints; i += interval) {
            positions.push(i);
          }
          return positions;
        },
      },

      yAxis: {
        gridLineWidth: 1,
        gridLineColor: "#111827",
        labels: {
          style: { color: "white" },
        },
        title: { text: null },
        opposite: true,
      },
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
      plotOptions: {
        animation: false,
        column: {
          grouping: true,
          shadow: false,
          borderWidth: 0,
        },
      },

      series: [
        {
          name: "Put",
          type: "column",
          data: putValues,
          color: "#FF2F1F",
          borderColor: "#FF2F1F",
          borderRadius: "2px",
          animation: false,
        },
        {
          name: "Call",
          type: "column",
          data: callValues,
          color: "#00FC50",
          borderColor: "#00FC50",
          borderRadius: "2px",
          animation: false,
        },
      ],
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

  onMount(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  $: columns = [
    { key: "expiry", label: "Expiry Date", align: "left" },
    {
      key: "call_oi",
      label: `Call OI`,
      align: "right",
    },
    {
      key: "put_oi",
      label: `Put OI`,
      align: "right",
    },
    {
      key: "put_call_ratio",
      label: `P/C OI`,
      align: "right",
    },
  ];

  $: sortOrders = {
    expiry: { order: "none", type: "date" },
    call_oi: { order: "none", type: "number" },
    put_oi: { order: "none", type: "number" },
    put_call_ratio: { order: "none", type: "number" },
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

  let config = plotData() || null;
</script>

<div class="sm:pl-7 sm:pb-7 sm:pt-7 w-full m-auto mt-2 sm:mt-0">
  <h2
    class=" flex flex-row items-center text-white text-xl sm:text-2xl font-bold w-fit"
  >
    Open Interest Chart
  </h2>

  <div class="w-full overflow-hidden m-auto mt-3">
    {#if config !== null}
      <div
        class="border border-gray-800 rounded w-full"
        use:highcharts={config}
      ></div>
    {/if}
  </div>

  <h3 class="mt-5 text-xl sm:text-2xl text-white font-bold mb-3">
    Open Interest Table
  </h3>

  <div class="w-full overflow-x-auto text-white">
    <table
      class="w-full table table-sm table-compact bg-table border border-gray-800 rounded-none sm:rounded-md m-auto overflow-x-auto"
    >
      <thead>
        <TableHeader {columns} {sortOrders} {sortData} />
      </thead>
      <tbody>
        {#each data?.user?.tier === "Pro" ? displayList : displayList?.slice(0, 3) as item, index}
          <tr
            class="sm:hover:bg-[#245073]/10 odd:bg-odd border-b border-gray-800 {index +
              1 ===
              displayList?.slice(0, 3)?.length && data?.user?.tier !== 'Pro'
              ? 'opacity-[0.1]'
              : ''}"
          >
            <td
              class="text-white text-sm sm:text-[1rem] text-start whitespace-nowrap"
            >
              {new Date(item?.expiry).toLocaleDateString("en-US", {
                month: "short", // Abbreviated month (e.g., Jan)
                day: "numeric", // Numeric day (e.g., 10)
                year: "numeric", // Full year (e.g., 2025)
              })}
            </td>
            <td
              class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
            >
              {@html abbreviateNumberWithColor(
                item?.call_oi?.toFixed(2),
                false,
                true,
              )}
            </td>
            <td
              class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
            >
              {@html abbreviateNumberWithColor(
                item?.put_oi?.toFixed(2),
                false,
                true,
              )}
            </td>

            <td
              class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
            >
              {#if item?.put_call_ratio <= 1 && item?.put_call_ratio !== null}
                <span class="text-[#00FC50]"
                  >{item?.put_call_ratio?.toFixed(2)}</span
                >
              {:else if item?.put_call_ratio > 1 && item?.put_call_ratio !== null}
                <span class="text-[#FF2F1F]"
                  >{item?.put_call_ratio?.toFixed(2)}</span
                >
              {:else}
                n/a
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <UpgradeToPro {data} />
</div>
