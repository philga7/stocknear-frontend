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
  let displayStatement = "revenue";

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
      propertyName: "cashAndCashEquivalents",
      growthPropertyName: "growthCashAndCashEquivalents",
      label: "Cash & Equivalents",
      text: "Cash and equivalents is the amount of money on the company's accounts held as straight cash, or very liquid assets that can be sold for cash at a very short notice.",
    },
    {
      propertyName: "shortTermInvestments",
      growthPropertyName: "growthShortTermInvestments",
      label: "Short-Term Investments",
      text: "Short-term investments are liquid assets like treasury bills, short-term bonds, money-market funds, marketable securities and other investments that can be sold for cash at a short notice.",
    },
    {
      propertyName: "longTermInvestments",
      growthPropertyName: "growthLongTermInvestments",
      label: "Long-Term Investments",
      text: "Long-term investments are investments that the company plans to hold for more than one year. It can include stocks, bonds, real estate and others.",
    },
    {
      propertyName: "otherNonCurrentAssets",
      growthPropertyName: "growthOtherNonCurrentAssets",
      label: "Other Long-Term Assets",
      text: "Other long-term assets include all long-term assets that do not fit into any of the categories mentioned so far.",
    },
    {
      propertyName: "netReceivables",
      growthPropertyName: "growthNetReceivables",
      label: "Receivables",
      text: "Receivables are the money owed to the company for products or services that have been delivered but not yet paid for. If a customer buys something on credit, it is listed under receivables (as a current asset) on the balance sheet.",
    },
    {
      propertyName: "inventory",
      growthPropertyName: "growthInventory",
      label: "Inventory",
      text: "Inventory is the value of product that is available for sale, as well as the value of purchased raw materials for making goods that will be sold. It also includes goods that are currently being produced from raw materials.",
    },
    {
      propertyName: "otherCurrentAssets",
      growthPropertyName: "growthOtherCurrentAssets",
      label: "Other Current Assets",
      text: "Other current assets includes all current assets that do not fit into any of the categories mentioned so far.",
    },
    {
      propertyName: "totalCurrentAssets",
      growthPropertyName: "growthTotalCurrentAssets",
      label: "Total Current Assets",
      text: "Total current assets includes all current assets, including cash and equivalents, short-term investments, receivables, inventory and others. Current assets are things that easily be sold for cash or will be used within one year.",
    },
    {
      propertyName: "propertyPlantEquipmentNet",
      growthPropertyName: "growthPropertyPlantEquipmentNet",
      label: "Property-Plant & Equipment",
      text: "Property, Plant & Equipment are all long-term tangible or physical assets that are needed for business operations. It includes buildings, factories, machinery, furniture and others.",
    },
    {
      propertyName: "goodwillAndIntangibleAssets",
      growthPropertyName: "growthGoodwillAndIntangibleAssets",
      label: "Goodwill & Intangibles",
      text: "Includes goodwill and other assets that are intangible. Intangible assets are assets that provide some benefit for the company, but they are not physical assets that can be measured or counted. Examples include patents, intellectual property and copyrights.",
    },
    {
      propertyName: "totalNonCurrentAssets",
      growthPropertyName: "growthTotalNonCurrentAssets",
      label: "Total Long-Term Assets",
      text: "Total long-term assets includes all long-term assets, including Property-Plant & Equipment, goodwill, intangibles and others. Long-term (non-current) assets are things that can not be sold for cash easily or are considered to last for more than one year.",
    },
    {
      propertyName: "totalAssets",
      growthPropertyName: "growthTotalAssets",
      label: "Total Assets",
      text: "Total assets is the sum of all current and non-current assets on the balance sheet. Assets are everything that the company owns.",
    },
    {
      propertyName: "accountPayables",
      growthPropertyName: "growthAccountPayables",
      label: "Account Payables",
      text: "Accounts payable is the amount that the company owes to vendors and suppliers. The company has purchased products or services on credit, but has not paid for them yet.",
    },
    {
      propertyName: "deferredRevenue",
      growthPropertyName: "growthDeferredRevenue",
      label: "Deferred Revenue",
      text: "Deferred revenue includes payments that have been received in advance for products and services that have not yet been delivered. These revenues are listed as a liability on the company's balance sheet.",
    },
    {
      propertyName: "shortTermDebt",
      growthPropertyName: "growthShortTermDebt",
      label: "Short-Term Debt",
      text: "Current debt is company debt that needs to be paid within one year. It also includes the portion of long-term debt that is due within a year.",
    },
    {
      propertyName: "otherCurrentLiabilities",
      growthPropertyName: "growthOtherCurrentLiabilities",
      label: "Other Current Liabilities",
      text: "Other current liabilities are all current liabilities that do not fit into the categories above.",
    },
    {
      propertyName: "totalCurrentLiabilities",
      growthPropertyName: "growthTotalCurrentLiabilities",
      label: "Total Current Liabilities",
      text: "Total current liabilities are all financial obligations that the company owes and are due within one year. This includes accounts payable, deferred revenue, current debt and others.",
    },
    {
      propertyName: "longTermDebt",
      growthPropertyName: "growthLongTermDebt",
      label: "Long-Term Debt",
      text: "Long-term debt is debt that the company does not need to pay until after one year or more. It includes bank loans and bonds issued by the company.",
    },
    {
      propertyName: "otherNonCurrentLiabilities",
      growthPropertyName: "growthOtherNonCurrentLiabilities",
      label: "Other Long-Term Liabilities",
      text: "Other long-term liabilities are all long-term (non-current) liabilities that are not categorized as long-term debt.",
    },
    {
      propertyName: "totalNonCurrentLiabilities",
      growthPropertyName: "growthTotalNonCurrentLiabilities",
      label: "Total Long-Term Liabilities",
      text: "Total long-term liabilities are all long-term (non-current) financial obligations of the company, including long-term debt and others.",
    },
    {
      propertyName: "totalLiabilities",
      growthPropertyName: "growthTotalLiabilities",
      label: "Total Liabilities",
      text: "Total liabilities are all financial obligations of the company, including both current and long-term (non-current) liabilities. Liabilities are everything that the company owes.",
    },
    {
      propertyName: "totalDebt",
      growthPropertyName: "growthTotalDebt",
      label: "Total Debt",
      text: "Total debt is the total amount of liabilities categorized as debt on the balance sheet. It includes both current and long-term (non-current) debt.",
    },
    {
      propertyName: "commonStock",
      growthPropertyName: "growthCommonStock",
      label: "Common Stock",
      text: "Common stock is the par value of the company's outstanding common stock, multiplied by the par value. This information is not very useful as the par value is usually set as an arbitrary amount of one cent.",
    },
    {
      propertyName: "retainedEarnings",
      growthPropertyName: "growthRetainedEarnings",
      label: "Retained Earnings",
      text: "Retained earnings are net income previously earned that has not been paid out to shareholders as dividends. If retained earnings are negative, they can be listed as Accumulated Deficit instead.",
    },
    {
      propertyName: "accumulatedOtherComprehensiveIncomeLoss",
      growthPropertyName: "growthAccumulatedOtherComprehensiveIncomeLoss",
      label: "Comprehensive Income",
      text: "Comprehensive income includes unrealized gains and losses that do not fall under retained earnings.",
    },
    {
      propertyName: "totalStockholdersEquity",
      growthPropertyName: "growthTotalStockholdersEquity",
      label: "Shareholders Equity",
      text: "Shareholders’ equity is also called book value or net worth. It can be seen as the amount of money held by investors inside the company. It is calculated by subtracting all liabilities from all assets.",
    },
    {
      propertyName: "totalInvestments",
      growthPropertyName: "growthTotalInvestments",
      label: "Total Investments",
      text: "Total Investments encompass all a company's financial assets, such as stocks, bonds, and real estate, reflecting its financial health and growth potential. Calculated by summing up these asset values, it's a key indicator of a company's financial strength.",
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
  displayStatement = "revenue";

  const exportFundamentalData = (format = "csv") => {
    if (["Pro", "Plus"]?.includes(data?.user?.tier)) {
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
  title={`${$displayCompanyName} (${$stockTicker}) Balance Sheet`}
  description={`Detailed balance sheet for ${$displayCompanyName} (${$stockTicker}), including cash, debt, assets, liabilities, and book value.`}
/>

<section class=" w-full overflow-hidden h-full">
  <div class="w-full flex justify-center w-full sm-auto h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <main class="w-full">
        <div class="sm:pl-7 sm:pb-7 sm:pt-7 m-auto mt-2 sm:mt-0">
          <div
            class="mb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between"
          >
            <h1 class="text-xl sm:text-2xl font-bold">
              {removeCompanyStrings($displayCompanyName)} Balance Sheet Statement
            </h1>
            <div
              class="mt-3 sm:mt-0 mb-2 sm:mb-0 bg-gray-300 dark:bg-secondary w-full min-w-24 sm:w-fit relative flex flex-wrap items-center justify-center rounded-md p-1"
            >
              {#each tabs as item, i}
                {#if !["Pro", "Plus"]?.includes(data?.user?.tier) && i > 0}
                  <button
                    on:click={() => goto("/pricing")}
                    class="cursor-pointer group relative z-1 rounded-full w-1/2 min-w-24 md:w-auto px-5 py-1"
                  >
                    <span class="relative text-sm block font-semibold">
                      {item.title}
                      <svg
                        class="inline-block ml-0.5 -mt-1 w-3.5 h-3.5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        ><path
                          fill="currentColor"
                          d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                        /></svg
                      >
                    </span>
                  </button>
                {:else}
                  <button
                    on:click={() => (activeIdx = i)}
                    class="cursor-pointer group relative z-1 rounded-full w-1/2 min-w-24 md:w-auto px-5 py-1 {activeIdx ===
                    i
                      ? 'z-0'
                      : ''} "
                  >
                    {#if activeIdx === i}
                      <div class="absolute inset-0 rounded-md bg-[#fff]"></div>
                    {/if}
                    <span
                      class="relative text-sm block font-semibold whitespace-nowrap {activeIdx ===
                      i
                        ? 'text-black'
                        : ''}"
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
                    <span class="ml-2 text-sm"> Table Mode </span>
                  {:else}
                    <span class="ml-2 text-sm"> Chart Mode </span>
                  {/if}
                </label>

                <div class="flex flex-row items-center w-fit sm:ml-auto">
                  <div class="relative inline-block text-left grow">
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild let:builder>
                        <Button
                          builders={[builder]}
                          class="shadow-sm w-full border-gray-300 dark:border-gray-600 border sm:hover:bg-gray-100 dark:sm:hover:bg-primary ease-out  flex flex-row justify-between items-center px-3 py-2  rounded-md truncate"
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
                    class="shadow-sm ml-2 w-fit border-gray-300 dark:border-gray-600 border  sm:hover:bg-gray-100 dark:sm:hover:bg-primary ease-out flex flex-row justify-between items-center px-3 py-2  rounded-md truncate"
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
                    class="table table-sm table-compact no-scrollbar rounded-none sm:rounded-md w-full bg-white dark:bg-table border border-gray-300 dark:border-gray-800 m-auto"
                  >
                    <thead class="text-muted dark:text-white dark:bg-default">
                      <tr class="">
                        <td class="text-start text-sm font-semibold pr-10"
                          >Year</td
                        >
                        {#each financialData as cash}
                          {#if filterRule === "annual"}
                            <td class=" font-semibold text-sm text-end">
                              {"FY" + cash?.calendarYear?.slice(-2)}
                            </td>
                          {:else}
                            <td class=" font-semibold text-sm text-end">
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
    </div>
  </div>
</section>
