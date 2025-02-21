<script lang="ts">
  import { Chart } from "svelte-echarts";
  import {
    displayCompanyName,
    stockTicker,
    coolMode,
    timeFrame,
  } from "$lib/store";
  import { abbreviateNumber } from "$lib/utils";
  import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
  import { Button } from "$lib/components/shadcn/button/index.js";
  //import * as XLSX from 'xlsx';
  import { goto } from "$app/navigation";
  import { init, use } from "echarts/core";
  import { LineChart, BarChart } from "echarts/charts";
  import { GridComponent, TooltipComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import Infobox from "$lib/components/Infobox.svelte";
  import FinancialTable from "$lib/components/FinancialTable.svelte";
  import SEO from "$lib/components/SEO.svelte";

  use([LineChart, BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

  export let data;

  let ratios = [];
  let fullStatement = [];
  let tableList = [];

  let filterRule = "annual";
  let optionsData;

  let displayStatement = "priceEarningsRatio";

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
      propertyName: "priceEarningsRatio",
      label: "PE Ratio",
      text: "The price-to-earnings (P/E) ratio is a valuation metric that shows how expensive a stock is relative to earnings.",
    },
    {
      propertyName: "priceEarningsToGrowthRatio",
      label: "PEG Ratio",
      text: "The price-to-earnings (P/E) ratio is a valuation metric that shows how expensive a stock is relative to earnings.",
    },
    {
      propertyName: "priceToSalesRatio",
      label: "PS Ratio",
      text: "The price-to-sales (P/S) ratio is a commonly used valuation metric. It shows how expensive a stock is compared to revenue.",
    },
    {
      propertyName: "priceToBookRatio",
      label: "PB Ratio",
      text: "The price-to-book (P/B) ratio measures a stock's price relative to book value. Book value is also called Shareholders' equity.",
    },
    {
      propertyName: "priceToFreeCashFlowsRatio",
      label: "P/FCF Ratio",
      text: "The price to free cash flow (P/FCF) ratio is similar to the P/E ratio, except it uses free cash flow instead of accounting earnings.",
    },
    {
      propertyName: "priceToOperatingCashFlowsRatio",
      label: "P/OCF Ratio",
      text: "The price to operating cash flow (P/OCF) ratio measures the price of a stock relative to operating cash flow.",
    },
    {
      propertyName: "operatingCashFlowSalesRatio",
      label: "OCF/S Ratio",
      text: "The operating cash flow to sales (OCF/S) Ratio assesses how well sales convert to cash. It's the operating cash flow divided by net sales, indicating cash efficiency.",
    },
    {
      propertyName: "debtEquityRatio",
      label: "Debt / Equity Ratio",
      text: "The debt-to-equity ratio measures a company's debt levels relative to its shareholders' equity or book value. A high ratio implies that a company has a lot of debt.",
    },
    {
      propertyName: "quickRatio",
      label: "Quick Ratio",
      text: "The quick ratio measure a company's short-term liquidity. A low number indicates that the company may have trouble paying its upcoming financial obligations.",
    },
    {
      propertyName: "currentRatio",
      label: "Current Ratio",
      text: "The current ratio is used to measure a company's short-term liquidity. A low number can indicate that a company will have trouble paying its upcoming liabilities.",
    },
    {
      propertyName: "assetTurnover",
      label: "Asset Turnover",
      text: "The asset turnover ratio measures the amount of sales relative to a company's assets. It indicates how efficiently the company uses its assets to generate revenue.",
    },
    {
      propertyName: "interestCoverage",
      label: "Interest Coverage",
      text: "The interest coverage ratio is a measure of the ability of a company to pay its interest expenses. It is calculated by dividing the company's Earnings Before Interest and Taxes (EBIT) by its interest expenses.",
    },
    {
      propertyName: "returnOnEquity",
      label: "Return on Equity (ROE)",
      text: `Return on equity (ROE) is a profitability metric that shows how efficient a company is at using its equity (or "net" assets) to generate profits. It is calculated by dividing the company's net income by the average shareholders' equity during the past 12 months.`,
    },
    {
      propertyName: "returnOnAssets",
      label: "Return on Assets (ROA)",
      text: `Return on assets (ROA) is a metric that measures how much profit a company is able to generate using its assets. It is calculated by dividing net income by the average total assets for the past 12 months.`,
    },
    {
      propertyName: "returnOnCapitalEmployed",
      label: "Return on Capital (ROIC)",
      text: `Return on invested capital (ROIC) measures how effective a company is at investing its capital in order to increase profits. It is calculated by dividing the NOPAT (Net Operating Profit After Tax) by the invested capital.`,
    },
    {
      propertyName: "dividendYield",
      label: "Dividend Yield",
      text: "The dividend yield is how much a stock pays in dividends each year, as a percentage of the stock price.",
    },
    {
      propertyName: "payoutRatio",
      label: "Payout Ratio",
      text: "The dividend payout ratio is the percentage of a company's profits that are paid out as dividends. A high ratio implies that the dividend payments may not be sustainable.",
    },
    {
      propertyName: "grossProfitMargin",
      label: "Gross Profit Margin",
      text: "Gross Profit Margin is the percentage of revenue left as gross profits, after subtracting cost of goods sold from the revenue.",
    },
    {
      propertyName: "netProfitMargin",
      label: "Net Profit Margin",
      text: "Net Profit Margin is the percentage of revenue left as net income, or profits, after subtracting all costs and expenses from the revenue.",
    },
    {
      propertyName: "pretaxProfitMargin",
      label: "Pretax Profit Margin",
      text: "Pretax margin is the percentage of revenue left as profits before subtracting taxes.",
    },
    {
      propertyName: "operatingProfitMargin",
      label: "Operating Profit Margin",
      text: "Operating margin is the percentage of revenue left as operating income, after subtracting cost of revenue and all operating expenses from the revenue.",
    },
    {
      propertyName: "freeCashFlowMargin",
      label: "FCF Margin",
      text: "FCF margin is the percentage of revenue left as free cash flow. FCF is calculated by subtracting capital expenditures (CapEx) from the operating cash flow (OCF). Both CapEx and OCF are shown on the cash flow statement.",
    },
    {
      propertyName: "ebitdaMargin",
      label: "EBITDA Margin",
      text: "EBITDA margin is the percentage of revenue left as EBITDA, after subtracting all expenses except interest, taxes, depreciation and amortization from revenue.",
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

    for (let i = ratios?.length - 1; i >= 0; i--) {
      const statement = ratios[i];
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
          `${filterRule === "annual" ? "_annual" : "_quarter"}_balance_sheet_statement.csv`;
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

  fullStatement = data?.getRatiosStatement;
  displayStatement = "priceEarningsRatio";

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

  $: {
    if ($timeFrame || displayStatement || activeIdx) {
      if (activeIdx === 0) {
        filterRule = "annual";
        fullStatement = data?.getRatiosStatement?.annual;
      } else {
        filterRule = "quarterly";
        fullStatement = data?.getRatiosStatement?.quarter;
      }
      ratios = filterStatement(fullStatement, $timeFrame);

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
    } else if (ratios?.length > 0) {
      return `
      <span>
        Discover comprehensive ratio statement breakdowns that reveal insights into revenue, expenses, and beyond.
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
  title={`${$displayCompanyName} (${$stockTicker}) Financial Ratios and Metrics · Stocknear`}
  description={`Financial ratios and metrics for ${$displayCompanyName} (${$stockTicker}). Includes annual, quarterly and trailing numbers with full history and charts.`}
/>

<section class="bg-default overflow-hidden text-white h-full">
  <div
    class="flex justify-center w-full m-auto h-full overflow-hidden mt-4 sm:mt-0"
  >
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
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
                Ratios {filterRule === "annual" ? "(Annual)" : "(Quarter)"}
              {/if}
            </h1>
          </div>

          <div class="grid grid-cols-1 gap-2">
            <Infobox text={htmlOutput} />
            {#if ratios?.length > 0}
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
                      <option disabled>Choose a Variable</option>
                      <option value="priceEarningsRatio" selected
                        >PE Ratio</option
                      >
                      <option value="priceEarningsToGrowthRatio" selected
                        >PEG Ratio</option
                      >
                      <option value="priceToSalesRatio">PS Ratio</option>
                      <option value="priceToBookRatio">PB Ratio</option>
                      <option value="priceToFreeCashFlowsRatio"
                        >P/FCF Ratio</option
                      >
                      <option value="priceToOperatingCashFlowsRatio"
                        >P/OCF Ratio</option
                      >
                      <option value="operatingCashFlowSalesRatio"
                        >OCF/S Ratio</option
                      >
                      <option value="debtEquityRatio"
                        >Debt / Equity Ratio</option
                      >
                      <option value="quickRatio">Quick Ratio</option>
                      <option value="currentRatio">Current Ratio</option>
                      <option value="assetTurnover">Asset Turnover</option>
                      <option value="interestCoverage">Interest Coverage</option
                      >
                      <option value="returnOnEquity"
                        >Return on Equity (ROE)</option
                      >
                      <option value="returnOnAssets"
                        >Return on Assets (ROA)</option
                      >
                      <option value="returnOnCapitalEmployed"
                        >Return on Capital (ROIC)</option
                      >
                      <option value="dividendYield">Dividend Yield</option>
                      <option value="payoutRatio">Payout Ratio</option>
                      <option value="grossProfitMargin"
                        >Gross Profit Margin</option
                      >
                      <option value="netProfitMargin">Net Profit Margin</option>
                      <option value="pretaxProfitMargin"
                        >Pretax Profit Margin</option
                      >
                      <option value="operatingProfitMargin"
                        >Operating Profit Margin</option
                      >
                      <option value="freeCashFlowMargin">FCF Margin</option>
                      <option value="ebitdaMargin">EBITDA Margin</option>
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
                        <td class="text-start text-sm font-semibold">Year</td>
                        {#each ratios as item}
                          {#if filterRule === "annual"}
                            <td
                              class="bg-default font-semibold text-end text-sm"
                            >
                              {"FY" + item?.calendarYear?.slice(-2)}
                            </td>
                          {:else}
                            <td
                              class="bg-default font-semibold text-end text-sm"
                            >
                              {"FY" +
                                item?.calendarYear?.slice(-2) +
                                " " +
                                item?.period}
                            </td>
                          {/if}
                        {/each}
                      </tr>
                    </thead>
                    <tbody>
                      <!-- row -->
                      <FinancialTable data={ratios} {fields} />
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
