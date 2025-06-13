<script lang="ts">
  import highcharts from "$lib/highcharts.ts";
  import { abbreviateNumber } from "$lib/utils";
  import { mode } from "mode-watcher";
  export let blogData = {};

  let peData = blogData?.priceToEarningsRatio;
  let pFCFData = blogData?.priceToFreeCashFlowRatio;
  let psData = blogData?.priceToSalesRatio;
  let pegData = blogData?.priceToEarningsGrowthRatio;

  let fundamentalData = [
    {
      label: `P/E of ${peData?.value} is ${peData?.value > peData?.fiveYearAvg ? "above" : "below"} 5-Year Avg ${peData?.fiveYearAvg}`,
      value: peData?.upside,
      sentiment: peData?.sentiment,
    },
    {
      label: `P/FCF of ${pFCFData?.value} is ${pFCFData?.value > pFCFData?.fiveYearAvg ? "above" : "below"} 5-Year Avg ${pFCFData?.fiveYearAvg}`,
      value: pFCFData?.upside,
      sentiment: pFCFData?.sentiment,
    },
    {
      label: `P/S of ${psData?.value} is  ${psData?.value > psData?.fiveYearAvg ? "above" : "below"} 5-Year Avg ${psData?.fiveYearAvg}`,
      value: psData?.upside,
      sentiment: psData?.sentiment,
    },
    {
      label: `PEG Ratio of ${pegData?.value} is  ${pegData?.value > pegData?.fiveYearAvg ? "above" : "below"} 5-Year Avg ${pegData?.fiveYearAvg}`,
      value: pegData?.upside,
      sentiment: pegData?.sentiment,
    },
  ];

  function plotData() {
    const categories = ["P/E Ratio", "P/FCF Ratio", "P/S Ratio", "PEG Ratio"];
    const values = fundamentalData.map((d) => d.value);
    const barColor = "#fff"; // blue fill color

    const options = {
      credits: { enabled: false },
      chart: {
        type: "column",
        backgroundColor: $mode === "light" ? "#fff" : "#09090B",
        plotBackgroundColor: $mode === "light" ? "#fff" : "#09090B",
        height: 360,
      },
      title: {
        text: `<h3 class="mt-3 mb-1 ">Current vs 5 Year Avg Upside</h3>`,
        style: {
          color: $mode === "light" ? "black" : "white",
        },
        useHTML: true,
      },
      xAxis: {
        categories: categories,
        crosshair: {
          color: $mode === "light" ? "black" : "white",
          width: 1,
          dashStyle: "Solid",
        },
        labels: {
          style: {
            color: $mode === "light" ? "#545454" : "white",
          },
        },
      },
      yAxis: {
        gridLineWidth: 1,
        gridLineColor: $mode === "light" ? "#e5e7eb" : "#111827",
        labels: {
          style: { color: $mode === "light" ? "#545454" : "white" },
          formatter: function () {
            return this.value + "%";
          },
        },
        title: { text: null },
        opposite: true,
      },
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
          return this.points
            .map(
              (point) => `
            <span class="font-semibold text-sm">${point.key}:</span> 
            <span class="font-normal text-sm">${abbreviateNumber(point.y)}%</span><br>
          `,
            )
            .join("");
        },
      },
      plotOptions: {
        column: {
          colorByPoint: false, // all bars same color
          color: barColor,
          borderColor: barColor,
          borderWidth: 1,
        },
        series: {
          animation: false,
          states: { hover: { enabled: false } },
        },
      },
      legend: {
        enabled: false,
      },
      series: [
        {
          name: "Upside",
          data: values,
        },
      ],
    };

    return options;
  }

  let config = plotData();
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
            <label
              class="badge badge-lg w-24 rounded-[3px] {[
                'Very Good',
                'Good',
              ]?.includes(item?.sentiment)
                ? 'bg-green-800 dark:bg-green-600'
                : item?.sentiment === 'Average'
                  ? 'bg-orange-800 dark:bg-orange-600'
                  : 'bg-red-800 dark:bg-red-600'}">{item?.sentiment}</label
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
