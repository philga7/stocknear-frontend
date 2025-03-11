<script lang="ts">
  import { stockTicker, etfTicker } from "$lib/store";
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

    const options = {
      chart: {
        backgroundColor: $mode === "light" ? "#fff" : "#09090B",
        animation: false,
        height: 360,
      },
      credits: { enabled: false },
      legend: { enabled: false },
      title: {
        text: `<h3 class="mt-3 mb-1 text-[1rem] sm:text-lg">Realtime Dark Pool Trades Impact</h3>`,
        useHTML: true,
        style: { color: $mode === "light" ? "black" : "white" },
      },
      xAxis: {
        type: "datetime",
        min: startTime,
        max: endTime,
        tickLength: 0,
        crosshair: {
          color: $mode === "light" ? "black" : "white",
          width: 1,
          dashStyle: "Solid",
        },
        labels: {
          style: { color: $mode === "light" ? "black" : "white" },
          distance: 20,
          formatter: function () {
            const date = new Date(this?.value);
            return date?.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            });
          },
        },
      },
      yAxis: [
        {
          // Primary yAxis for price
          min: yMin ?? null,
          max: yMax ?? null,
          title: { text: null },
          labels: { style: { color: $mode === "light" ? "black" : "white" } },
          gridLineWidth: 1,
          gridLineColor: $mode === "light" ? "#d1d5dc" : "#111827",
          opposite: true,
        },
        {
          title: {
            text: "Total Trades",
            style: { color: $mode === "light" ? "black" : "white" },
          },
          labels: { style: { color: $mode === "light" ? "black" : "white" } },
          gridLineWidth: 0,
          opposite: false,
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
          // Create a Date object from the x value and format it as time
          const date = new Date(this?.x);
          let formattedTime = date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          });

          // Build the tooltip content starting with the formatted time
          let tooltipContent = `<span class="m-auto text-sm text-white">${formattedTime}</span><br>`;

          // Loop through each point and add its details, excluding "Dark Pool Volume"
          this.points?.forEach((point) => {
            if (point.series.name !== "Dark Pool Volume") {
              tooltipContent += `
          <span class="font-semibold text-sm">${point.series.name}:</span> 
          <span class="font-normal text-sm"><b>${point.y}</b></span><br>`;
            }
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
          type: "line",
          data: seriesData,
          color: $mode === "light" ? "blue" : "white",
          lineWidth: 1.3,
          yAxis: 0, // Use primary yAxis
          animation: false,
        },
        {
          name: "Dark Pool Volume",
          type: "column",
          data: darkPoolSeries,
          color:
            data?.getStockQuote?.changesPercentage >= 0 ? "#04D347" : "#E11D48",
          yAxis: 1, // Use secondary yAxis
          animation: false,
        },
      ],
    };

    return options;
  }

  $: if ($stockTicker || $etfTicker || $mode) {
    config = null;
    config = getPlotChart() || null;
  }
</script>

<div
  class="border border-gray-300 dark:border-gray-800 rounded w-full"
  use:highcharts={config}
></div>
