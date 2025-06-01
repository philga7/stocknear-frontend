<script lang="ts">
  import highcharts from "$lib/highcharts.ts";
  import { abbreviateNumber } from "$lib/utils";
  import { mode } from "mode-watcher";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";

  export let dataList = [
    {
      label: "P/E of 32.46 is above 5-Year Avg 26.72",
      value: 21.46,
      rating: "Bad",
    },
    {
      label: "P/FCF of 31.97 is above 5-Year Avg 24.45",
      value: 30.74,
      rating: "Very Bad",
    },
    {
      label: "P/S of 8.60 is above 5-Year Avg 6.41",
      value: 34.04,
      rating: "Very Bad",
    },
    {
      label: "Forward PEG Ratio",
      value: 4.31,
      rating: "Very Bad",
    },
  ];

  function plotData() {
    const fillColorStart = "rgb(70, 129, 244,0.5)";
    const fillColorEnd = "rgb(70, 129, 244,0.001)";
    const dummyDates = [
      "2024-01-01",
      "2024-02-01",
      "2024-03-01",
      "2024-04-01",
      "2024-05-01",
    ];

    const dummyData = [100, 120, 90, 150, 130];

    const options = {
      credits: {
        enabled: false,
      },
      chart: {
        backgroundColor: $mode === "light" ? "#fff" : "#09090B",
        plotBackgroundColor: $mode === "light" ? "#fff" : "#09090B",
        height: 360,
      },
      title: {
        text: `<h3 class="mt-3 mb-1 ">Historical Dividend Yield</h3>`,
        style: {
          color: $mode === "light" ? "black" : "white",
          // Using inline CSS for margin-top and margin-bottom
        },
        useHTML: true, // Enable HTML to apply custom class styling
      },
      xAxis: {
        type: "datetime",
        endOnTick: false,
        categories: dummyDates,
        crosshair: {
          color: $mode === "light" ? "black" : "white", // Set the color of the crosshair line
          width: 1, // Adjust the line width as needed
          dashStyle: "Solid",
        },
        labels: {
          style: {
            color: $mode === "light" ? "#545454" : "white",
          },
          distance: 10, // Increases space between label and axis
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
          const interval = Math.floor((info.max - info.min) / tickCount);

          for (let i = 0; i <= tickCount; i++) {
            positions.push(info.min + i * interval);
          }
          return positions;
        },
      },
      yAxis: {
        gridLineWidth: 1,
        gridLineColor: $mode === "light" ? "#e5e7eb" : "#111827",
        labels: {
          style: { color: $mode === "light" ? "#545454" : "white" },
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
          // Format the x value to display time in a custom format
          let tooltipContent = `<span class="m-auto text-[1rem] font-[501]">${new Date(
            this?.x,
          ).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}</span><br>`;

          // Loop through each point in the shared tooltip
          this.points.forEach((point) => {
            tooltipContent += `
          <span class="font-semibold text-sm">${point.series.name}:</span> 
          <span class="font-normal text-sm">${abbreviateNumber(point.y)}</span><br>`;
          });

          return tooltipContent;
        },
      },

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
      legend: {
        enabled: false,
      },
      series: [
        {
          name: "Mkt Cap",
          type: "area",
          data: dummyData,
          color: "#4681f4",
          lineWidth: 1.2,
          marker: {
            enabled: false,
          },
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
              [0, fillColorStart],
              [1, fillColorEnd],
            ],
          },
        },
      ],
    };

    return options;
  }

  let config = plotData();
  let dividendList = [
    {
      symbol: "A",
      date: "2025-07-01",
      recordDate: "2025-07-01",
      paymentDate: "2025-07-23",
      declarationDate: "2025-05-21",
      adjDividend: 0.248,
      dividend: 0.248,
      yield: 0.8604794099569759,
      frequency: "Quarterly",
    },
    {
      symbol: "A",
      date: "2025-04-01",
      recordDate: "2025-04-01",
      paymentDate: "2025-04-23",
      declarationDate: "2025-02-19",
      adjDividend: 0.248,
      dividend: 0.248,
      yield: 0.8487505480052608,
      frequency: "Quarterly",
    },
  ];
  let originalData = dividendList;
  let columns = [
    { key: "date", label: "Ex-Dividend Date", align: "left" },
    { key: "adjDividend", label: "Cash Amount", align: "right" },
    { key: "declarationDate", label: "Declaration Date", align: "right" },
    { key: "recordDate", label: "Record Date", align: "right" },
    { key: "paymentDate", label: "Pay Date", align: "right" },
  ];

  let sortOrders = {
    date: { order: "none", type: "date" },
    adjDividend: { order: "none", type: "number" },
    declarationDate: { order: "none", type: "date" },
    recordDate: { order: "none", type: "date" },
    paymentDate: { order: "none", type: "date" },
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

    const currentOrderIndex = orderCycle.indexOf(sortOrders[key].order);
    sortOrders[key].order =
      orderCycle[(currentOrderIndex + 1) % orderCycle.length];
    const sortOrder = sortOrders[key].order;

    // Reset to original data when 'none' and stop further sorting
    if (sortOrder === "none") {
      dividendList = [...originalData]?.slice(0, 50); // Reset to original data (spread to avoid mutation)
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
    dividendList = [...originalData].sort(compareValues)?.slice(0, 50);
  };
</script>

<h2 class="text-xl sm:text-3xl font-bold mt-8">Valuation</h2>

<p class="mt-3 mb-4">
  Apple's Price to Earnings (P/E) ratio is currently at 32.46, which is higher
  than its 5-year average of 26.72 by approximately 21.46%. This indicates that
  investors are willing to pay more for each dollar of Apple's earnings compared
  to the historical aver- age, suggesting a premium valuation. The Forward PEG
  Ratio, which measures the stock price relative to its expected earnings
  growth, stands at a high value of 4.31, indicating that growth expectations
  may not fully justify the current price.
</p>

<div class="overflow-x-auto w-full">
  <div class="my-3 w-full">
    {#each dataList as item}
      <div
        class="grid
                 gap-3 p-2
                xs:mt-6 bp:mt-7
                grid-cols-3 sm:gap-6 flex flex-row items-center border border-gray-800"
      >
        <div class="text-sm sm:text-[1rem] font-semibold">
          {item?.label}
        </div>
        <div class="text-end text-[1rem]">
          {item?.value}%
        </div>
        <div class="text-end text-[1rem]">
          <span
            class="border badge badge-md sm:badge-lg {item?.rating === 'Average'
              ? 'badge-warning text-black'
              : ['Bad', 'Very Bad']?.includes(item?.rating)
                ? 'badge-error text-black'
                : 'badge-success text-black'}">{item?.rating}</span
          >
        </div>
      </div>
    {/each}
  </div>
</div>

{#if config}
  <div
    class="chart-driver border border-gray-300 shadow-xs dark:border-gray-800 rounded"
    use:highcharts={config}
  ></div>
{/if}

<p class="mt-8 mb-4">
  In terms of cash flow, Apple's Price to Free Cash Flow (P/FCF) ratio is also
  elevated at 31.97 versus the 5-year average of 24.45, an increase of around
  30.74%. This suggests that the market is valuing Apple's cash-generating
  ability more richly now than in recent years. Additionally, the Free Cash Flow
  Risk Premium is about 0.74, implying that investors are receiving a lower
  risk-ad- justed return on Apple's free cash flow compared to risk-free
  alternatives.
</p>

<p class="mb-4">
  The company's Price to Sales (P/S) ratio has risen as well; it currently sits
  at 8.60 compared to the five-year average of 6.41—a significant jump of
  roughly 34.04%. This means that investors are paying more for each dollar of
  Apple’s sales revenue now than they have on average over the past five years.
</p>

<p class="mb-4">
  Overall, with all key valuation metrics—P/E, P/FCF and P/S—exceeding their
  historical averages and low scores in both Forward PEG Ratio and FCF Risk
  Premium, it appears that Apple’s stock might be considered overvalued by
  traditional standards.
</p>
