<script lang="ts">
  import {
    displayCompanyName,
    stockTicker,
    coolMode,
    timeFrame,
    selectedTimePeriod,
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

  let tableList = [];
  let processedData = {};

  let financialData = [];
  let fullStatement = [];

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
      propertyName: "otherInvestingActivities",
      growthPropertyName: "growthOtherInvestingActivites",
      label: "Other Investing Acitivies",
      text: "Other investing activities are investing activities that do not belong to any of the categories we mentioned so far.",
    },
    {
      propertyName: "netCashProvidedByInvestingActivities",
      growthPropertyName: "growthNetCashUsedForInvestingActivites",
      label: "Investing Cash Flow",
      text: "Investing cash flow is the total change in cash from buying and selling investments and long-term assets.",
    },
    {
      propertyName: "netDebtIssuance",
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
      propertyName: "netDividendsPaid",
      growthPropertyName: "growthDividendsPaid",
      label: "Dividend Paid",
      text: "The total amount paid out as cash dividends to shareholders.",
    },
    {
      propertyName: "otherFinancingActivities",
      growthPropertyName: "growthOtherFinancingActivities",
      label: "Other Financial Acitivies",
      text: "Other financial activities includes miscellaneous financial transactions beyond regular operations that impact a company's cash flow.",
    },
    {
      propertyName: "netCashProvidedByFinancingActivities",
      growthPropertyName: "growthNetCashProvidedByFinancingActivities",
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

  const getCurrentYear = () => new Date()?.getFullYear();

  const filterStatement = (fullStatement, timeFrame) => {
    const currentYear = getCurrentYear();

    switch (timeFrame) {
      case "5Y":
        return fullStatement?.filter(
          (item) => currentYear - parseInt(item?.fiscalYear) < 5,
        );
      case "10Y":
        return fullStatement?.filter(
          (item) => currentYear - parseInt(item?.fiscalYear) < 10,
        );
      default:
        return fullStatement;
    }
  };

  fullStatement = data?.getData;

  const exportFundamentalData = (format = "csv") => {
    if (["Pro", "Plus"]?.includes(data?.user?.tier)) {
      const data = fullStatement;
      if (!data || data.length === 0) {
        return;
      }

      let properties = [
        {
          key: $selectedTimePeriod === "annual" ? "fiscalYear" : "date",
          label: $selectedTimePeriod === "annual" ? "Year" : "Quarter",
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
          `${$selectedTimePeriod === "annual" ? "_annual" : $selectedTimePeriod === "quarterly" ? "_quarter" : "_ttm"}_cash_flow_statement.csv`;
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

    // Precompute xList from income (reverse order)
    const xList = [];
    for (let i = financialData.length - 1; i >= 0; i--) {
      const statement = financialData[i];
      const year = statement.fiscalYear.slice(-2);
      const quarter = statement.period;
      xList.push(
        $selectedTimePeriod === "annual"
          ? "FY" + year
          : "FY" + year + " " + quarter,
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
    tableList = financialData?.map((statement) => ({
      date: statement.date,
      // Add more properties if needed
    }));

    tableList.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  $: {
    if ($timeFrame || $selectedTimePeriod) {
      if ($selectedTimePeriod === "annual") {
        fullStatement = data?.getData?.annual;
      } else if ($selectedTimePeriod === "quarterly") {
        fullStatement = data?.getData?.quarter;
      } else if ($selectedTimePeriod === "ttm") {
        fullStatement = data?.getData?.ttm;
      } else {
        fullStatement = data?.getData?.annual;
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

<section class=" w-full overflow-hidden h-full">
  <div class="w-full flex justify-center w-full sm-auto h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <main class="w-full">
        <div class="sm:pl-7 sm:pb-7 sm:pt-7 m-auto mt-2 sm:mt-0">
          <div
            class="mb-3 sm:mb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between"
          >
            <h1 class="text-xl sm:text-2xl font-bold">
              {removeCompanyStrings($displayCompanyName)} Income Statement
            </h1>
            <label class="inline-flex sm:hidden mt-4 cursor-pointer relative">
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
                <span class="ml-2 text-sm"> Table Mode </span>
              {:else}
                <span class="ml-2 text-sm"> Chart Mode </span>
              {/if}
            </label>
          </div>

          <div class="grid grid-cols-1 gap-2">
            {#if financialData?.length > 0}
              <div
                class="flex flex-col sm:flex-row items-start sm:items-end sm:justify-between"
              >
                <span
                  class="text-xs sm:text-sm order-1 sm:order-0 mt-5 sm:mt-0 text-gray-600 dark:text-gray-400 w-full"
                >
                  Financials in {financialData?.at(0)?.reportedCurrency}. Fiscal
                  year is
                  {data?.getProfileData?.fiscalYearRange}.
                </span>
                <div class="flex flex-row items-center justify-end w-full">
                  <label
                    class="hidden sm:inline-flex ml-auto mt-2 sm:mt-0 cursor-pointer relative"
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
                      <span class="ml-2 text-sm"> Table Mode </span>
                    {:else}
                      <span class="ml-2 text-sm"> Chart Mode </span>
                    {/if}
                  </label>
                  <div class="ml-auto sm:ml-5 relative inline-block">
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild let:builder>
                        <Button
                          builders={[builder]}
                          class="shadow-sm w-full sm:w-fit border-gray-300 dark:border-gray-600 border sm:hover:bg-gray-100 dark:sm:hover:bg-primary ease-out  flex flex-row justify-between items-center px-3 py-1.5  rounded-md truncate"
                        >
                          <span class="truncate">{$timeFrame}</span>
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
                        <DropdownMenu.Label
                          class="text-muted dark:text-gray-400"
                        >
                          Select time frame
                        </DropdownMenu.Label>
                        <DropdownMenu.Separator />
                        <DropdownMenu.Group>
                          <DropdownMenu.Item
                            on:click={() => ($timeFrame = "5Y")}
                            class="cursor-pointer sm:hover:bg-gray-300 dark:sm:hover:bg-primary"
                          >
                            5 years
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            on:click={() => ($timeFrame = "10Y")}
                            class="cursor-pointer sm:hover:bg-gray-300 dark:sm:hover:bg-primary"
                          >
                            10 years
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            on:click={() => ($timeFrame = "MAX")}
                            class="cursor-pointer sm:hover:bg-gray-300 dark:sm:hover:bg-primary"
                          >
                            Max
                          </DropdownMenu.Item>
                        </DropdownMenu.Group>
                      </DropdownMenu.Content>
                    </DropdownMenu.Root>
                  </div>

                  <Button
                    on:click={() => exportFundamentalData("csv")}
                    class="shadow-sm ml-2 w-fit border-gray-300 dark:border-gray-600 border  sm:hover:bg-gray-100 dark:sm:hover:bg-primary ease-out flex flex-row justify-between items-center px-3 py-1.5  rounded-md truncate"
                  >
                    <span class="truncate">Download</span>
                    <svg
                      class="{['Pro', 'Plus']?.includes(data?.user?.tier)
                        ? 'hidden'
                        : ''} ml-1 -mt-0.5 w-3.5 h-3.5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      ><path
                        fill="currentColor"
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
                      filterRule={$selectedTimePeriod}
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
                    class="table table-sm table-compact no-scrollbar rounded-none sm:rounded-md w-full border border-gray-300 dark:border-gray-800 m-auto"
                  >
                    <thead class="text-muted dark:text-white dark:bg-default">
                      <tr class="border min-w-[250px]">
                        <td class="text-start text-sm font-semibold pr-10"
                          >Fiscal Year</td
                        >
                        {#each financialData as item}
                          {#if $selectedTimePeriod === "annual"}
                            <td
                              class="min-w-[130px] font-semibold text-sm text-end border-l border-gray-300 dark:border-gray-800"
                            >
                              {"FY" + " " + item?.fiscalYear}
                            </td>
                          {:else}
                            <td
                              class="min-w-[130px] font-semibold text-sm text-end"
                            >
                              {item?.period + " " + item?.fiscalYear}
                            </td>
                          {/if}
                        {/each}
                      </tr>
                      <tr class="border min-w-[250px]">
                        <td class="text-start text-sm font-semibold"
                          >Period Ending</td
                        >
                        {#each financialData as item}
                          <td
                            class=" font-semibold text-sm text-end border-l border-gray-300 dark:border-gray-800"
                          >
                            {new Date(item?.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
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
    </div>
  </div>
</section>
