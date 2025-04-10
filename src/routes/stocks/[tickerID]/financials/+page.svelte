<script lang="ts">
  import { displayCompanyName, stockTicker } from "$lib/store";

  import SEO from "$lib/components/SEO.svelte";
  import FinancialSection from "$lib/components/FinancialSection.svelte";

  export let data;

  const statementConfig = [
    {
      propertyName: "revenue",
      label: "Revenue",
    },
    {
      propertyName: "costOfRevenue",
      label: "Cost of Revenue",
    },
    {
      propertyName: "grossProfit",
      label: "Gross Profit",
    },
    {
      propertyName: "operatingIncome",
      label: "Operating Income",
    },
    {
      propertyName: "interestIncome",
      label: "Interest Income",
    },
    {
      propertyName: "incomeBeforeTax",
      label: "Pretax Income",
    },
    {
      propertyName: "netIncome",
      label: "Net Income",
    },
    {
      propertyName: "sellingGeneralAndAdministrativeExpenses",
      label: "Selling & General & Admin",
    },
    {
      propertyName: "researchAndDevelopmentExpenses",
      label: "Research & Development",
    },
    {
      propertyName: "otherExpenses",
      label: "Other Expenses",
    },
    {
      propertyName: "operatingExpenses",
      label: "Operating Expenses",
    },
    {
      propertyName: "interestExpense",
      label: "Interest Expense",
    },
    {
      propertyName: "sellingAndMarketingExpenses",
      label: "Selling & Marketing Expenses",
    },
    {
      propertyName: "costAndExpenses",
      label: "Cost & Expenses",
    },
    {
      propertyName: "incomeTaxExpense",
      label: "Income Tax Expense",
    },
    {
      propertyName: "weightedAverageShsOut",
      label: "Shares Outstanding (Basic)",
    },
    {
      propertyName: "weightedAverageShsOutDil",
      label: "Shares Outstanding (Diluted)",
    },
    {
      propertyName: "eps",
      growthPropertyName: "growthEPS",
      label: "EPS (Basic)",
    },
    {
      propertyName: "epsDiluted",
      label: "EPS (Diluted)",
    },
    {
      propertyName: "ebitda",
      label: "EBITDA",
    },
    {
      propertyName: "ebit",
      label: "EBIT",
    },
    {
      propertyName: "depreciationAndAmortization",
      label: "Depreciation & Amortization",
    },
  ];
</script>

<SEO
  title={`${$displayCompanyName} (${$stockTicker}) Financials - Income Statement`}
  description={`Detailed annual, quarterly and trailing income statement for ${$displayCompanyName} (${$stockTicker}). See many years of revenue, expenses and profits or losses.`}
/>

<FinancialSection {data} title="Income Statement" {statementConfig} />
