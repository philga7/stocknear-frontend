<script lang="ts">
  import { Chart } from "svelte-echarts";
  import {
    numberOfUnreadNotification,
    coolMode,
    timeFrame,
    displayCompanyName,
    stockTicker,
  } from "$lib/store";
  import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
  import { Button } from "$lib/components/shadcn/button/index.js";
  import { abbreviateNumber } from "$lib/utils";
  import { goto } from "$app/navigation";
  //import * as XLSX from 'xlsx';
  import FinancialTable from "$lib/components/FinancialTable.svelte";

  import { init, use } from "echarts/core";
  import { LineChart, BarChart } from "echarts/charts";
  import { GridComponent, TooltipComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import Infobox from "$lib/components/Infobox.svelte";
  import SEO from "$lib/components/SEO.svelte";

  use([LineChart, BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

  export let data;

  let balanceSheet = [];
  let fullStatement = [];
  let tableList = [];
  let filterRule = "annual";
  let optionsData;

  let displayStatement = "cashAndCashEquivalents";

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

  function changeStatement(event) {
    displayStatement = event.target.value;
  }

  function normalizer(value) {
    if (Math?.abs(value) >= 1e18) {
      return { unit: "Q", denominator: 1e18 };
    } else if (Math?.abs(value) >= 1e12) {
      return { unit: "T", denominator: 1e12 };
    } else if (Math?.abs(value) >= 1e9) {
      return { unit: "B", denominator: 1e9 };
    } else if (Math?.abs(value) >= 1e6) {
      return { unit: "M", denominator: 1e6 };
    } else if (Math?.abs(value) >= 1e5) {
      return { unit: "K", denominator: 1e5 };
    } else {
      return { unit: "", denominator: 1 };
    }
  }

  function plotData() {
    let labelName = "-";
    let xList = [];
    let valueList = [];
    tableList = [];

    const index = statementConfig?.findIndex(
      (item) => item?.propertyName === displayStatement,
    );

    for (let i = balanceSheet?.length - 1; i >= 0; i--) {
      const statement = balanceSheet[i];
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

    const { unit, denominator } = normalizer(Math.max(...valueList) ?? 0);

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

  fullStatement = data?.getBalanceSheetStatement;
  displayStatement = "cashAndCashEquivalents";

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
        fullStatement = data?.getBalanceSheetStatement?.annual;
      } else {
        filterRule = "quarterly";
        fullStatement = data?.getBalanceSheetStatement?.quarter;
      }
      balanceSheet = filterStatement(fullStatement, $timeFrame);

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
    } else if (balanceSheet?.length > 0) {
      return `
      <span>
        Get detailed breakdowns of the balance-sheet with total debts, total investments, and much more.
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
  title={`${$displayCompanyName} (${$stockTicker}) Balance Sheet · Stocknear`}
  description={`Detailed balance sheet for ${$displayCompanyName} (${$stockTicker}), including cash, debt, assets, liabilities, and book value.`}
/>

<section class="bg-default overflow-hidden text-white h-full w-full">
  <div
    class="flex justify-center w-full m-auto h-full overflow-hidden mt-4 sm:mt-0"
  >
    <div
      class="relative flex justify-center items-center overflow-hidden w-full"
    >
      <main class="w-full">
        <div class="sm:pl-7 sm:pb-7 sm:pt-7 m-auto mt-2 sm:mt-0">
          <div class="mb-3">
            <h1 class="text-xl sm:text-2xl text-white font-bold">
              {#if $coolMode}
                {statementConfig?.find(
                  (item) => item?.propertyName === displayStatement,
                )?.label}
              {:else}
                Balance Sheet {filterRule === "annual"
                  ? "(Annual)"
                  : "(Quarter)"}
              {/if}
            </h1>
          </div>

          <div class="grid grid-cols-1 gap-2">
            <Infobox text={htmlOutput} />
            {#if balanceSheet?.length > 0}
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
                class="mb-6 sm:mb-3 flex flex-row items-center w-full justify-end sm:justify-center mt-3 sm:mt-0"
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
                      class="w-40 select select-bordered select-sm p-0 pl-5 overflow-y-auto bg-secondary"
                      on:change={changeStatement}
                    >
                      <option disabled>Choose an Income Variable</option>
                      <option value="cashAndCashEquivalents" selected
                        >Cash & Equivalents</option
                      >
                      <option value="shortTermInvestments"
                        >Short-Term Investments</option
                      >
                      <option value="longTermInvestments"
                        >Long-Term Investments</option
                      >
                      <option value="otherNonCurrentAssets"
                        >Other Long-Term Assets</option
                      >
                      <option value="netReceivables">Receivables</option>
                      <option value="inventory">Inventory</option>
                      <option value="otherCurrentAssets"
                        >Other Current Assets</option
                      >
                      <option value="totalCurrentAssets"
                        >Total Current Assets</option
                      >
                      <option value="propertyPlantEquipmentNet"
                        >Property, Plant & Equipment</option
                      >
                      <option value="goodwillAndIntangibleAssets"
                        >Goodwill & Intangibles</option
                      >
                      <option value="totalNonCurrentAssets"
                        >Total Long-Term Assets</option
                      >
                      <option value="totalAssets">Total Assets</option>
                      <option value="accountPayables">Account Payables</option>
                      <option value="deferredRevenue">Deferred Revenue</option>
                      <option value="shortTermDebt">Short-Term Debt</option>
                      <option value="otherCurrentLiabilities"
                        >Other Current Liabilities</option
                      >
                      <option value="totalCurrentLiabilities"
                        >Total Current Liabilities</option
                      >
                      <option value="longTermDebt">Long-Term Debt</option>
                      <option value="otherNonCurrentLiabilities"
                        >Other Long-Term Liabilities</option
                      >
                      <option value="totalNonCurrentLiabilities"
                        >Total Long-Term Liabilities</option
                      >
                      <option value="totalLiabilities">Total Liabilities</option
                      >
                      <option value="totalDebt">Total Debt</option>
                      <option value="commonStock">Common Stock</option>
                      <option value="retainedEarnings">Retained Earnigns</option
                      >
                      <option value="accumulatedOtherComprehensiveIncomeLoss"
                        >Comprehensive Income</option
                      >
                      <option value="totalStockholdersEquity"
                        >Shareholders' Equity</option
                      >
                      <option value="totalInvestments">Total Investments</option
                      >
                    </select>
                  </div>
                </div>

                <div class="app w-full">
                  <Chart {init} options={optionsData} class="chart" />
                </div>

                <h2 class="mt-5 text-2xl text-gray-200 font-semibold">
                  {statementConfig?.find(
                    (item) => item?.propertyName === displayStatement,
                  )?.label} History
                </h2>

                <div class="w-full overflow-x-scroll">
                  <table
                    class="table table-sm table-compact bg-table border border-gray-800 rounded-md w-full m-auto mt-4"
                  >
                    <thead class="bg-default">
                      <tr>
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
                        <td
                          class="text-start bg-default text-white text-sm font-semibold pr-10"
                          >Year</td
                        >
                        {#each balanceSheet as cash}
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
                      <FinancialTable data={balanceSheet} {fields} />
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
