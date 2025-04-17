<script lang="ts">
  import { displayCompanyName, stockTicker } from "$lib/store";
  import { abbreviateNumber, removeCompanyStrings } from "$lib/utils";
  import SEO from "$lib/components/SEO.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
  import { Button } from "$lib/components/shadcn/button/index.js";
  //import * as XLSX from 'xlsx';
  import { goto } from "$app/navigation";
  import highcharts from "$lib/highcharts.ts";
  import { mode } from "mode-watcher";

  export let data;

  let rawData = data?.getData?.history || [];
  let tableList = rawData;
  tableList?.sort((a, b) => new Date(b?.recordDate) - new Date(a?.recordDate));

  let changePercentageYearAgo = 0;
  let growthRate = 0;

  function filterDataByTimePeriod(rawData, timePeriod) {
    let dates = [];
    let marketCapList = [];
    const now = new Date();

    // Calculate the date threshold based on the selected time period
    let thresholdDate;
    switch (timePeriod) {
      case "1M":
        thresholdDate = new Date(now);
        thresholdDate.setMonth(now.getMonth() - 1);
        break;
      case "6M":
        thresholdDate = new Date(now);
        thresholdDate.setMonth(now.getMonth() - 6);
        break;
      case "1Y":
        thresholdDate = new Date(now);
        thresholdDate.setFullYear(now.getFullYear() - 1);
        break;
      case "3Y":
        thresholdDate = new Date(now);
        thresholdDate.setFullYear(now.getFullYear() - 3);
        break;
      case "5Y":
        thresholdDate = new Date(now);
        thresholdDate.setFullYear(now.getFullYear() - 5);
        break;
      case "10Y":
        thresholdDate = new Date(now);
        thresholdDate.setFullYear(now.getFullYear() - 10);
        break;
      case "Max":
      default:
        thresholdDate = new Date(0); // Set to the earliest possible date
        break;
    }

    // Filter the data based on the threshold date
    rawData?.forEach((item) => {
      const itemDate = new Date(item?.date);
      if (itemDate >= thresholdDate) {
        dates?.push(item?.date);
        marketCapList?.push(item?.marketCap);
      }
    });

    return { dates, marketCapList };
  }

  function plotData() {
    if (!rawData || rawData.length === 0) {
      return {};
    }

    // Prepare series data in one pass
    const priceSeries = [];
    const shortFloatSeries = [];
    const shortOutSeries = [];
    rawData.forEach(
      ({ recordDate, price, shortPercentOfFloat, shortPercentOfOut }) => {
        const time = new Date(recordDate).getTime();
        priceSeries.push([time, price]);
        shortFloatSeries.push([time, shortPercentOfFloat]);
        shortOutSeries.push([time, shortPercentOfOut]);
      },
    );

    const fillColorStart = "rgba(70, 129, 244, 0.5)";
    const fillColorEnd = "rgba(70, 129, 244, 0.001)";

    const options = {
      credits: { enabled: false },
      chart: {
        backgroundColor: $mode === "light" ? "#fff" : "#09090B",
        plotBackgroundColor: $mode === "light" ? "#fff" : "#09090B",
      },
      title: {
        text: `<h3 class=\"mt-3 mb-1\">${removeCompanyStrings($displayCompanyName)} Short Interest</h3>`,
        useHTML: true,
        style: { color: $mode === "light" ? "black" : "white" },
      },
      xAxis: {
        type: "datetime",
        endOnTick: false,
        crosshair: {
          color: $mode === "light" ? "black" : "white",
          width: 1,
          dashStyle: "Solid",
        },
        labels: {
          style: { color: $mode === "light" ? "#545454" : "white" },
          distance: 10,
          formatter() {
            return new Date(this.value).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
              timeZone: "Europe/Berlin",
            });
          },
        },
        tickPositioner() {
          const positions = [];
          const { min, max } = this.getExtremes();
          const tickCount = 5;
          const interval = Math.floor((max - min) / tickCount);
          for (let i = 0; i <= tickCount; i++) {
            positions.push(min + i * interval);
          }
          return positions;
        },
      },
      yAxis: [
        {
          gridLineWidth: 1,
          gridLineColor: $mode === "light" ? "#e5e7eb" : "#111827",
          labels: { style: { color: $mode === "light" ? "#545454" : "white" } },
          title: { text: null },
          opposite: true,
        },
        {
          gridLineWidth: 0,
          labels: { enabled: false },
          title: { text: null },
        },
        {
          gridLineWidth: 0,
          labels: { enabled: false },
          title: { text: null },
        },
      ],
      tooltip: {
        shared: true,
        useHTML: true,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        style: { color: "#fff", fontSize: "16px", padding: "10px" },
        borderRadius: 4,
        formatter() {
          // Display date in Europe/Berlin timezone
          const dateStr = new Date(this.x).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            timeZone: "Europe/Berlin",
          });
          let html = `<span class=\"m-auto text-[1rem] font-[501]\">${dateStr}</span><br/>`;

          // Loop through each point and add colored bullet
          this.points.forEach((point) => {
            html += `
            <span style=\"display:inline-block; width:10px; height:10px; background-color:${point.color}; border-radius:50%; margin-right:5px; vertical-align:middle;\"></span>
            <span class=\"font-semibold text-sm\">${point.series.name}:</span>
            <span class=\"font-normal text-sm\">${abbreviateNumber(point.y)}${point.series.name.includes("%") ? "%" : ""}</span><br/>`;
          });

          return html;
        },
      },
      plotOptions: {
        series: {
          animation: false,
          states: { hover: { enabled: false } },
        },
      },
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
      series: [
        {
          name: "Price",
          type: "area",
          data: priceSeries,
          yAxis: 0,
          color: "#4681f4",
          lineWidth: 1.3,
          marker: { enabled: false },
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
              [0, fillColorStart],
              [1, fillColorEnd],
            ],
          },
        },
        {
          name: "Short % Float",
          type: "spline",
          data: shortFloatSeries,
          yAxis: 1,
          color: $mode === "light" ? "#d32f2f" : "#ff6e6e",
          lineWidth: 1.3,
          marker: { enabled: false },
        },
        {
          name: "Short % Outstanding",
          type: "spline",
          data: shortOutSeries,
          yAxis: 2,
          color: $mode === "light" ? "purple" : "#ffc947",
          lineWidth: 1.3,
          marker: { enabled: false },
        },
      ],
    };

    return options;
  }

  const exportData = (format = "csv") => {
    if (["Pro", "Plus"]?.includes(data?.user?.tier)) {
      const csvRows = [];

      // Add headers row
      csvRows.push(
        "Date,Short Interest,Short Prior Month,% Change,Days to Cover,Short % Float,Short % Out",
      );

      // Add data rows from tableList
      tableList.forEach((item) => {
        const date = item?.recordDate;

        const row = [
          date,
          item?.totalShortInterest ?? "n/a",
          item?.shortPriorMo ?? "n/a",
          item?.percentChangeMoMo != null
            ? `${item?.percentChangeMoMo}%`
            : "n/a",
          item?.daysToCover ?? "n/a",
          item?.shortPercentOfFloat != null
            ? `${item?.shortPercentOfFloat}%`
            : "n/a",
          item?.shortPercentOfOut != null
            ? `${item?.shortPercentOfOut}%`
            : "n/a",
        ];

        csvRows.push(row.join(","));
      });

      // Create CSV blob and trigger download
      const csv = csvRows.join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("hidden", "");
      a.setAttribute("href", url);
      a.setAttribute(
        "download",
        `${$stockTicker?.toLowerCase()}_short_interest_table.csv`,
      );
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      goto("/pricing");
    }
  };

  let config = null;

  $: {
    if ($mode) {
      config = plotData();
    }
  }
