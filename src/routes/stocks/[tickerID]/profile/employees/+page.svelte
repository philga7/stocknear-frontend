<script lang="ts">
  import {
    displayCompanyName,
    screenWidth,
    stockTicker,
  } from "$lib/store";
  import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
  import { Button } from "$lib/components/shadcn/button/index.js";
  import { goto } from "$app/navigation";
  import { Chart } from "svelte-echarts";
  import { init, use } from "echarts/core";
  import { BarChart } from "echarts/charts";
  import { GridComponent, TooltipComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import Infobox from "$lib/components/Infobox.svelte";
  import SEO from "$lib/components/SEO.svelte";
  
  use([BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

  import { abbreviateNumber } from "$lib/utils";

  export let data;

  let employeeHistory = data?.getHistoryEmployee ?? [];
  let historyList = sortByDate(employeeHistory);

  let employees = null;
  let changeRate = null;
  let growthRate = null;

  let optionsTotal;
  let optionsChange;
  let optionsGrowth;
  let dateDistance = false;

  function formatWithDollarSign(value) {
    if (value == null) return "-";

    const negative = value < 0;
    const formattedValue = new Intl.NumberFormat("en").format(Math.abs(value));

    return negative ? `-$${formattedValue}` : `$${formattedValue}`;
  }

  let sortBy = "Total";

  function sortByDate(liste) {
    //Slice copies the list otherwise employeesHistory will reverse too
    return liste?.slice()?.sort(function (a, b) {
      return new Date(b?.filingDate) - new Date(a?.filingDate);
    });
  }

  function plotTotal() {
    let dateList = [];
    let employeeList = [];

    for (let i = 0; i < employeeHistory?.length; i++) {
      const current = employeeHistory[i]?.employeeCount;
      dateList?.push(employeeHistory[i]?.filingDate?.slice(0, 4));
      employeeList?.push(current);
    }

    const options = {
      animation: false,
      grid: {
        left: $screenWidth < 640 ? "5%" : "0%",
        right: $screenWidth < 640 ? "3%" : "0%",
        top: "10%",
        bottom: "10%",
        containLabel: true,
      },
      xAxis: {
        data: dateList,
        type: "category",
        axisLabel: {
          color: "#fff",
          interval: (index, value) =>
            dateList.length > 12 ? index % 2 === 0 : 0, // Show every second label if there are too many
          rotate: 45, // Rotate labels for better readability
          fontSize: 12,
          margin: 10,
        },
      },
      yAxis: [
        {
          type: "value",
          splitLine: {
            show: false,
          },
          axisLabel: {
            show: false,
          },
        },
      ],
      series: [
        {
          name: "Total Employees",
          data: employeeList,
          type: "bar",
          smooth: true,
          itemStyle: {
            color: "#fff",
          },
        },
      ],
      tooltip: {
        trigger: "axis",
        hideDelay: 100,
        borderColor: "#969696",
        borderWidth: 1,
        backgroundColor: "#313131",
        textStyle: {
          color: "#fff",
        },
        formatter: function (params) {
          const date = params[0].name;
          return `${date}<br/> Employees: ${params[0].value?.toLocaleString("en-US")}`;
        },
      },
      dataZoom: [
        {
          type: "slider", // Adds a horizontal slider for zooming
          start: 0,
          end: 100,
        },
      ],
    };

    return options;
  }

  function plotChange() {
    let dateList = [];
    let changeList = [];

    for (let i = 0; i < employeeHistory?.length; i++) {
      const current = employeeHistory[i]?.employeeCount;
      const previous = i === 0 ? 0 : employeeHistory[i - 1]?.employeeCount;
      const change = current - previous;
      dateList?.push(employeeHistory[i]?.filingDate?.slice(0, 4));
      changeList?.push(change);
    }

    const options = {
      animation: false,
      grid: {
        left: "0%",
        right: "0%",
        top: "10%",
        bottom: "20%",
        containLabel: true,
      },
      xAxis: {
        data: dateList,
        type: "category",
        axisLabel: {
          color: "#fff",
          interval: 0, // Show all labels
          rotate: 45, // Rotate labels for better readability
          fontSize: 12, // Adjust font size if needed
        },
      },
      yAxis: [
        {
          type: "value",
          splitLine: {
            show: false, // Disable x-axis grid lines
          },
          axisLabel: {
            show: false, // Hide y-axis labels
          },
        },
      ],
      series: [
        {
          name: "Change of Numbers",
          data: changeList,
          type: "bar",
          barWidth: "80%",
          smooth: true,
          itemStyle: {
            color: function (params) {
              return params.data >= 0 ? "#22C55E" : "#F71F4F";
            },
          },
        },
      ],
      tooltip: {
        trigger: "axis",
      },
    };

    return options;
  }

  function plotGrowth() {
    let dateList = [];
    let growthList = [];

    for (let i = 0; i < employeeHistory?.length; i++) {
      const current = employeeHistory[i]?.employeeCount;
      const previous = i === 0 ? 0 : employeeHistory[i - 1]?.employeeCount;

      if (current !== null && previous !== null && previous !== 0) {
        const growth = (((current - previous) / previous) * 100)?.toFixed(2);
        growthList?.push(growth);
      } else {
        growthList?.push(0); // Pushing null if the growth calculation is not possible
      }

      dateList?.push(employeeHistory[i]?.filingDate?.slice(0, 4));
    }

    const options = {
      animation: false,
      grid: {
        left: "0%",
        right: "0%",
        top: "10%",
        bottom: "20%",
        containLabel: true,
      },
      xAxis: {
        data: dateList,
        type: "category",
        axisLabel: {
          color: "#fff",
          interval: 0, // Show all labels
          rotate: 45, // Rotate labels for better readability
          fontSize: 12, // Adjust font size if needed
          margin: 10,
        },
      },
      yAxis: [
        {
          type: "value",
          splitLine: {
            show: false, // Disable x-axis grid lines
          },

          axisLabel: {
            show: false, // Hide y-axis labels
          },
        },
      ],
      series: [
        {
          name: "Growth [%]",
          data: growthList,
          type: "bar",
          barWidth: "80%",
          smooth: true,
          itemStyle: {
            // Define colors based on positive/negative values
            color: function (params) {
              return params.data >= 0 ? "#22C55E" : "#F71F4F";
            },
          },
        },
      ],
      tooltip: {
        trigger: "axis",
      },
    };

    return options;
  }

  const exportData = (format = "csv") => {
    if (data?.user?.tier === "Pro") {
      // Add headers row
      const csvRows = [];
      csvRows.push("Date,Employees,Change,Growth");

      // Add data rows
      historyList.forEach((item, index) => {
        const date = new Date(item.filingDate).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        const employees = item.employeeCount;

        // Calculate change
        const change =
          index + 1 < historyList.length
            ? item.employeeCount - historyList[index + 1].employeeCount
            : 0;

        // Calculate growth percentage
        let growth = "0.00%";
        if (index + 1 < historyList.length) {
          const growthValue =
            ((item.employeeCount - historyList[index + 1].employeeCount) /
              item.employeeCount) *
            100;
          if (growthValue > 0) {
            growth = `+${growthValue.toFixed(2)}%`;
          } else if (growthValue < 0) {
            growth = `-${Math.abs(growthValue).toFixed(2)}%`;
          }
        }

        const csvRow = `${date},${employees},${change},${growth}`;
        csvRows.push(csvRow);
      });

      // Create CSV blob and trigger download
      const csv = csvRows.join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("hidden", "");
      a.setAttribute("href", url);
      a.setAttribute("download", `${$stockTicker}_employees.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      goto("/pricing");
    }
  };

  function generateEmployeeInfoHTML() {
    if (employeeHistory?.length !== 0 && !dateDistance) {
      const formattedEmployees = new Intl.NumberFormat("en").format(employees);
      const latestFilingDate = new Date(
        employeeHistory[employeeHistory.length - 1]["filingDate"],
      ).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const formattedChangeRate = new Intl.NumberFormat("en").format(
        changeRate,
      );
      const changeDirection =
        changeRate >= 0 && changeRate !== null ? "increased" : "decreased";
      const growthRateClass =
        changeRate >= 0 && changeRate !== null
          ? "text-[#00FC50]"
          : "text-[#FF2F1F]";

      return `
      <span>
        ${$displayCompanyName} had ${formattedEmployees} employees on ${latestFilingDate}. The number of employees ${changeDirection}
        by ${formattedChangeRate} or
        <span class="${growthRateClass}">
          ${growthRate}%
        </span>
        compared to the previous year.
      </span>
    `;
    } else if (employeeHistory?.length !== 0 && dateDistance) {
      const abbreviatedEmployees = abbreviateNumber(employees);
      const latestFilingDate = new Date(
        employeeHistory[employeeHistory.length - 1]["filingDate"],
      ).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      return `
      <span>
        ${$displayCompanyName} had ${abbreviatedEmployees} employees on ${latestFilingDate}. Since then, the company has not submitted any additional employee data for more than a year.
      </span>
    `;
    } else {
      return `
      <span>
        No employee history for ${$displayCompanyName}. Probably, no records of past employees.
      </span>
    `;
    }
  }

  $: {
    if (employeeHistory?.length > 0 && $stockTicker) {
      employeeHistory = data?.getHistoryEmployee ?? [];
      historyList = sortByDate(employeeHistory);

      employees = employeeHistory?.at(-1)?.employeeCount;

      changeRate = employees - employeeHistory?.at(-2)?.employeeCount;

      dateDistance =
        new Date(employeeHistory[employeeHistory?.length - 1]["filingDate"]) <
        new Date(new Date().setFullYear(new Date().getFullYear() - 1))
          ? true
          : false;

      growthRate = (
        (employeeHistory[employeeHistory?.length - 1]?.employeeCount /
          employeeHistory[employeeHistory?.length - 2]?.employeeCount -
          1) *
        100
      )?.toFixed(2);
      optionsTotal = plotTotal();
      optionsChange = plotChange();
      optionsGrowth = plotGrowth();

      htmlOutput = generateEmployeeInfoHTML();
    }
  }

  let htmlOutput = generateEmployeeInfoHTML();
</script>


<SEO
  title={`${$displayCompanyName} (${$stockTicker}) Number of Employees ${historyList?.at(-1)?.filingDate?.slice(0, 4)} - ${historyList?.at(0)?.filingDate?.slice(0, 4)} · Stocknear`}
  description={`Current and historical number of employees for ${$displayCompanyName} (${$stockTicker}) with related statistics, a chart and a data table.`}
/>

<section class="bg-default w-full overflow-hidden text-white h-full">
  <div class="w-full flex justify-center m-auto h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <div class="sm:pl-7 sm:pb-7 sm:pt-7 w-full m-auto mt-2 sm:mt-0">
        <div class="mb-6">
          <h2 class="text-xl sm:text-2xl text-white font-bold mb-4">
            {$stockTicker} Employees
          </h2>

          <Infobox text={htmlOutput} />
        </div>

        <div
          class="my-5 grid grid-cols-2 gap-3 xs:mt-6 bp:mt-7 sm:grid-cols-3 sm:gap-6"
        >
          <div>
            Employees
            <div
              class="mt-0.5 text-lg font-semibold bp:text-xl sm:mt-1.5 sm:text-2xl"
            >
              {#if Number(employees)}
                {new Intl.NumberFormat("en")?.format(employees)}
              {:else}
                n/a
              {/if}
            </div>
          </div>
          <div>
            Change (1Y) <div
              class="mt-0.5 text-lg font-semibold bp:text-xl sm:mt-1.5 sm:text-2xl"
            >
              {#if dateDistance}
                n/a
              {:else}
                {changeRate !== null
                  ? new Intl.NumberFormat("en")?.format(changeRate)
                  : "n/a"}
              {/if}
            </div>
          </div>
          <div>
            Growth (1Y) <div
              class="mt-0.5 text-lg {growthRate > 0
                ? "before:content-['+'] "
                : ''} font-semibold bp:text-xl sm:mt-1.5 sm:text-2xl"
            >
              {growthRate !== null ? growthRate + "%" : "n/a"}
            </div>
          </div>
          <div>
            Revenue / Employee
            <div
              class="mt-0.5 text-lg font-semibold bp:text-xl sm:mt-1.5 sm:text-2xl"
            >
              {#if Number(data?.getStockDeck?.revenuePerEmployee)}
                ${new Intl.NumberFormat("en")?.format(
                  data?.getStockDeck?.revenuePerEmployee,
                )}
              {:else}
                n/a
              {/if}
            </div>
          </div>
          <div>
            Profits / Employee
            <div
              class="mt-0.5 text-lg font-semibold bp:text-xl sm:mt-1.5 sm:text-2xl"
            >
              {#if Number(data?.getStockDeck?.profitPerEmployee)}
                {formatWithDollarSign(data?.getStockDeck?.profitPerEmployee)}
              {:else}
                n/a
              {/if}
            </div>
          </div>
          <div>
            Market Cap
            <div
              class="mt-0.5 text-lg font-semibold bp:text-xl sm:mt-1.5 sm:text-2xl"
            >
              {@html abbreviateNumber(
                data?.getStockQuote?.marketCap,
                false,
                true,
              )}
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-center w-full mt-10 mb-8">
          <h1
            class="text-xl sm:text-2xl text-white font-bold text-start mr-auto mb-4 sm:mb-0"
          >
            Employees Chart
          </h1>
          {#if historyList?.length > 0}
            <div class="flex flex-row items-center w-fit ml-auto">
              <div class="relative inline-block text-left grow">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild let:builder>
                    <Button
                      builders={[builder]}
                      class="w-full border-gray-600 border bg-default sm:hover:bg-primary ease-out  flex flex-row justify-between items-center px-3 py-2 text-white rounded-md truncate"
                    >
                      <span class="truncate text-white">{sortBy}</span>
                      <svg
                        class="-mr-1 ml-1 h-5 w-5 xs:ml-2 inline-block"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        style="max-width:40px"
                        aria-hidden="true"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content
                    class="w-56 h-fit max-h-72 overflow-y-auto scroller"
                  >
                    <DropdownMenu.Label class="text-gray-400">
                      Select Type
                    </DropdownMenu.Label>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Group>
                      <DropdownMenu.Item
                        on:click={() => (sortBy = "Total")}
                        class="cursor-pointer hover:bg-primary"
                      >
                        Total
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        on:click={() => (sortBy = "Change")}
                        class="cursor-pointer hover:bg-primary"
                      >
                        Change
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        on:click={() => (sortBy = "Growth")}
                        class="cursor-pointer hover:bg-primary"
                      >
                        Growth
                      </DropdownMenu.Item>
                    </DropdownMenu.Group>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </div>
              <Button
                on:click={() => exportData("csv")}
                class="ml-2 w-fit border-gray-600 border bg-default sm:hover:bg-primary ease-out flex flex-row justify-between items-center px-3 py-2 text-white rounded-md truncate"
              >
                <span class="truncate text-white">Download</span>
                <svg
                  class="{data?.user?.tier === 'Pro'
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
          {/if}
        </div>

        {#if historyList?.length !== 0}
          {#if sortBy === "Total"}
            <div class="app w-full">
              <Chart {init} options={optionsTotal} class="chart" />
            </div>
          {:else if sortBy === "Change"}
            <div class="app w-full">
              <Chart {init} options={optionsChange} class="chart" />
            </div>
          {:else if sortBy === "Growth"}
            <div class="app w-full">
              <Chart {init} options={optionsGrowth} class="chart" />
            </div>
          {/if}

          <div class="w-full overflow-x-scroll">
            <table
              class="table table-sm table-compact rounded-none sm:rounded-md w-full bg-table border border-gray-800 m-auto"
            >
              <thead class="bg-default">
                <tr>
                  <th
                    class="text-start text-white text-sm whitespace-nowrap font-semibold"
                  >
                    Date
                  </th>
                  <th
                    class="text-end text-white text-sm whitespace-nowrap font-semibold"
                  >
                    Employees
                  </th>
                  <th
                    class="text-end text-white text-sm whitespace-nowrap font-semibold"
                  >
                    Change
                  </th>
                  <th
                    class="text-end text-white text-sm whitespace-nowrap font-semibold"
                  >
                    Growth
                  </th>
                </tr>
              </thead>
              <tbody class="">
                {#each historyList as item, index}
                  <tr class="text-white odd:bg-odd border-b border-gray-800">
                    <td
                      class="text-start text-sm sm:text-[1rem] whitespace-nowrap text-white"
                    >
                      {new Date(item?.filingDate)?.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        daySuffix: "2-digit",
                      })}
                    </td>
                    <td
                      class="text-end text-sm sm:text-[1rem] whitespace-nowrap text-white"
                    >
                      {new Intl.NumberFormat("en").format(item?.employeeCount)}
                    </td>
                    <td
                      class="text-end text-sm sm:text-[1rem] whitespace-nowrap text-white"
                    >
                      {#if Number(item?.employeeCount - historyList[index + 1]?.employeeCount)}
                        {new Intl.NumberFormat("en")?.format(
                          item?.employeeCount -
                            historyList[index + 1]?.employeeCount,
                        )}
                      {:else}
                        n/a
                      {/if}
                    </td>
                    <td
                      class="text-end text-sm sm:text-[1rem] whitespace-nowrap text-white text-end"
                    >
                      {#if index + 1 - historyList?.length === 0}
                        n/a
                      {:else if item?.employeeCount - historyList[index + 1]?.employeeCount > 0}
                        <span class="text-[#00FC50]">
                          +{(
                            ((item?.employeeCount -
                              historyList[index + 1]?.employeeCount) /
                              item?.employeeCount) *
                            100
                          )?.toFixed(2)}%
                        </span>
                      {:else if item?.employeeCount - historyList[index + 1]?.employeeCount < 0}
                        <span class="text-[#FF2F1F]">
                          -{(
                            ((historyList[index + 1]?.employeeCount -
                              item?.employeeCount) /
                              item?.employeeCount) *
                            100
                          )?.toFixed(2)}%
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
          <h1
            class="text-xl m-auto flex justify-center text-white font-semibold mb-4 mt-10"
          >
            No history found
          </h1>
        {/if}
      </div>
    </div>
  </div>
</section>

<style>
  .app {
    height: 400px;
    width: 100%;
  }

  @media (max-width: 560px) {
    .app {
      width: 100%;
      height: 300px;
    }
  }

  .chart {
    width: 100%;
  }
</style>
