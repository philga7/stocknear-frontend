<script lang="ts">
  import SEO from "$lib/components/SEO.svelte";
  import { mode } from "mode-watcher";
  import highcharts from "$lib/highcharts.ts";

  export let data;

  let config = null;
  let selectedStrategy = "Long Call";

  let strategies = [
    { name: "Custom Strategy", sentiment: "" },
    { name: "Long Call", sentiment: "Bullish" },
    { name: "Long Put", sentiment: "Bearish" },
    { name: "Short Call", sentiment: "Bearish" },
    { name: "Short Put", sentiment: "Bullish" },
    { name: "Covered Call", sentiment: "Bullish" },
    { name: "Protective Put", sentiment: "Bullish" },
    { name: "Cash Secured Put", sentiment: "Bullish" },
    { name: "Bull Call Spread", sentiment: "Bullish" },
    { name: "Bull Put Spread", sentiment: "Bullish" },
    { name: "Bear Call Spread", sentiment: "Bearish" },
    { name: "Bear Put Spread", sentiment: "Bearish" },
    { name: "Collar", sentiment: "Neutral" },
    { name: "Iron Condor", sentiment: "Neutral" },
    { name: "Calendar Spread", sentiment: "Neutral" },
    { name: "Covered Combination", sentiment: "Neutral" },
    { name: "Long Call Butterfly", sentiment: "Neutral" },
    { name: "Long Straddle", sentiment: "Neutral" },
    { name: "Short Straddle", sentiment: "Neutral" },
  ];

  function plotData() {
    const action = "Buy";
    const optionType = "Call";

    const strikePrice = 230;
    const numOfQuantities = 1;
    const currentStockPrice = 239;
    const cost = 30.13;
    const premium = cost * 100 * numOfQuantities; // total premium paid for 1 contract
    const breakEven = strikePrice + cost;

    // 1) Build payoff data from 0 to 600 (in steps of 10)
    const dataPoints = [];
    const xMin = 0;
    const xMax = 600;
    const step = 10;

    for (let s = xMin; s <= xMax; s += step) {
      // Payoff for a long call:
      // If underlying price < strike, payoff = -premium
      // Else payoff = (underlying - strike)*100 - premium
      const payoff =
        s < strikePrice ? -premium : (s - strikePrice) * 100 - premium;

      dataPoints.push([s, payoff]);
    }

    // 2) Create Highcharts configuration
    const options = {
      credits: {
        enabled: false,
      },
      chart: {
        type: "area", // or "line"
        backgroundColor: $mode === "light" ? "#fff" : "#09090B",
        plotBackgroundColor: $mode === "light" ? "#fff" : "#09090B",
        height: 400,
        animation: false,
      },
      title: {
        text: null,
      },
      xAxis: {
        // numeric axis from 0 to 600
        min: xMin,
        max: xMax,
        tickInterval: 50,
        title: {
          text: "TSLA Price at Expiration ($)",
          style: { color: $mode === "light" ? "black" : "white" },
        },
        labels: {
          style: { color: $mode === "light" ? "black" : "white" },
        },
        plotLines: [
          // Strike Price
          {
            value: currentStockPrice,
            color: "black",
            dashStyle: "Dash",
            width: 1.2,
            label: {
              text: `<span class="text-black dark:text-white">Underlying Price $${currentStockPrice}</span>`,
            },
            zIndex: 5,
          },
          // Break-Even
          {
            value: breakEven,
            color: "#10B981",
            dashStyle: "Dash",
            width: 1.2,
            label: {
              text: `<span class="text-black dark:text-white">Breakeven $${breakEven?.toFixed(2)}</span>`,
            },
            zIndex: 5,
          },
        ],
      },
      yAxis: {
        title: {
          text: "Expected Profit/Loss ($)",
          style: { color: $mode === "light" ? "black" : "white" },
        },
        gridLineWidth: 1,
        gridLineColor: $mode === "light" ? "#e5e7eb" : "#111827",
        labels: {
          style: { color: $mode === "light" ? "black" : "white" },
          formatter: function () {
            return "$" + this.value.toFixed(0);
          },
        },
        // If you want symmetrical around zero, set min/max or startOnTick/endOnTick
        // startOnTick: false,
        // endOnTick: false,
      },
      tooltip: {
        shared: true,
        backgroundColor: $mode === "light" ? "#f9fafb" : "#1f2937",
        borderColor: "#6b7280",
        style: {
          color: $mode === "light" ? "black" : "white",
        },
        formatter: function () {
          return `
            <b>TSLA Price: $${this.x}</b><br/>
            P/L: $${this.y?.toLocaleString("en-US")}
          `;
        },
      },
      plotOptions: {
        area: {
          // Fill the area below the line
          fillOpacity: 0.2,
          marker: {
            enabled: false,
          },
          animation: false,
        },
        series: {
          // Zone coloring based on profit/loss
          zoneAxis: "y",
          zones: [
            {
              value: 0, // below $0 -> red
              color: "#E02424",
              fillColor: "rgba(224,36,36,0.5)",
            },
            {
              color: "#10B981", // above $0 -> green
              fillColor: "rgba(16,185,129,0.5)",
            },
          ],
        },
      },
      legend: {
        enabled: false,
      },
      series: [
        {
          name: "Payoff",
          data: dataPoints,
        },
      ],
    };

    return options;
  }

  config = plotData();