</script>

<SEO
  title={`${$displayCompanyName} (${$stockTicker}) Short Interest – Historical & Latest Data`}
  description={`
    View ${$displayCompanyName}'s short interest trends: 
    historical short interest levels, days to cover, short % of float & outstanding, 
    and month‑over‑month changes. Get the full dataset and insights.
  `}
/>

<section class=" w-full overflow-hidden h-full">
  <div class="w-full flex justify-center w-full sm-auto h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <main class="w-full">
        <div class="sm:pl-7 sm:pb-7 sm:pt-7 m-auto mt-2 sm:mt-0">
          <div class="">
            <h1 class="text-xl sm:text-2xl font-bold">
              {removeCompanyStrings($displayCompanyName)} Short Interest
            </h1>
          </div>

          {#if rawData?.length !== 0}
            <div class="grid grid-cols-1 gap-2 mt-3 mb-3 sm:mt-0 sm:mb-0">
              <Infobox
                text={`${removeCompanyStrings($displayCompanyName)} has a total short interest of ${abbreviateNumber(
                  data?.getData?.sharesShort,
                )}. Its short interest has ${
                  tableList?.at(0)?.percentChangeMoMo > 0
                    ? "increased"
                    : tableList?.at(0)?.percentChangeMoMo < 0
                      ? "decreased"
                      : "unchanged"
                } by ${abbreviateNumber(
                  tableList?.at(0)?.percentChangeMoMo?.toFixed(2),
                )}% to the previous Month.`}
              />

              <div
                class="my-5 grid grid-cols-2 gap-3 xs:mt-6 bp:mt-7 sm:grid-cols-3 sm:gap-6"
              >
                <div>
                  Short Interest
                  <div
                    class="mt-0.5 text-lg bp:text-xl sm:mt-1.5 sm:text-2xl font-semibold"
                  >
                    {abbreviateNumber(data?.getData?.sharesShort)}
                  </div>
                </div>
                <div>
                  Short Prior Month <div
                    class="mt-0.5 text-lg bp:text-xl sm:mt-1.5 sm:text-2xl font-semibold"
                  >
                    {abbreviateNumber(data?.getData?.sharesShortPriorMonth)}
                  </div>
                </div>
                <div>
                  % Change MoM <div
                    class="mt-0.5 text-lg {growthRate > 0
                      ? "before:content-['+'] "
                      : ''} font-semibold bp:text-xl sm:mt-1.5 sm:text-2xl"
                  >
                    {tableList?.at(0)?.percentChangeMoMo
                      ? tableList?.at(0)?.percentChangeMoMo + "%"
                      : "n/a"}
                  </div>
                </div>
                <div>
                  Short % Floating
                  <div
                    class="mt-0.5 text-lg bp:text-xl sm:mt-1.5 sm:text-2xl font-semibold"
                  >
                    {data?.getData?.shortFloatPercent
                      ? data?.getData?.shortFloatPercent + "%"
                      : "n/a"}
                  </div>
                </div>
                <div>
                  Short % Outstanding
                  <div
                    class="mt-0.5 text-lg bp:text-xl sm:mt-1.5 sm:text-2xl font-semibold"
                  >
                    {data?.getData?.shortOutstandingPercent
                      ? data?.getData?.shortOutstandingPercent + "%"
                      : "n/a"}
                  </div>
                </div>
                <div>
                  Days to Cover
                  <div
                    class="mt-0.5 text-lg bp:text-xl sm:mt-1.5 sm:text-2xl font-semibold"
                  >
                    {data?.getData?.shortRatio}
                  </div>
                </div>
              </div>

              <div
                class="flex flex-col sm:flex-row items-start sm:items-center w-full"
              >
                <h2 class="mb-3 sm:mb-0 text-xl sm:text-2xl font-bold">
                  Short Interest Chart
                </h2>
              </div>

              <div
                class="chart border border-gray-300 shadow-sm dark:border-gray-800 rounded"
                use:highcharts={config}
              ></div>

              <div
                class="flex flex-row items-center w-full justify-between mt-3"
              >
                <h3 class="text-xl sm:text-2xl font-bold">
                  Short Interest History
                </h3>

                <div class="flex flex-row items-center w-fit w-[50%] ml-auto">
                  <Button
                    on:click={() => exportData("csv")}
                    class="ml-2 w-full shadow-sm border-gray-300 dark:border-gray-600 border sm:hover:bg-gray-100 dark:sm:hover:bg-primary ease-out flex flex-row justify-between items-center px-3 py-2  rounded-md truncate"
                  >
                    <span class="truncate text-xs sm:text-sm">Download</span>
                    <svg
                      class="{['Pro', 'Plus']?.includes(data?.user?.tier)
                        ? 'hidden'
                        : ''} ml-1 -mt-0.5 w-3.5 h-3.5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      ><path
                        fill="#A3A3A3"
                        d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                      /></svg
                    >
                  </Button>
                </div>
              </div>

              <div class="w-full overflow-x-auto">
                <table
                  class="table table-sm table-compact no-scrollbar rounded-none sm:rounded-md w-full border border-gray-300 dark:border-gray-800 m-auto mt-2"
                >
                  <thead class="text-muted dark:text-white dark:bg-default">
                    <tr>
                      <th
                        class=" font-semibold text-start text-sm sm:text-[1rem]"
                        >Date</th
                      >
                      <th class=" font-semibold text-end text-sm sm:text-[1rem]"
                        >Short Interest</th
                      >
                      <th class=" font-semibold text-end text-sm sm:text-[1rem]"
                        >Short Prior Month</th
                      >
                      <th class=" font-semibold text-end text-sm sm:text-[1rem]"
                        >% Change</th
                      >
                      <th class=" font-semibold text-end text-sm sm:text-[1rem]"
                        >Days to Cover</th
                      >
                      <th class=" font-semibold text-end text-sm sm:text-[1rem]"
                        >Short % Float</th
                      >
                      <th class=" font-semibold text-end text-sm sm:text-[1rem]"
                        >Short % Out</th
                      >
                    </tr>
                  </thead>
                  <tbody>
                    {#each tableList as item}
                      <!-- row -->
                      <tr
                        class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                      >
                        <td class=" text-sm sm:text-[1rem] whitespace-nowrap">
                          {new Date(item?.recordDate)?.toLocaleDateString(
                            "en-US",
                            {
                              day: "2-digit", // Include day number
                              month: "short", // Display short month name
                              year: "numeric", // Include year
                              timeZone: "Europe/Berlin",
                            },
                          )}
                        </td>

                        <td
                          class=" text-sm sm:text-[1rem] text-right whitespace-nowrap"
                        >
                          {abbreviateNumber(item?.totalShortInterest)}
                        </td>
                        <td
                          class=" text-sm sm:text-[1rem] text-right whitespace-nowrap"
                        >
                          {abbreviateNumber(item?.shortPriorMo)}
                        </td>
                        <td
                          class=" text-sm sm:text-[1rem] whitespace-nowrap text-end"
                        >
                          <span
                            class={item?.percentChangeMoMo &&
                            item?.percentChangeMoMo >= 0
                              ? "before:content-['+'] text-green-800 dark:text-[#00FC50]"
                              : "text-red-800 dark:text-[#FF2F1F]"}
                          >
                            {item?.percentChangeMoMo
                              ? item?.percentChangeMoMo + "%"
                              : "n/a"}
                          </span>
                        </td>
                        <td
                          class=" text-sm sm:text-[1rem] text-right whitespace-nowrap"
                        >
                          {abbreviateNumber(item?.daysToCover)}
                        </td>
                        <td
                          class=" text-sm sm:text-[1rem] text-right whitespace-nowrap"
                        >
                          {item?.shortPercentOfFloat
                            ? item?.shortPercentOfFloat + "%"
                            : "n/a"}
                        </td>
                        <td
                          class=" text-sm sm:text-[1rem] text-right whitespace-nowrap"
                        >
                          {item?.shortPercentOfOut
                            ? item?.shortPercentOfOut + "%"
                            : "n/a"}
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>
          {:else}
            <Infobox text="No data available" />
          {/if}
        </div>
      </main>
    </div>
  </div>
</section>
