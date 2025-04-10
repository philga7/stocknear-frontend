<script lang="ts">
  import { displayCompanyName, stockTicker } from "$lib/store";

  import SEO from "$lib/components/SEO.svelte";
  import FinancialSection from "$lib/components/FinancialSection.svelte";

  export let data;

  const statementConfig = [
    {
      propertyName: "priceToEarningsRatio",
      label: "PE Ratio",
      text: "The price-to-earnings (P/E) ratio is a valuation metric that shows how expensive a stock is relative to earnings.",
    },
    {
      propertyName: "priceToEarningsGrowthRatio",
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
      propertyName: "priceToFreeCashFlowRatio",
      label: "P/FCF Ratio",
      text: "The price to free cash flow (P/FCF) ratio is similar to the P/E ratio, except it uses free cash flow instead of accounting earnings.",
    },
    {
      propertyName: "priceToOperatingCashFlowRatio",
      label: "P/OCF Ratio",
      text: "The price to operating cash flow (P/OCF) ratio measures the price of a stock relative to operating cash flow.",
    },
    {
      propertyName: "operatingCashFlowSalesRatio",
      label: "OCF/S Ratio",
      text: "The operating cash flow to sales (OCF/S) Ratio assesses how well sales convert to cash. It's the operating cash flow divided by net sales, indicating cash efficiency.",
    },
    {
      propertyName: "debtToEquityRatio",
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
      propertyName: "interestCoverageRatio",
      label: "Interest Coverage",
      text: "The interest coverage ratio is a measure of the ability of a company to pay its interest expenses. It is calculated by dividing the company's Earnings Before Interest and Taxes (EBIT) by its interest expenses.",
    },
    {
      propertyName: "returnOnEquity",
      label: "Return on Equity",
      text: `Return on equity (ROE) is a profitability metric that shows how efficient a company is at using its equity (or "net" assets) to generate profits. It is calculated by dividing the company's net income by the average shareholders' equity during the past 12 months.`,
    },
    {
      propertyName: "returnOnAssets",
      label: "Return on Assets",
      text: `Return on assets (ROA) is a metric that measures how much profit a company is able to generate using its assets. It is calculated by dividing net income by the average total assets for the past 12 months.`,
    },
    {
      propertyName: "returnOnInvestedCapital",
      label: "Return on Invested Capital",
      text: `Return on invested capital (ROIC) measures how effective a company is at investing its capital in order to increase profits. It is calculated by dividing the NOPAT (Net Operating Profit After Tax) by the invested capital.`,
    },
    {
      propertyName: "dividendYield",
      label: "Dividend Yield",
      text: "The dividend yield is how much a stock pays in dividends each year, as a percentage of the stock price.",
    },
    {
      propertyName: "dividendPayoutRatio",
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
</script>

<SEO
  title={`${$displayCompanyName} (${$stockTicker}) Ratios and Metrics Statement`}
  description={`Financial ratios and valuation metrics for ${$displayCompanyName} (${$stockTicker}). Includes annual, quarterly and trailing numbers with history and charts.`}
/>

<FinancialSection {data} title="Ratios and Metrics" {statementConfig} />
