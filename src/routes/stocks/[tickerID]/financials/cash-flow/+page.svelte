<script lang="ts">
  import { displayCompanyName, stockTicker } from "$lib/store";

  import SEO from "$lib/components/SEO.svelte";
  import FinancialSection from "$lib/components/FinancialSection.svelte";

  export let data;

  const statementConfig = [
    {
      propertyName: "netIncome",
      label: "Net Income",
      text: "Net income is a company's accounting profits after subtracting all costs and expenses from the revenue. It is also called earnings, profits.",
    },
    {
      propertyName: "depreciationAndAmortization",
      label: "Depreciation & Amortization",
      text: "Depreciation and amortization are accounting methods for calculating how the value of a business's assets change over time. Depreciation refers to physical assets, while amortization refers to intangible assets.",
    },
    {
      propertyName: "stockBasedCompensation",
      label: "Stock-Based Compensation",
      text: "Stock-based compensation is the value of stocks issued for the purpose of compensating the executives and employees of a company.",
    },
    {
      propertyName: "otherWorkingCapital",
      label: "Other Working Capital",
      text: "Other working capital represents miscellaneous changes in short-term assets and liabilities that don't have specific categories, affecting the company's available cash.",
    },
    {
      propertyName: "otherNonCashItems",
      label: "Other Non-Cash Items",
      text: "Other Non-Cash Items refers to non-cash transactions or adjustments that impact the company's financial performance but don't involve actual cash flows. These can include items like depreciation, amortization, or changes in the fair value of investments.",
    },
    {
      propertyName: "deferredIncomeTax",
      label: "Deferred Income Tax",
      text: "Deferred income tax refers to future tax liabilities or assets resulting from differences in how a company reports income for tax purposes versus financial reporting. It represents the amount of income tax that will be paid or saved in the future due to these differences.",
    },
    {
      propertyName: "changeInWorkingCapital",
      label: "Change in Working Capital",
      text: "Change in working capital is the difference between a company's short-term assets and liabilities over a specific period, reflecting how much cash flow is impacted by these changes.",
    },
    {
      propertyName: "netCashProvidedByOperatingActivities",
      label: "Operating Cash Flow",
      text: "Operating cash flow, also called cash flow from operating activities, measures the amount of cash that a company generates from normal business activities. It is the amount of cash left after all cash income has been received, and all cash expenses have been paid.",
    },
    {
      propertyName: "capitalExpenditure",
      label: "Capital Expenditures",
      text: "Capital expenditures are also called payments for property, plants and equipment. It measures cash spent on long-term assets that will be used to run the business, such as manufacturing equipment, real estate and others.",
    },
    {
      propertyName: "acquisitionsNet",
      label: "Cash Acquisitions",
      text: "The amount of cash spent on acquiring other businesses.",
    },
    {
      propertyName: "purchasesOfInvestments",
      label: "Purchase of Investments",
      text: "Purchase of Investments refers to the acquisition of financial assets like stocks or bonds by a company, typically for investment purposes. It represents an outflow of cash used to buy these investments.",
    },
    {
      propertyName: "salesMaturitiesOfInvestments",
      label: "Sales Maturities Of Investments",
      text: "Sales Maturities of Investments signifies the selling or maturity of financial assets like stocks or bonds by a company. It represents an inflow of cash resulting from these investment activities.",
    },
    {
      propertyName: "otherInvestingActivities",
      label: "Other Investing Acitivies",
      text: "Other investing activities are investing activities that do not belong to any of the categories we mentioned so far.",
    },
    {
      propertyName: "netCashProvidedByInvestingActivities",
      label: "Investing Cash Flow",
      text: "Investing cash flow is the total change in cash from buying and selling investments and long-term assets.",
    },
    {
      propertyName: "netDebtIssuance",
      label: "Debt Repayment",
      text: "Debt Repayment is the process of paying off loans or debt obligations. It represents an outflow of cash as the company reduces its outstanding debt.",
    },
    {
      propertyName: "commonStockRepurchased",
      label: "Common Stock Repurchased",
      text: "The cash gained from issuing shares, or cash spent on repurchasing shares via share buybacks. A positive number implies that the company issued more shares than it repurchased. A negative number implies that the company bought back shares.",
    },
    {
      propertyName: "netDividendsPaid",
      label: "Dividend Paid",
      text: "The total amount paid out as cash dividends to shareholders.",
    },
    {
      propertyName: "otherFinancingActivities",
      label: "Other Financial Acitivies",
      text: "Other financial activities includes miscellaneous financial transactions beyond regular operations that impact a company's cash flow.",
    },
    {
      propertyName: "netCashProvidedByFinancingActivities",
      label: "Financial Cash Flow",
      text: "Financing cash flow is the total change in cash through financing activities. This includes dividend payments, share issuance and repurchases, changes in debt levels and others.",
    },
    {
      propertyName: "netChangeInCash",
      label: "Net Cash Flow",
      text: "Net cash flow is the sum of the operating, investing and financing cash flow numbers. It is the change in cash and equivalents on the company's balance sheet during the accounting period. It is often shown as increase/decrease in cash and equivalents on the cash flow statement.",
    },
    {
      propertyName: "freeCashFlow",
      label: "Free Cash Flow",
      text: "Free cash flow is the cash remaining after the company spends on everything required to maintain and grow the business. It is calculated by subtracting capital expenditures from operating cash flow.",
    },
  ];
</script>

<SEO
  title={`${$displayCompanyName} (${$stockTicker}) Cash Flow Statement`}
  description={`Detailed cash flow statements for ${$displayCompanyName} (${$stockTicker}), including operating cash flow, capex and free cash flow.`}
/>

<FinancialSection {data} title="Cash Flow Statement" {statementConfig} />