</script>

<SEO
  title="Options Calculator: Real-Time Presidential Schedule, Executive Orders & Legislation"
  description="Track the President of the United States in real-time. Get updates on the POTUS schedule, executive orders, signed legislation, and official events."
/>

<section
  class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden min-h-screen pb-20 pt-5 px-4 lg:px-3 text-muted dark:text-white"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-muted dark:text-gray-300">Home</a></li>
      <li class="text-muted dark:text-gray-300">Options Calculator</li>
    </ul>
  </div>

  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <div
        class="relative flex flex-row justify-center items-start overflow-hidden w-full"
      >
        <div class="w-full mt-5">
          <div class="w-full">
            <div class="border-b-[2px] border-[#2C6288] dark:border-white">
              <h1 class="mb-1 text-2xl sm:text-3xl font-bold">
                Options Calculator
              </h1>
            </div>
          </div>

          <div class="mt-5 mb-5 w-fulll">
            <div class="flex flex-wrap gap-3 mt-4">
              {#each strategies as strategy}
                <div
                  on:click={() => (selectedStrategy = strategy?.name)}
                  class="{selectedStrategy === strategy?.name
                    ? 'bg-blue-100'
                    : ''} flex items-center space-x-2 border rounded-full px-3 py-1 text-sm font-medium border border-gray-300 cursor-pointer sm:hover:bg-blue-100 ease-out transition"
                >
                  <span>{strategy.name}</span>
                  {#if strategy?.sentiment}
                    <span class="">({strategy.sentiment})</span>
                  {/if}
                </div>
              {/each}
            </div>
            <div class="border-b border-gray-400 mt-5"></div>
            <h2 class="mt-5 mb-1 text-xl sm:text-2xl font-bold">Long Call</h2>
            <p class="mt-3">
              In a long call strategy, an investor buys a call option,
              anticipating that the price of the underlying asset will increase
              and generate a profit from the option's higher value. Investors
              typically use a long call strategy when they have a bullish
              outlook on the stock.
            </p>

            <div class="mt-4">
              <!-- Table header -->

              <!-- Table container -->
              <div class="overflow-x-auto border rounded-md">
                <table class="min-w-full divide-y divide-gray-200">
                  <!-- Table head -->
                  <thead class="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        class="px-4 py-3 text-left text-sm font-semibold"
                      >
                        Ticker
                      </th>
                      <th
                        scope="col"
                        class="px-4 py-3 text-left text-sm font-semibold"
                      >
                        Action
                      </th>
                      <th
                        scope="col"
                        class="px-4 py-3 text-left text-sm font-semibold"
                      >
                        Quantity
                      </th>
                      <th
                        scope="col"
                        class="px-4 py-3 text-left text-sm font-semibold"
                      >
                        Expiration Date
                      </th>
                      <th
                        scope="col"
                        class="px-4 py-3 text-left text-sm font-semibold"
                      >
                        Strike
                      </th>
                      <th
                        scope="col"
                        class="px-4 py-3 text-left text-sm font-semibold"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        class="px-4 py-3 text-left text-sm font-semibold"
                      >
                        Price
                      </th>
                      <th
                        scope="col"
                        class="px-4 py-3 text-left text-sm font-semibold"
                      >
                        Delta
                      </th>
                      <th
                        scope="col"
                        class="px-4 py-3 text-left text-sm font-semibold"
                      >
                        Adjustment
                      </th>
                      <th
                        scope="col"
                        class="px-4 py-3 text-left text-sm font-semibold"
                      ></th>
                    </tr>
                  </thead>

                  <!-- Table body -->
                  <tbody class="bg-white divide-y divide-gray-200 text-sm">
                    <!-- Example Option Leg Row -->
                    <tr>
                      <td class="px-4 py-3 whitespace-nowrap font-bold">
                        TSLA
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap">
                        <label
                          class="badge px-2 rounded-md bg-green-100 text-green-800 font-semibold cursor-pointer"
                          >Buy</label
                        >
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap">
                        <input
                          type="number"
                          min="1"
                          value="1"
                          class="border border-gray-300 rounded px-2 py-1 w-20 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap">
                        <input
                          type="date"
                          class="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value="2025-05-12"
                        />
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.01"
                          value="280.0"
                          class="border border-gray-300 rounded px-2 py-1 w-24 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap">
                        <label
                          class="badge px-2 rounded-md bg-blue-100 text-blue-800 font-semibold cursor-pointer"
                          >Call</label
                        >
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.01"
                          value="5.80"
                          class="border border-gray-300 rounded px-2 py-1 w-24 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.01"
                          value="0.30"
                          class="border border-gray-300 rounded px-2 py-1 w-16 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap">
                        <!-- Example slider -->
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value="0.30"
                          class="accent-blue-500 w-24"
                        />
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap">
                        <!-- Example delete or settings icon (SVG) -->
                        <button class="text-gray-500 hover:text-red-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v1h6V4a1 1 0 00-1-1m-4 0h4"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>

                    <!-- Add more rows as needed -->
                  </tbody>
                </table>
              </div>
              {#if config}
                <div
                  class="shadow-sm mt-5 border border-gray-300 dark:border-gray-800 rounded"
                  use:highcharts={config}
                ></div>
              {/if}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
