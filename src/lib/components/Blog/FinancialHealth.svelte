<script lang="ts">
  import highcharts from "$lib/highcharts.ts";
  import { abbreviateNumber } from "$lib/utils";
  import { mode } from "mode-watcher";

  let fundamentalData = [
    {
      label: "Gross Profit Margin",
      value: 2.94,
      sentiment: "Good",
    },
    {
      label: "Operating Profit Margin",
      value: 2.94,
      sentiment: "Bad",
    },
    {
      label: "Net Margin",
      value: 2.94,
      sentiment: "Bad",
    },
    {
      label: "FCF Margin",
      value: 2.94,
      sentiment: "Bad",
    },
    {
      label: "EBITDA Margin",
      value: 2.94,
      sentiment: "Bad",
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
        text: `<h3 class="mt-3 mb-1 ">Profitability</h3>`,
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
</script>

<h2 class="text-xl sm:text-3xl font-bold mt-8">Financial Health</h2>

<div
  class="overflow-x-auto no-scrollbar flex justify-start items-center w-full m-auto rounded-none sm:rounded mb-8 mt-5"
>
  <table
    class="table table-sm table-compact no-scrollbar rounded-none sm:rounded w-full border border-gray-300 dark:border-gray-800 m-auto"
  >
    <tbody class="">
      {#each fundamentalData as item}
        <tr
          class=" dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
        >
          <td class="text-start text-sm sm:text-[1rem] whitespace-nowrap">
            {item?.label}
          </td>
          <td class="text-end text-sm sm:text-[1rem] whitespace-nowrap">
            {item?.value + "%"}
          </td>

          <td class=" text-sm sm:text-[1rem] whitespace-nowrap text-end">
            <label class="badge badge-lg w-24 rounded-[3px]"
              >{item?.sentiment}</label
            >
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

{#if config}
  <div
    class="chart-driver border border-gray-300 shadow-xs dark:border-gray-800 rounded"
    use:highcharts={config}
  ></div>
{/if}

<p class="mt-8 mb-4">
  Apple's growth profile presents a mixed picture, with some areas showing
  improvement while others indicate challenges. The company's revenue has
  slightly decreased by 0.9 percent, which could suggest a slowdown in sales or
  more competitive market conditions.
</p>

<p class="mb-4">
  Despite the dip in revenue, Apple has managed to increase its gross profit by
  4.62 percent. This indicates that while they may be selling less, they are
  making more money on what they do sell due to better margins or cost
  efficiencies. Operating income and net income have also seen increases of 5.29
  percent and 6.43 percent respectively, demonstrating Apple's ability to grow
  its profits from core business activities.
</p>

<p class="mb-4">
  The company's cash flow situation is also generally positive, with operating
  cash flow up by 0.89 percent and free cash flow—which represents the cash
  Apple can use for dividends, share buybacks, or investments—increasing by 4.54
  percent.
</p>

<p class="mb-4">
  In summary, despite a slight decrease in revenue, Apple has shown an ability
  to improve profitability and maintain healthy cash flows. These factors
  contribute to an average growth score of 3.13/5 according to Stock Unlock's
  analysis, reflecting a solid but not exceptional performance in growth metrics
  for the period assessed.
</p>
