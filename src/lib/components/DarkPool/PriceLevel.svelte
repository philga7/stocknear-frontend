<script lang="ts">
  import { displayCompanyName, stockTicker, etfTicker } from "$lib/store";
  import InfoModal from "$lib/components/InfoModal.svelte";
  import { abbreviateNumber, abbreviateNumberWithColor } from "$lib/utils";
  import highcharts from "$lib/highcharts.ts";

  let category = "Size";

  export let rawData = [];
  export let metrics = {};

  let config;

  function getPlotOptions(category) {
    const xAxis = rawData?.map((item) => item[category?.toLowerCase()]);
    const yAxis = rawData?.map((item) => item?.price_level || 0);

    // Find max value index for highlighting
    const maxValueIndex = xAxis?.indexOf(Math.max(...xAxis));

    // Create colors array with highlighted bar
    const colors = xAxis?.map((value, index) =>
      index === maxValueIndex ? "#3BA272" : "#e2e8f0",
    );

    const options = {
      chart: {
        type: "column",
        backgroundColor: "#09090B",
        animation: false,
        height: 360,
      },
      credits: { enabled: false },
      legend: { enabled: false },
      title: {
        text: `<h3 class="mt-3 mb-1">Dark Pool Price Levels</h3>`,
        useHTML: true,
        style: { color: "white" },
      },
      xAxis: {
        endonTick: false,
        categories: yAxis,
        crosshair: {
          color: "#fff", // Set the color of the crosshair line
          width: 1, // Adjust the line width as needed
          dashStyle: "Solid",
        },
        labels: {
          style: {
            color: "#fff",
          },
          distance: 10, // Increases space between label and axis
          formatter: function () {
            return this.value;
          },
        },
      },
      yAxis: {
        title: {
          text: null,
        },
        opposite: true,
        gridLineWidth: 1,
        gridLineColor: "#111827",
        tickPositioner: function () {
          const positions = [];
          const info = this.getExtremes();
          const tickCount = 3; // Number of ticks displayed
          const interval = Math.floor((info.max - info.min) / tickCount);

          for (let i = 0; i <= tickCount; i++) {
            positions.push(info.min + i * interval);
          }
          return positions;
        },
        labels: {
          formatter: function () {
            return abbreviateNumber(this?.value);
          },
          style: {
            color: "#fff",
          },
        },
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
          let tooltipContent = `<span class="text-white m-auto text-black text-[1rem] font-[501]">Price Level ${this?.x}</span><br>`;

          // Loop through each point in the shared tooltip
          this.points?.forEach((point) => {
            tooltipContent += `<span class="text-white font-semibold text-sm">${point.series.name}:</span> 
          <span class="text-white font-normal text-sm" style="color:${point.color}">${abbreviateNumber(
            point.y,
          )}</span><br>`;
          });

          return tooltipContent;
        },
      },

      plotOptions: {
        column: {
          colorByPoint: true,
          colors: colors,
          borderColor: colors,
          borderRadius: "1px",
          dataLabels: {
            enabled: false,
          },
        },
        animation: false,
      },
      series: [
        {
          name: `Total ${category}`,
          data: xAxis,
          animation: false,
        },
      ],
    };

    return options;
  }

  $: if (($stockTicker || $etfTicker) && category) {
    config = getPlotOptions(category) || null;
  }
</script>

<section class="overflow-hidden text-white h-full pb-8 pt-3">
  <main class="overflow-hidden">
    <div class="flex flex-row items-center">
      <label
        for="priceLevelInfo"
        class="mr-1 cursor-pointer flex flex-row items-center text-white text-xl sm:text-2xl font-bold"
      >
        Price Level
      </label>
      <InfoModal
        title={"Price Level"}
        content={"Price levels reveal where significant trading activity occurs, aiding investors in identifying key support and resistance zones."}
        id={"priceLevelInfo"}
      />
    </div>

    {#if rawData?.length !== 0 && Object?.keys(metrics)?.length > 0}
      <div class="w-full flex flex-col items-start">
        <div class="text-white text-[1rem] mt-2 w-full">
          {$displayCompanyName} has seen an average dark pool trade size of {@html abbreviateNumberWithColor(
            metrics?.avgTradeSize,
            false,
            true,
          )} and an average premium per trade of {@html abbreviateNumberWithColor(
            metrics?.avgPremTrade,
            false,
            true,
          )}, with a total premium of {@html abbreviateNumberWithColor(
            metrics?.totalPrem,
            false,
            true,
          )}.
        </div>
      </div>

      <div class=" rounded-md bg-default mt-5 sm:mt-0">
        <div class="flex justify-end mb-2 space-x-2 z-10 text-sm">
          {#each ["Size", "Premium"] as item}
            <label
              on:click={() => (category = item)}
              class="px-3 py-1 {category === item
                ? 'bg-white text-black'
                : 'text-white bg-table'} border border-gray-800 transition ease-out duration-100 sm:hover:bg-white sm:hover:text-black rounded-md cursor-pointer"
            >
              {item}
            </label>
          {/each}
        </div>

        <div
          class="border border-gray-800 rounded w-full"
          use:highcharts={config}
        ></div>
      </div>
    {/if}
  </main>
</section>
