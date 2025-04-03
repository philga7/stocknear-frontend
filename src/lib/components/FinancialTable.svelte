<script lang="ts">
  import { abbreviateNumber } from "$lib/utils";
  import { screenWidth, stockTicker } from "$lib/store";
  import { mode } from "mode-watcher";
  import highcharts from "$lib/highcharts.ts";

  export let data: any[];
  export let fields: { label: string; key: string }[];

  let config = null;

  let modalLabel;
  let highestValue;
  let highestValueDate;
  let lowestValueDate;
  let lowestValue;
  let fiveYearsGrowth;

  const marginKeys = new Set([
    /*
    "pretaxProfitMargin",
    "freeCashFlowMargin",
    "grossProfitMargin",
    "netProfitMargin",
    "operatingProfitMargin",
    "ebitdaMargin",
    */
  ]);

  // Precompute fields with an additional flag
  $: computedFields = fields.map((field) => ({
    ...field,
    isMargin: marginKeys.has(field.key),
  }));

  // Helper to format the cell value
  function formatValue(
    value: number | null | undefined,
    isMargin: boolean,
  ): string {
    if (value === null || value === undefined || value === 0) {
      return "n/a";
    }
    const formatted = abbreviateNumber(value.toFixed(2));
    return isMargin ? formatted + "%" : formatted;
  }

  function plotData(label, key) {
    const rawData = [...data]?.sort((a, b) => a?.fiscalYear - b?.fiscalYear);
    const dateList = rawData?.map((item) =>
      item?.period === "FY"
        ? item?.fiscalYear
        : `${item?.period} FY ${item?.fiscalYear}`,
    );

    const valueList = rawData?.map((item) => item[key]);

    // Calculate highest and lowest value
    highestValue = Math.max(...valueList);
    lowestValue = Math.min(...valueList);
    let highestValueIndex = valueList.indexOf(highestValue);
    let lowestValueIndex = valueList.indexOf(lowestValue);

    highestValueDate = dateList[highestValueIndex] || null;
    lowestValueDate = dateList[lowestValueIndex] || null;

    // Calculate last 5 years growth
    fiveYearsGrowth = null;
    if (valueList?.length >= 5) {
      let firstValue = valueList[valueList.length - 5];
      let lastValue = valueList[valueList.length - 1];
      fiveYearsGrowth = ((lastValue - firstValue) / Math.abs(firstValue)) * 100;
    }

    const options = {
      chart: {
        type: "column",
        backgroundColor: $mode === "light" ? "#fff" : "#2A2E39",
        plotBackgroundColor: $mode === "light" ? "#fff" : "#2A2E39",
        height: 360,
        animation: false,
      },
      credits: { enabled: false },
      legend: { enabled: false },
      plotOptions: {
        series: {
          color: "white",
          animation: false,
          dataLabels: {
            enabled: false,
            color: "white",
            style: {
              fontSize: "13px",
              fontWeight: "bold",
            },
            formatter: function () {
              return abbreviateNumber(this?.y);
            },
          },
        },
      },
      title: {
        text: `<h3 class="mt-3 mb-1 sm:text-lg">${$stockTicker} ${label}</h3>`,
        useHTML: true,
        style: { color: $mode === "light" ? "black" : "white" },
      },
      xAxis: {
        endOnTick: false,
        categories: dateList,
        crosshair: {
          color: $mode === "light" ? "black" : "white", // Set the color of the crosshair line
          width: 1, // Adjust the line width as needed
          dashStyle: "Solid",
        },
        labels: {
          style: {
            color: $mode === "light" ? "#545454" : "white",
          },
          rotation: -45,
          distance: 10, // Increases space between label and axis
        },
      },
      yAxis: {
        gridLineWidth: 1,
        gridLineColor: $mode === "light" ? "#e5e7eb" : "#404657",
        labels: {
          style: { color: $mode === "light" ? "black" : "white" },
          formatter: function () {
            return abbreviateNumber(this.value);
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
          let tooltipContent = `<span class="text-white m-auto text-black text-[1rem] font-[501]">${this?.x}</span><br>`;
          this.points.forEach((point) => {
            tooltipContent += `<span class="text-white font-semibold text-sm">${point.series.name}:</span>
          <span class="text-white font-normal text-sm">${abbreviateNumber(
            point.y?.toFixed(2),
          )}</span><br>`;
          });
          return tooltipContent;
        },
      },
      series: [
        {
          name: label,
          data: valueList,
          color: $mode === "light" ? "#2C6288" : "white",
          borderColor: $mode === "light" ? "#2C6288" : "white",
          borderRadius: "1px",
          animation: false,
        },
      ],
    };
    return options;
  }

  async function handleChart(label, key) {
    modalLabel = label;
    config = plotData(label, key);
  }
</script>

{#each computedFields as { label, key, isMargin } (key)}
  <tr
    class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd whitespace-nowrap"
  >
    <td
      class="text-start min-w-[220px] sm:min-w-[320px] border-r border-gray-300 dark:border-gray-700 text-sm sm:text-[1rem] w-full flex flex-row items-center justify-between"
    >
      <span class="truncate w-fit max-w-40 sm:max-w-64">{label}</span>
      <label
        for="financialPlotModal"
        on:click={() => handleChart(label, key)}
        class="cursor-pointer inline-block"
      >
        <svg
          class="w-5 h-5 text-gray-500 dark:text-gray-300"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
            id="SVGRepo_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></g><g id="SVGRepo_iconCarrier">
            <path
              d="M9 12H4.6C4.03995 12 3.75992 12 3.54601 12.109C3.35785 12.2049 3.20487 12.3578 3.10899 12.546C3 12.7599 3 13.0399 3 13.6V19.4C3 19.9601 3 20.2401 3.10899 20.454C3.20487 20.6422 3.35785 20.7951 3.54601 20.891C3.75992 21 4.03995 21 4.6 21H9M9 21H15M9 21L9 8.6C9 8.03995 9 7.75992 9.10899 7.54601C9.20487 7.35785 9.35785 7.20487 9.54601 7.10899C9.75992 7 10.0399 7 10.6 7H13.4C13.9601 7 14.2401 7 14.454 7.10899C14.6422 7.20487 14.7951 7.35785 14.891 7.54601C15 7.75992 15 8.03995 15 8.6V21M15 21H19.4C19.9601 21 20.2401 21 20.454 20.891C20.6422 20.7951 20.7951 20.6422 20.891 20.454C21 20.2401 21 19.9601 21 19.4V4.6C21 4.03995 21 3.75992 20.891 3.54601C20.7951 3.35785 20.6422 3.20487 20.454 3.10899C20.2401 3 19.9601 3 19.4 3H16.6C16.0399 3 15.7599 3 15.546 3.10899C15.3578 3.20487 15.2049 3.35785 15.109 3.54601C15 3.75992 15 4.03995 15 4.6V8"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </g></svg
        >
      </label>
    </td>
    {#each data as item}
      <td class="text-sm sm:text-[1rem] text-end">
        {formatValue(item[key], isMargin)}
      </td>
    {/each}
  </tr>
{/each}

<input type="checkbox" id="financialPlotModal" class="modal-toggle" />
<dialog
  id="financialPlotModal"
  class="modal {$screenWidth < 640 ? 'modal-bottom ' : ''} bg-[#000]/40 sm:px-5"
>
  <label for="financialPlotModal" class="cursor-pointer modal-backdrop"></label>

  <div
    class="modal-box w-full p-6 rounded shadow-lg border
        bg-white dark:bg-secondary border border-gray-600 dark:border-gray-800"
  >
    {#if config}
      <div class="mt-2" use:highcharts={config}></div>
    {/if}
    <p class="text-sm mb-6">
      Revenue peaked at {abbreviateNumber(highestValue?.toFixed(2))} in {highestValueDate}
      and hit its lowest at {abbreviateNumber(lowestValue?.toFixed(2))} in {lowestValueDate}.
      Over the past five years, it has {fiveYearsGrowth >= 0
        ? "grown"
        : "declined"} by {fiveYearsGrowth?.toFixed(2)}%.
    </p>

    <div class="border-t border-gray-300 dark:border-gray-600 mt-2 w-full">
      <label
        for="financialPlotModal"
        class="mt-4 font-semibold text-xl m-auto flex justify-center cursor-pointer"
      >
        Close
      </label>
    </div>
  </div>
</dialog>
