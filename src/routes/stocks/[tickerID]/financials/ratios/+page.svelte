<script lang="ts">
  import {
    displayCompanyName,
    stockTicker,
    coolMode,
    timeFrame,
  } from "$lib/store";
  import { removeCompanyStrings } from "$lib/utils";
  import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
  import { Button } from "$lib/components/shadcn/button/index.js";
  //import * as XLSX from 'xlsx';
  import FinancialTable from "$lib/components/FinancialTable.svelte";
  import FinancialChart from "$lib/components/FinancialChart.svelte";
  import { goto } from "$app/navigation";
  import SEO from "$lib/components/SEO.svelte";

  export let data;

  let isLoaded = true;
  let tableList = [];
  let processedData = {};

  let financialData = [];
  let fullStatement = [];
  let filterRule = "annual";

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

  fullStatement = data?.getData;

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
          `${filterRule === "annual" ? "_annual" : "_quarter"}_cash_flow_statement.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } else {
      goto("/pricing");
    }
  };

  // Pre-process all data once instead of in each component
  function preprocessFinancialData() {
    processedData = {};

    // Precompute mapping from propertyName to config for quick lookup
    const configMap = {};
    statementConfig.forEach((item) => {
      if (item && item.propertyName) {
        configMap[item.propertyName] = item;
      }
    });

    const xList = [];
    for (let i = financialData.length - 1; i >= 0; i--) {
      const statement = financialData[i];
      const year = statement.calendarYear.slice(-2);
      const quarter = statement.period;
      xList.push(
        filterRule === "annual" ? "FY" + year : "FY" + year + " " + quarter,
      );
    }

    // Process each field using precomputed config and xList
    fields.forEach((field) => {
      const statementKey = field.key;
      const config = configMap[statementKey];
      if (!config) return;

      const valueList = [];
      // Loop through financialData in reverse to match xList order
      for (let i = financialData.length - 1; i >= 0; i--) {
        const statement = financialData[i];
        const rawValue = Number(statement[config.propertyName]);
        // Round to two decimals
        const value = parseFloat(rawValue.toFixed(2));
        valueList.push(value);
      }

      processedData[statementKey] = {
        xList, // re-use the precomputed labels
        valueList,
        labelName: config.label,
      };
    });

    // Build tableList once for all charts and sort by date (newest first)
    tableList = financialData.map((statement) => ({
      date: statement.date,
      // Add more properties if needed
    }));

    tableList.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  $: {
    if ($timeFrame || activeIdx) {
      if (activeIdx === 0) {
        filterRule = "annual";
        fullStatement = data?.getData?.annual;
      } else {
        filterRule = "quarterly";
        fullStatement = data?.getData?.quarter;
      }
      financialData = filterStatement(fullStatement, $timeFrame);
      preprocessFinancialData();
    }
  }
</script>

<SEO
  title={`${$displayCompanyName} (${$stockTicker}) Cash Flow Statement`}
  description={`Detailed cash flow statements for ${$displayCompanyName} (${$stockTicker}), including operating cash flow, capex and free cash flow.`}
/>

<section class="bg-default w-full overflow-hidden text-white h-full">
  <div
    class="w-full flex justify-center w-full sm-auto h-full overflow-hidden mt-4 sm:mt-0"
  >
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      {#if isLoaded}
        <main class="w-full">
          <div class="sm:pl-7 sm:pb-7 sm:pt-7 m-auto mt-2 sm:mt-0">
            <div
              class="mb-3 flex flex-col sm:flex-row items-center justify-between"
            >
              <h1 class="text-xl sm:text-2xl text-white font-bold">
                {removeCompanyStrings($displayCompanyName)} Ratios Statement
              </h1>
              <div
                class="mt-3 sm:mt-0 mb-2 sm:mb-0 bg-secondary w-full min-w-24 sm:w-fit relative flex flex-wrap items-center justify-center rounded-md p-1"
              >
                {#each tabs as item, i}
                  {#if data?.user?.tier !== "Pro" && i > 0}
                    <button
                      on:click={() => goto("/pricing")}
                      class="group relative z-1 rounded-full w-1/2 min-w-24 md:w-auto px-5 py-1"
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
                      class="group relative z-1 rounded-full w-1/2 min-w-24 md:w-auto px-5 py-1 {activeIdx ===
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

            <div class="grid grid-cols-1 gap-2">
              {#if financialData?.length > 0}
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
                        Chart Mode
                      </span>
                    {:else}
                      <span class="ml-2 text-sm font-medium text-white">
                        Table Mode
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
                            <span class="truncate text-white">{$timeFrame}</span
                            >
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
                  <div class="grid gap-5 xs:gap-6 lg:grid-cols-3 lg:gap-3">
                    {#each fields as item, i}
                      <FinancialChart
                        data={financialData}
                        {statementConfig}
                        displayStatement={item?.key}
                        {filterRule}
                        {processedData}
                        color={["#ff00cc", "#37ff00", "#0c63e7", "#07c8f9"][
                          i % 4
                        ]}
                      />
                    {/each}
                  </div>
                {:else}
                  <div
                    class="w-full rounded-none sm:rounded-md m-auto overflow-x-auto no-scrollbar"
                  >
                    <table
                      class="table table-sm bg-table border border-gray-800 table-compact w-full"
                    >
                      <thead class="bg-default">
                        <tr class="text-white">
                          <td
                            class="text-start bg-default text-white text-sm font-semibold pr-10"
                            >Year</td
                          >
                          {#each financialData as cash}
                            {#if filterRule === "annual"}
                              <td
                                class="bg-default font-semibold text-sm text-end"
                              >
                                {"FY" + cash?.calendarYear?.slice(-2)}
                              </td>
                            {:else}
                              <td
                                class="bg-default font-semibold text-sm text-end"
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
                        <FinancialTable data={financialData} {fields} />
                      </tbody>
                    </table>
                  </div>
                {/if}
              {/if}
            </div>
          </div>
        </main>
      {:else}
        <div class="w-full flex justify-center items-center h-80">
          <div class="relative">
            <label
              class="bg-secondary rounded-md h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <span class="loading loading-spinner loading-md text-gray-400"
              ></span>
            </label>
          </div>
        </div>
      {/if}
    </div>
  </div>
</section>
