<script lang="ts">
  import { stockTicker, etfTicker, screenWidth } from "$lib/store";
  import { abbreviateNumber } from "$lib/utils";
  import highcharts from "$lib/highcharts.ts";
  import { mode } from "mode-watcher";

  export let data;

  let config;

  function getPlotChart() {
    const rawData = data?.getOneDayPrice || [];
    const darkPoolVolume = data?.getPriceLevel?.trend || [];

    const baseDate =
      rawData && rawData?.length ? new Date(rawData?.at(0)?.time) : new Date();

    // Set the fixed start and end times (9:30 and 16:00)
    const startTime = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      9,
      30,
    ).getTime();
    const endTime = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      16,
      0,
    ).getTime();

    // Convert rawData into series data for the line chart
    const seriesData = rawData?.map((item) => [
      Date.UTC(
        new Date(item?.time).getUTCFullYear(),
        new Date(item?.time).getUTCMonth(),
        new Date(item?.time).getUTCDate(),
        new Date(item?.time).getUTCHours(),
        new Date(item?.time).getUTCMinutes(),
        new Date(item?.time).getUTCSeconds(),
      ),
      item?.close,
    ]);

    // Convert darkPoolVolume into series data for the bar chart
    const darkPoolSeries = darkPoolVolume?.map((item) => [
      Date.UTC(
        new Date(item?.date).getUTCFullYear(),
        new Date(item?.date).getUTCMonth(),
        new Date(item?.date).getUTCDate(),
        new Date(item?.date).getUTCHours(),
        new Date(item?.date).getUTCMinutes(),
      ),
      item?.totalSize,
    ]);

    // Find the lowest & highest close values
    let minValue = Math?.min(...rawData?.map((item) => item?.close));
    let maxValue = Math?.max(...rawData?.map((item) => item?.close));

    if (minValue - 0 < 1) {
      minValue = data?.getStockQuote?.dayLow;
    }

    let padding = 0.015;
    let yMin = minValue * (1 - padding) === 0 ? null : minValue * (1 - padding);
    let yMax = maxValue * (1 + padding) === 0 ? null : maxValue * (1 + padding);

    const fillColorStart = "rgb(70, 129, 244,0.5)";
    const fillColorEnd = "rgb(70, 129, 244,0.001)";

    const options = {
      chart: {
        backgroundColor: $mode === "light" ? "#fff" : "#09090B",
        animation: false,
        height: 360,
      },
      credits: { enabled: false },
      legend: {
        enabled: true,
        align: "center", // Positions legend at the left edge
        verticalAlign: "top", // Positions legend at the top
        layout: "horizontal", // Align items horizontally (use 'vertical' if preferred)
        itemStyle: {
          color: $mode === "light" ? "black" : "white",
        },
        symbolWidth: 16, // Controls the width of the legend symbol
        symbolRadius: 8, // Creates circular symbols (adjust radius as needed)
        squareSymbol: false, // Ensures symbols are circular, not square
      },
      title: {
        text: `<h3 class="mt-3 -mb-3 text-[1rem] sm:text-lg">Realtime Dark Pool Trades Impact</h3>`,
        useHTML: true,
        style: { color: $mode === "light" ? "black" : "white" },
      },
      xAxis: {
        type: "datetime",
        min: startTime, // Force start at 9:30
        max: endTime, // Force end at 16:10
        crosshair: {
          color: $mode === "light" ? "black" : "white", // Set the color of the crosshair line
          width: 1, // Adjust the line width as needed
          dashStyle: "Solid",
        },
        labels: {
          style: { color: $mode === "light" ? "#545454" : "white" },
          distance: 10, // Increases space between label and axis
          formatter: function () {
            const date = new Date(this?.value);
            const timeString = date?.toLocaleTimeString("en-US", {
              hour: "numeric",
              hour12: true,
            });
            return `<span class="text-xs">${timeString.replace(/\s/g, " ")}</span>`;
          },
        },
        tickPositioner: function () {
          // Create custom tick positions with wider spacing
          const positions = [];
          const info = this.getExtremes();
          const tickCount = 5; // Reduce number of ticks displayed
          const interval = (info.max - info.min) / tickCount;

          for (let i = 0; i <= tickCount; i++) {
            positions.push(info.min + i * interval);
          }
          return positions;
        },
      },
      yAxis: [
        {
          // Primary yAxis for price
          min: yMin ?? null,
          max: yMax ?? null,
          title: { text: null },
          labels: { style: { color: $mode === "light" ? "#545454" : "white" } },
          gridLineWidth: 1,
          gridLineColor: $mode === "light" ? "#e5e7eb" : "#111827",
          opposite: true,
        },
        {
          title: {
            text: $screenWidth < 640 ? null : "Total Trades",
            style: { color: $mode === "light" ? "#545454" : "white" },
          },
          labels: { style: { color: $mode === "light" ? "#545454" : "white" } },
          gridLineWidth: 0,
          opposite: false,
        },
      ],
      tooltip: {
        shared: true,
        useHTML: true,
        backgroundColor: "rgba(0, 0, 0, 0.8)", // Semi-transparent black
        borderColor: "rgba(255, 255, 255, 0.2)", // Slightly visible white border
        borderWidth: 1,
        style: {
          color: $mode === "light" ? "black" : "white",
          fontSize: "16px",
          padding: "10px",
        },
        borderRadius: 4,
        formatter: function () {
          const date = new Date(this?.x);
          let formattedDate = date?.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "UTC",
          });

          let tooltipContent = `<span class="text-white m-auto text-black text-sm font-normal">${formattedDate}</span><br>`;

          // Loop through each point in the shared tooltip
          this.points?.forEach((point) => {
            tooltipContent += `<span class="text-white text-sm font-[501]">${point.series.name}: ${abbreviateNumber(point.y)}</span><br>`;
          });

          return tooltipContent;
        },
      },
      plotOptions: {
        series: {
          animation: false,
          marker: {
            enabled: false,
            states: {
              hover: { enabled: false }, // Disable marker on hover
              select: { enabled: false }, // Disable marker on selection
            },
          },
        },
        column: {
          opacity: 1,
          animation: false,
          marker: {
            enabled: false,
            states: {
              hover: { enabled: false }, // Disable marker on hover
              select: { enabled: false }, // Disable marker on selection
            },
          },
        },
      },
      series: [
        {
          name: "Price",
          type: "spline",
          data: seriesData,
          color: $mode === "light" ? "#4681f4" : "#fff",
          lineWidth: 1.3,
          yAxis: 0, // Use primary yAxis
          animation: false,
        },
        {
          name: "DP Volume",
          type: "column",
          data: darkPoolSeries,
          color: "#F21C64",
          borderColor: "#F21C64",
          yAxis: 1, // Use secondary yAxis
          animation: false,
        },
      ],
    };

    return options;
  }

  $: if ($mode) {
    config = null;
    config = getPlotChart() || null;
  }
</script>

<div>
  <div class="grow">
    <div class="relative">
      <!-- Apply the blur class to the chart -->
      <div
        class="{!['Pro']?.includes(data?.user?.tier)
          ? 'blur-[3px]'
          : ''}  border border-gray-300 dark:border-gray-800 rounded"
        use:highcharts={config}
      ></div>
      <!-- Overlay with "Upgrade to Pro" -->
      {#if !["Pro"]?.includes(data?.user?.tier)}
        <div
          class="font-bold text-lg sm:text-xl absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center text-muted dark:text-white"
        >
          <a
            href="/pricing"
            class="sm:hover:text-blue-700 dark:sm:hover:text-white dark:text-white flex flex-row items-center"
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
