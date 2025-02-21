<script lang="ts">
  import {
    numberOfUnreadNotification,
    displayCompanyName,
    coolMode,
    timeFrame,
    stockTicker,
  } from "$lib/store";
  import { abbreviateNumber } from "$lib/utils";
  import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
  import { Button } from "$lib/components/shadcn/button/index.js";
  //import * as XLSX from 'xlsx';
  import { Chart } from "svelte-echarts";
  import { goto } from "$app/navigation";
  import { init, use } from "echarts/core";
  import { LineChart, BarChart } from "echarts/charts";
  import { GridComponent, TooltipComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import FinancialTable from "$lib/components/FinancialTable.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  import SEO from "$lib/components/SEO.svelte";

  use([LineChart, BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

  export let data;

  let optionsData;

  let cashFlow = [];
  let fullStatement = [];
  let filterRule = "annual";
  let displayStatement = "netIncome";

  let tableList = [];

  let activeIdx = 0;

  const tabs = [
    {
      title: "Annual",
    },
    {
      title: "Quarterly",
    },
  ];
  const statementConfig = [
    {
      propertyName: "netIncome",
      growthPropertyName: "growthNetIncome",
      label: "Net Income",
      text: "Net income is a company's accounting profits after subtracting all costs and expenses from the revenue. It is also called earnings, profits.",
    },
    {
      propertyName: "depreciationAndAmortization",
      growthPropertyName: "growthDepreciationAndAmortization",
      label: "Depreciation & Amortization",
      text: "Depreciation and amortization are accounting methods for calculating how the value of a business's assets change over time. Depreciation refers to physical assets, while amortization refers to intangible assets.",
    },
    {
      propertyName: "stockBasedCompensation",
      growthPropertyName: "growthStockBasedCompensation",
      label: "Stock-Based Compensation",
      text: "Stock-based compensation is the value of stocks issued for the purpose of compensating the executives and employees of a company.",
    },
    {
      propertyName: "otherWorkingCapital",
      growthPropertyName: "growthOtherWorkingCapital",
      label: "Other Working Capital",
      text: "Other working capital represents miscellaneous changes in short-term assets and liabilities that don't have specific categories, affecting the company's available cash.",
    },
    {
      propertyName: "otherNonCashItems",
      growthPropertyName: "growthOtherNonCashItems",
      label: "Other Non-Cash Items",
      text: "Other Non-Cash Items refers to non-cash transactions or adjustments that impact the company's financial performance but don't involve actual cash flows. These can include items like depreciation, amortization, or changes in the fair value of investments.",
    },
    {
      propertyName: "deferredIncomeTax",
      growthPropertyName: "growthDeferredIncomeTax",
      label: "Deferred Income Tax",
      text: "Deferred income tax refers to future tax liabilities or assets resulting from differences in how a company reports income for tax purposes versus financial reporting. It represents the amount of income tax that will be paid or saved in the future due to these differences.",
    },
    {
      propertyName: "changeInWorkingCapital",
      growthPropertyName: "growthChangeInWorkingCapital",
      label: "Change in Working Capital",
      text: "Change in working capital is the difference between a company's short-term assets and liabilities over a specific period, reflecting how much cash flow is impacted by these changes.",
    },
    {
      propertyName: "netCashProvidedByOperatingActivities",
      growthPropertyName: "growthNetCashProvidedByOperatingActivites",
      label: "Operating Cash Flow",
      text: "Operating cash flow, also called cash flow from operating activities, measures the amount of cash that a company generates from normal business activities. It is the amount of cash left after all cash income has been received, and all cash expenses have been paid.",
    },
    {
      propertyName: "capitalExpenditure",
      growthPropertyName: "growthCapitalExpenditure",
      label: "Capital Expenditures",
      text: "Capital expenditures are also called payments for property, plants and equipment. It measures cash spent on long-term assets that will be used to run the business, such as manufacturing equipment, real estate and others.",
    },
    {
      propertyName: "acquisitionsNet",
      growthPropertyName: "growthAcquisitionsNet",
      label: "Acquisitions",
      text: "The amount of cash spent on acquiring other businesses.",
    },
    {
      propertyName: "purchasesOfInvestments",
      growthPropertyName: "growthPurchasesOfInvestments",
      label: "Purchase of Investments",
      text: "Purchase of Investments refers to the acquisition of financial assets like stocks or bonds by a company, typically for investment purposes. It represents an outflow of cash used to buy these investments.",
    },
    {
      propertyName: "salesMaturitiesOfInvestments",
      growthPropertyName: "growthSalesMaturitiesOfInvestments",
      label: "Sales Maturities Of Investments",
      text: "Sales Maturities of Investments signifies the selling or maturity of financial assets like stocks or bonds by a company. It represents an inflow of cash resulting from these investment activities.",
    },
    {
      propertyName: "otherInvestingActivites",
      growthPropertyName: "growthOtherInvestingActivites",
      label: "Other Investing Acitivies",
      text: "Other investing activities are investing activities that do not belong to any of the categories we mentioned so far.",
    },
    {
      propertyName: "netCashUsedForInvestingActivites",
      growthPropertyName: "growthNetCashUsedForInvestingActivites",
      label: "Investing Cash Flow",
      text: "Investing cash flow is the total change in cash from buying and selling investments and long-term assets.",
    },
    {
      propertyName: "debtRepayment",
      growthPropertyName: "growthDebtRepayment",
      label: "Debt Repayment",
      text: "Debt Repayment is the process of paying off loans or debt obligations. It represents an outflow of cash as the company reduces its outstanding debt.",
    },
    {
      propertyName: "commonStockRepurchased",
      growthPropertyName: "growthCommonStockRepurchased",
      label: "Common Stock Repurchased",
      text: "The cash gained from issuing shares, or cash spent on repurchasing shares via share buybacks. A positive number implies that the company issued more shares than it repurchased. A negative number implies that the company bought back shares.",
    },
    {
      propertyName: "dividendsPaid",
      growthPropertyName: "growthDividendsPaid",
      label: "Dividend Paid",
      text: "The total amount paid out as cash dividends to shareholders.",
    },
    {
      propertyName: "otherFinancingActivites",
      growthPropertyName: "growthOtherFinancingActivites",
      label: "Other Financial Acitivies",
      text: "Other financial activities includes miscellaneous financial transactions beyond regular operations that impact a company's cash flow.",
    },
    {
      propertyName: "netCashUsedProvidedByFinancingActivities",
      growthPropertyName: "growthNetCashUsedProvidedByFinancingActivities",
      label: "Financial Cash Flow",
      text: "Financing cash flow is the total change in cash through financing activities. This includes dividend payments, share issuance and repurchases, changes in debt levels and others.",
    },
    {
      propertyName: "netChangeInCash",
      growthPropertyName: "growthNetChangeInCash",
      label: "Net Cash Flow",
      text: "Net cash flow is the sum of the operating, investing and financing cash flow numbers. It is the change in cash and equivalents on the company's balance sheet during the accounting period. It is often shown as increase/decrease in cash and equivalents on the cash flow statement.",
    },
    {
      propertyName: "freeCashFlow",
      growthPropertyName: "growthFreeCashFlow",
      label: "Free Cash Flow",
      text: "Free cash flow is the cash remaining after the company spends on everything required to maintain and grow the business. It is calculated by subtracting capital expenditures from operating cash flow.",
    },
  ];

  const fields = statementConfig.map((item) => ({
    label: item.label,
    key: item.propertyName,
  }));

  function toggleMode() {
    $coolMode = !$coolMode;
  }

  function changeStatement(event) {
    displayStatement = event.target.value;
  }

  function plotData() {
    let labelName = "-";
    let xList = [];
    let valueList = [];
    tableList = [];

    const index = statementConfig?.findIndex(
      (item) => item?.propertyName === displayStatement,
    );

    for (let i = cashFlow?.length - 1; i >= 0; i--) {
      const statement = cashFlow[i];
      const year = statement?.calendarYear?.slice(-2);
      const quarter = statement?.period;

      // Determine the label based on filterRule
      if (filterRule === "annual") {
        xList.push("FY" + year);
      } else {
        xList.push("FY" + year + " " + quarter);
      }

      // Calculate the value and growth
      const value = Number(
        statement[statementConfig[index]?.propertyName],
      )?.toFixed(2);

      valueList.push(value);

      // Add the entry to tableList
      tableList.push({
        date: statement?.date,
        value: value,
      });
    }

    //sort tableList by date
    tableList?.sort((a, b) => new Date(b?.date) - new Date(a?.date));

    labelName = statementConfig[index]?.label;

    const options = {
      animation: false,
      grid: {
        left: "0%",
        right: "0%",
        bottom: "2%",
        top: "10%",
        containLabel: true,
      },
      xAxis: {
        axisLabel: {
          color: "#fff",
        },
        data: xList,
        type: "category",
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
          name: labelName,
          data: valueList,
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
        borderColor: "#969696", // Black border color
        borderWidth: 1, // Border width of 1px
        backgroundColor: "#313131", // Optional: Set background color for contrast
        textStyle: {
          color: "#fff", // Optional: Text color for better visibility
        },
        formatter: function (params) {
          const date = params[0].name; // Get the date from the x-axis value
          // Return the tooltip content
          return `${date}<br/> ${
            statementConfig?.find(
              (item) => item?.propertyName === displayStatement,
            )?.label
          }: ${abbreviateNumber(params[0].value)}`;
        },
      },
    };

    return options;
  }

  fullStatement = data?.getCashFlowStatement;

  displayStatement = "netIncome";

  const getCurrentYear = () => new Date()?.getFullYear();

  const filterStatement = (fullStatement, timeFrame) => {
    const currentYear = getCurrentYear();

    switch (timeFrame) {
      case "5Y":
        return fullStatement?.filter(
          (item) => currentYear - parseInt(item?.calendarYear) < 5,
        );
      case "10Y":
        return fullStatement?.filter(
          (item) => currentYear - parseInt(item?.calendarYear) < 10,
        );
      default:
        return fullStatement;
    }
  };

  const exportFundamentalData = (format = "csv") => {
    if (data?.user?.tier === "Pro") {
      const data = fullStatement;
      if (!data || data.length === 0) {
        return;
      }

      let properties = [
        {
          key: filterRule === "annual" ? "calendarYear" : "date",
          label: filterRule === "annual" ? "Year" : "Quarter",
        },
      ];

      for (let i = 0; i < statementConfig?.length; i++) {
        properties.push({
          key: statementConfig[i]?.propertyName,
          label: statementConfig[i]?.label,
        });
      }

      // Helper function to handle special cases

      // Create rows for CSV/Excel
      let rows = data.map((item) =>
        properties?.map((property) => item[property?.key] || 0),
      );

      // Include headers
      const headers = properties.map((prop) => prop.label);
      rows.unshift(headers);

      // Check the format to export
      if (format.toLowerCase() === "csv") {
        const csvContent = rows.map((row) => row.join(",")).join("\n");
        const blob = new Blob([csvContent], {
          type: "data:text/csv;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download =
          $stockTicker.toLowerCase() +
          `${filterRule === "annual" ? "_annual" : "_quarter"}_cashflow_statement.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } /*else if (format.toLowerCase() === "excel") {
      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Ratios Statement");
      XLSX.writeFile(
        workbook,
        `${$stockTicker.toLowerCase()}-ratios-statement.xlsx`,
      );
      
    }
      */
    } else {
      goto("/pricing");
    }
  };

  $: {
    if ($timeFrame || displayStatement || activeIdx) {
      if (activeIdx === 0) {
        filterRule = "annual";
        fullStatement = data?.getCashFlowStatement?.annual;
      } else {
        filterRule = "quarterly";
        fullStatement = data?.getCashFlowStatement?.quarter;
      }
      cashFlow = filterStatement(fullStatement, $timeFrame);

      if ($coolMode === true) {
        optionsData = plotData();
      }
    }
  }

  function generateStatementInfoHTML() {
    if ($coolMode) {
      const statementText = statementConfig?.find(
        (item) => item?.propertyName === displayStatement,
      )?.text;

      return `<span>${statementText || ""}</span>`;
    } else if (cashFlow?.length > 0) {
      return `
      <span>
       Get detailed ratio statement breakdowns, uncovering price to free cash flow ratio, price per earnings, and much more.
      </span>
    `;
    } else {
      return `
      <span>
        No financial data available for ${$displayCompanyName}.
      </span>
    `;
    }
  }

  let htmlOutput = null;
  $: {
    if ($coolMode || displayStatement) {
      htmlOutput = generateStatementInfoHTML();
    }
  }
</script>

<SEO
  title={`${$displayCompanyName} (${$stockTicker}) Cash Flow Statement · Stocknear`}
  description={`Detailed cash flow statements for ${$displayCompanyName} (${$stockTicker}), including operating cash flow, capex and free cash flow.`}
/>

<section class="w-full bg-default overflow-hidden text-white h-full">
  <div
    class="flex justify-center w-full m-auto h-full overflow-hidden mt-4 sm:mt-0"
  >
    <div
      class="relative flex justify-center items-center overflow-hidden w-full"
    >
      <main class="w-full">
        <div class="sm:pl-7 sm:pb-7 sm:pt-7 m-auto mt-2 sm:mt-0 w-full">
          <div class="mb-3">
            <h1 class="text-xl sm:text-2xl text-white font-bold">
              {#if $coolMode}
                {statementConfig?.find(
                  (item) => item?.propertyName === displayStatement,
                )?.label}
              {:else}
                Cashflow {filterRule === "annual" ? "(Annual)" : "(Quarter)"}
              {/if}
            </h1>
          </div>

          <div class="grid grid-cols-1 gap-2 w-full">
            <Infobox text={htmlOutput} />
            {#if cashFlow?.length > 0}
              <div
                class="inline-flex justify-center w-full rounded-md sm:w-auto sm:ml-auto mt-3 mb-6"
              >
                <div
                  class="bg-secondary w-full min-w-24 sm:w-fit relative flex flex-wrap items-center justify-center rounded-md p-1 mt-4"
                >
                  {#each tabs as item, i}
                    {#if data?.user?.tier !== "Pro" && i > 0}
                      <button
                        on:click={() => goto("/pricing")}
                        class="group relative z-[1] rounded-full w-1/2 min-w-24 md:w-auto px-5 py-1"
                      >
                        <span class="relative text-sm block font-semibold">
                          {item.title}
                          <svg
                            class="inline-block ml-0.5 -mt-1 w-3.5 h-3.5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            ><path
                              fill="#A3A3A3"
                              d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                            /></svg
                          >
                        </span>
                      </button>
                    {:else}
                      <button
                        on:click={() => (activeIdx = i)}
                        class="group relative z-[1] rounded-full w-1/2 min-w-24 md:w-auto px-5 py-1 {activeIdx ===
                        i
                          ? 'z-0'
                          : ''} "
                      >
                        {#if activeIdx === i}
                          <div
                            class="absolute inset-0 rounded-md bg-[#fff]"
                          ></div>
                        {/if}
                        <span
                          class="relative text-sm block font-semibold whitespace-nowrap {activeIdx ===
                          i
                            ? 'text-black'
                            : 'text-white'}"
                        >
                          {item.title}
                        </span>
                      </button>
                    {/if}
                  {/each}
                </div>
              </div>

              <div
                class="mb-2 flex flex-row items-center w-full justify-end sm:justify-center"
              >
                <label
                  class="inline-flex mt-2 sm:mt-0 cursor-pointer relative mr-auto"
                >
                  <input
                    on:click={toggleMode}
                    type="checkbox"
                    checked={$coolMode}
                    value={$coolMode}
                    class="sr-only peer"
                  />
                  <div
                    class="w-11 h-6 bg-gray-400 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1563F9]"
                  ></div>
                  {#if $coolMode}
                    <span class="ml-2 text-sm font-medium text-white">
                      Cool Mode
                    </span>
                  {:else}
                    <span class="ml-2 text-sm font-medium text-white">
                      Boring Mode
                    </span>
                  {/if}
                </label>

                <div class="flex flex-row items-center w-fit sm:ml-auto">
                  <div class="relative inline-block text-left grow">
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild let:builder>
                        <Button
                          builders={[builder]}
                          class="w-full border-gray-600 border bg-default sm:hover:bg-primary ease-out  flex flex-row justify-between items-center px-3 py-2 text-white rounded-md truncate"
                        >
                          <span class="truncate text-white">{$timeFrame}</span>
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
                          Select time frame
                        </DropdownMenu.Label>
                        <DropdownMenu.Separator />
                        <DropdownMenu.Group>
                          <DropdownMenu.Item
                            on:click={() => ($timeFrame = "5Y")}
                            class="cursor-pointer hover:bg-primary"
                          >
                            5 years
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            on:click={() => ($timeFrame = "10Y")}
                            class="cursor-pointer hover:bg-primary"
                          >
                            10 years
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            on:click={() => ($timeFrame = "MAX")}
                            class="cursor-pointer hover:bg-primary"
                          >
                            Max
                          </DropdownMenu.Item>
                        </DropdownMenu.Group>
                      </DropdownMenu.Content>
                    </DropdownMenu.Root>
                  </div>
                  <Button
                    on:click={() => exportFundamentalData("csv")}
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
              </div>

              {#if $coolMode}
                <div class="sm:w-full">
                  <div class="relative">
                    <select
                      class="w-36 select select-bordered select-sm p-0 pl-5 overflow-y-auto bg-secondary"
                      on:change={changeStatement}
                    >
                      <option disabled>Choose an Cash Flow Variable</option>
                      <option value="netIncome" selected>Net Income</option>
                      <option value="depreciationAndAmortization"
                        >Depreciation & Amortization</option
                      >
                      <option value="stockBasedCompensation"
                        >Stock-Based Compensation</option
                      >
                      <option value="otherWorkingCapital"
                        >Other Working Capital</option
                      >
                      <option value="otherNonCashItems"
                        >Other Non-Cash Items</option
                      >
                      <option value="deferredIncomeTax"
                        >Deferred Income Tax</option
                      >
                      <option value="changeInWorkingCapital"
                        >Change in Working Capital</option
                      >
                      <option value="netCashProvidedByOperatingActivities"
                        >Operating Cash Flow</option
                      >
                      <option value="capitalExpenditure"
                        >Capital Expenditures</option
                      >
                      <option value="acquisitionsNet">Acquisitions</option>
                      <option value="purchasesOfInvestments"
                        >Purchase of Investments</option
                      >
                      <option value="salesMaturitiesOfInvestments"
                        >Sales Maturities Of Investments</option
                      >
                      <option value="otherInvestingActivites"
                        >Other Investing Acitivies</option
                      >
                      <option value="netCashUsedForInvestingActivites"
                        >Investing Cash Flow</option
                      >
                      <option value="debtRepayment">Debt Repayment</option>
                      <option value="commonStockRepurchased"
                        >Common Stock Repurchased</option
                      >
                      <option value="dividendsPaid">Dividend Paid</option>
                      <option value="otherFinancingActivites"
                        >Other Financial Acitivies</option
                      >
                      <option value="netCashUsedProvidedByFinancingActivities"
                        >Financial Cash Flow</option
                      >
                      <option value="netChangeInCash">Net Cash Flow</option>
                      <option value="freeCashFlow">Free Cash Flow</option>
                    </select>
                  </div>
                </div>

                <div class="app w-full">
                  <Chart {init} options={optionsData} class="chart" />
                </div>

                <div class="w-full overflow-x-scroll">
                  <table
                    class="table table-sm table-compact bg-table border border-gray-800 rounded-md w-full m-auto mt-4"
                  >
                    <thead class="bg-default">
                      <tr class="border-b border-gray-800">
                        <th
                          class="text-white font-semibold text-start text-sm sm:text-[1rem]"
                          >{filterRule === "annual"
                            ? "Fiscal Year End"
                            : "Quarter Ends"}</th
                        >
                        <th
                          class="text-white font-semibold text-end text-sm sm:text-[1rem]"
                          >{statementConfig?.find(
                            (item) => item?.propertyName === displayStatement,
                          )?.label}</th
                        >
                        <th
                          class="text-white font-semibold text-end text-sm sm:text-[1rem]"
                          >Change</th
                        >
                        <th
                          class="text-white font-semibold text-end text-sm sm:text-[1rem]"
                          >Growth</th
                        >
                      </tr>
                    </thead>
                    <tbody>
                      {#each tableList as item, index}
                        <!-- row -->
                        <tr class="odd:bg-odd border-b border-gray-800">
                          <td
                            class="text-white font-medium text-sm sm:text-[1rem] whitespace-nowrap"
                          >
                            {item?.date}
                          </td>

                          <td
                            class="text-white text-sm sm:text-[1rem] text-right whitespace-nowrap"
                          >
                            {@html abbreviateNumber(item?.value, false, true)}
                          </td>

                          <td
                            class="text-white text-sm sm:text-[1rem] whitespace-nowrap font-medium text-end"
                          >
                            {@html item?.value - tableList[index + 1]?.value !==
                            0
                              ? abbreviateNumber(
                                  (
                                    item?.value - tableList[index + 1]?.value
                                  )?.toFixed(2),
                                  false,
                                  true,
                                )
                              : "n/a"}
                          </td>

                          <td
                            class="text-white text-sm sm:text-[1rem] whitespace-nowrap font-medium text-end"
                          >
                            {#if index + 1 - tableList?.length === 0}
                              n/a
                            {:else if item?.value === 0 && tableList[index + 1]?.value < 0}
                              <span class="text-[#FF2F1F]">-100.00%</span>
                            {:else if item?.value === 0 && tableList[index + 1]?.value > 0}
                              <span class="text-[#00FC50]">100.00%</span>
                            {:else if item?.value - tableList[index + 1]?.value > 0}
                              <span class="text-[#00FC50]">
                                {(
                                  ((item?.value - tableList[index + 1]?.value) /
                                    Math.abs(item?.value)) *
                                  100
                                )?.toFixed(2)}%
                              </span>
                            {:else if item?.value - tableList[index + 1]?.value < 0}
                              <span class="text-[#FF2F1F]">
                                -{(
                                  Math?.abs(
                                    (tableList[index + 1]?.value -
                                      item?.value) /
                                      Math.abs(item?.value),
                                  ) * 100
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
                <div
                  class="w-full rounded-none sm:rounded-md m-auto overflow-x-auto"
                >
                  <table
                    class="table table-sm table-compact bg-table border border-gray-800 w-full"
                  >
                    <thead class="bg-default">
                      <tr class="text-white">
                        <td class="text-start text-white text-sm font-semibold"
                          >Year</td
                        >
                        {#each cashFlow as cash}
                          {#if filterRule === "annual"}
                            <td
                              class="bg-default font-semibold text-end text-sm"
                            >
                              {"FY" + cash?.calendarYear?.slice(-2)}
                            </td>
                          {:else}
                            <td
                              class="bg-default font-semibold text-end text-sm"
                            >
                              {"FY" +
                                cash?.calendarYear?.slice(-2) +
                                " " +
                                cash?.period}
                            </td>
                          {/if}
                        {/each}
                      </tr>
                    </thead>
                    <tbody>
                      <!-- row -->
                      <FinancialTable data={cashFlow} {fields} />
                    </tbody>
                  </table>
                </div>
              {/if}
            {/if}
          </div>
        </div>
      </main>
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
