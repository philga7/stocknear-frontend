<script lang="ts">
  import { displayCompanyName, stockTicker } from "$lib/store";
  import {
    abbreviateNumber,
    monthNames,
    removeCompanyStrings,
  } from "$lib/utils";
  import SEO from "$lib/components/SEO.svelte";
  import highcharts from "$lib/highcharts.ts";

  export let data;

  const names =
    data?.getBusinessMetrics?.revenue?.names?.map((name) =>
      name
        ?.toLowerCase()
        ?.replace(/&/g, "") // Remove & symbol
        ?.replace(/\s+/g, "-") // Replace spaces with dash
        ?.replace(/-{2,}/g, "-") // Replace multiple dashes with single dash
        ?.replace(/^-|-$/g, "") // Remove leading/trailing dashes
        ?.trim(),
    ) || [];

  let config = null;

  let rawData = data?.getBusinessMetrics?.revenue?.history;

  let dataset = [];
  let tableList = [];

  function convertToTitleCase(str) {
    return str
      ?.split("-") // Split the string by hyphen
      ?.map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
      ?.join(" ")
      ?.replace("Oem", "OEM");
  }

  function plotData() {
    // First, sort and filter your dataset just like before.
    const plotDataset = [...dataset]?.sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );
    const xData = plotDataset
      .filter((item) => item.value !== null) // Filter out null values
      .map((item) => item.date); // Get the date strings

    const valueList = [];
    for (let i = 0; i < plotDataset.length; i++) {
      if (plotDataset[i].value !== null) {
        valueList.push(plotDataset[i].value);
      }
    }

    // Build the Highcharts configuration object.
    const options = {
      credits: {
        enabled: false,
      },
      chart: {
        type: "column",
        backgroundColor: "#09090B",
        plotBackgroundColor: "#09090B",
        height: 360, // Set the maximum height for the chart
        animation: false,
      },
      title: {
        text: `<h3 class="mt-3 mb-1">${removeCompanyStrings($displayCompanyName)} Revenue by ${convertToTitleCase(data?.getParams)}</h3>`,
        style: {
          color: "white",
          // Using inline CSS for margin-top and margin-bottom
        },
        useHTML: true, // Enable HTML to apply custom class styling
      },
      xAxis: {
        categories: xData,
        labels: {
          formatter: function () {
            // 'this.value' is the date string (e.g., "YYYY-MM-DD")
            const dateParts = this.value.split("-");
            const year = dateParts[0].substring(2); // last two digits of year
            const monthIndex = parseInt(dateParts[1], 10) - 1;
            return `${monthNames[monthIndex]} '${year}`;
          },
          style: {
            color: "#fff",
            fontSize: "12px",
          },
          rotation: 45, // Rotate labels for better readability
        },
        tickmarkPlacement: "on",
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
      series: [
        {
          name: "Revenue",
          data: valueList,
          color: "#fff",
        },
      ],
      legend: {
        enabled: false,
      },
    };

    return options;
  }

  $: {
    if ($stockTicker && data?.getParams) {
      dataset = [];
      tableList = [];
      // Find the index of the current getParams value in the names array
      const index = names?.indexOf(data.getParams?.toLowerCase());

      dataset = rawData?.map((entry) => ({
        date: entry.date,
        value: index !== -1 ? entry.value[index] : null,
        valueGrowth: index !== -1 ? entry.valueGrowth[index] : null,
      }));

      tableList = [...dataset];

      tableList = tableList?.sort(
        (a, b) => new Date(b?.date) - new Date(a?.date),
      );

      config = plotData();
    }
  }
</script>

<SEO
  title={`${removeCompanyStrings($displayCompanyName)} Business Metrics & Revenue Breakdown`}
  description={`View unique business metrics for ${$displayCompanyName} (${$stockTicker}) stock, including revenue by segment, gross margin by type, gross profit by type.`}
/>

<section class="bg-default w-full overflow-hidden text-white h-full">
  <div class="w-full flex justify-center w-full sm-auto h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <main class="w-full">
        <div class="sm:pl-7 sm:pb-7 sm:pt-7 m-auto mt-2 sm:mt-0 w-full">
          <div class="mb-3">
            <h1 class="text-2xl text-gray-200 font-bold">
              {convertToTitleCase(data?.getParams)} Revenue
            </h1>
          </div>

          {#if rawData?.length !== 0}
            <div
              class="chart mt-5 sm:mt-0 border border-gray-800 rounded"
              use:highcharts={config}
            ></div>

            <h2 class="mt-5 text-xl sm:text-2xl text-white font-bold">
              History
            </h2>

            <div class="w-full overflow-x-scroll">
              <table
                class="table table-sm table-compact rounded-none sm:rounded-md w-full bg-table border border-gray-800 m-auto mt-4"
              >
                <thead class="bg-default">
                  <tr class="border-b border-gray-800">
                    <th class="text-white font-semibold text-start text-sm"
                      >Quarter</th
                    >
                    <th class="text-white font-semibold text-end text-sm"
                      >Value</th
                    >
                    <th class="text-white font-semibold text-end text-sm">
                      Change
                    </th>
                    <th class="text-white font-semibold text-end text-sm"
                      >Growth</th
                    >
                  </tr>
                </thead>
                <tbody>
                  {#each tableList as item, index}
                    <!-- row -->
                    <tr class=" odd:bg-odd border-b border-gray-800">
                      <td
                        class="text-white font-medium text-sm sm:text-[1rem] whitespace-nowrap"
                      >
                        {new Date(item?.date ?? null)?.toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      <td
                        class="text-white text-sm sm:text-[1rem] text-right whitespace-nowrap"
                      >
                        {@html item?.value !== null && item?.value !== undefined
                          ? abbreviateNumber(item?.value, false, true)
                          : "n/a"}
                      </td>

                      <td
                        class="text-white text-sm sm:text-[1rem] text-right whitespace-nowrap"
                      >
                        {#if Number(item?.value - tableList[index + 1]?.value)}
                          {@html abbreviateNumber(
                            item?.value - tableList[index + 1]?.value,
                            false,
                            true,
                          )}
                        {:else}
                          n/a
                        {/if}
                      </td>

                      <td
                        class="text-white text-sm sm:text-[1rem] whitespace-nowrap font-medium text-end"
                      >
                        {#if item?.valueGrowth > 0}
                          <span class="text-[#00FC50]">
                            +{item?.valueGrowth?.toFixed(2)}%
                          </span>
                        {:else if item?.valueGrowth < 0}
                          <span class="text-[#FF2F1F]">
                            {item?.valueGrowth?.toFixed(2)}%
                          </span>
                        {:else}
                          n/a
                        {/if}
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {:else}
            <h2
              class="mt-16 flex justify-center items-center text-2xl font-medium text-white mb-5 m-auto"
            >
              No data available
            </h2>
          {/if}
        </div>
      </main>
    </div>
  </div>
</section>
