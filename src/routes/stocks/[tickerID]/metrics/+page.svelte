<script lang="ts">
  import { displayCompanyName, stockTicker } from "$lib/store";
  import { removeCompanyStrings } from "$lib/utils";
  import Infobox from "$lib/components/Infobox.svelte";
  import SEO from "$lib/components/SEO.svelte";
  import MetricTable from "$lib/components/Table/MetricTable.svelte";

  export let data;

  const names = data?.getBusinessMetrics?.revenue?.names || [];

  const subsectionTitles = ["Overview", ...names];

  const sectionMap = Object.fromEntries(
    subsectionTitles?.map((title) => {
      const key = title
        ?.toLowerCase()
        ?.replace(/&/g, "") // Remove & symbol
        ?.replace(/\s+/g, "-") // Replace spaces with dash
        ?.replace(/-{2,}/g, "-") // Replace multiple dashes with single dash
        ?.replace(/^-|-$/g, "") // Remove leading/trailing dashes
        ?.trim();
      return [key, key === "overview" ? "" : key];
    }),
  );
  const dataset = data?.getBusinessMetrics?.revenue?.history || [];
  const geographicDataset = data?.getBusinessMetrics?.geographic?.history || [];
  const operatingExpensesDataset =
    data?.getBusinessMetrics?.operatingExpenses?.history || [];

  const revenueNames = data?.getBusinessMetrics?.revenue?.names || [];
  const geographicNames = data?.getBusinessMetrics?.geographic?.names || [];
  const operatingExpensesNames =
    data?.getBusinessMetrics?.operatingExpenses?.names || [];

  const xData = dataset?.map((item) => item?.date);
  const geographicXData = geographicDataset?.map((item) => item?.date);
  const operatingExpensesXData = operatingExpensesDataset?.map(
    (item) => item?.date,
  );

  const categoryValues = revenueNames?.map((_, index) =>
    dataset?.map((item) => item.value[index]),
  );
  const geographiCategoryValues = geographicNames?.map((_, index) =>
    geographicDataset?.map((item) => item.value[index]),
  );
  const operatingExpensesCategoryValues = operatingExpensesNames?.map(
    (_, index) => operatingExpensesDataset?.map((item) => item.value[index]),
  );

  const growthValues = revenueNames?.map((_, index) =>
    dataset?.map((item) => item.valueGrowth[index]),
  );
  const geographicGrowthValues = geographicNames?.map((_, index) =>
    geographicDataset?.map((item) => item.valueGrowth[index]),
  );
  const operatingExpensesGrowthValues = operatingExpensesNames?.map(
    (_, index) =>
      operatingExpensesDataset?.map((item) => item.valueGrowth[index]),
  );

  function getHref(title) {
    const key = title?.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-");
    const path =
      key === "overview" ? "/metrics" : `/metrics/${sectionMap[key]}`;
    return `/stocks/${$stockTicker}${path}`;
  }
</script>

<SEO
  title={`${$displayCompanyName} (${$stockTicker}) Business Metric Overview`}
  description={`View unique business metrics for ${displayCompanyName} (${$stockTicker}) stock, including revenue breakdown, operating income, revenue by geography.`}
/>

<section class=" overflow-hidden min-h-screen w-full">
  <div class="flex justify-center m-auto h-full overflow-hidden w-full">
    <div
      class="relative flex justify-center items-center overflow-hidden w-full"
    >
      <div class="sm:pl-7 sm:pb-7 w-full m-auto mt-2 sm:mt-0">
        {#if revenueNames?.length !== 0 || geographicNames?.length !== 0}
          {#if revenueNames?.length}
            <MetricTable
              title="{removeCompanyStrings(
                $displayCompanyName,
              )} Revenue Breakdown"
              dateData={xData}
              names={revenueNames}
              {categoryValues}
              {growthValues}
              {getHref}
            />
          {/if}

          {#if geographicNames?.length}
            <MetricTable
              title="Revenue by Geography"
              dateData={geographicXData}
              names={geographicNames}
              categoryValues={geographiCategoryValues}
              growthValues={geographicGrowthValues}
            />
          {/if}

          {#if operatingExpensesNames?.length}
            <MetricTable
              title="Operating Expense Breakdown"
              dateData={operatingExpensesXData}
              names={operatingExpensesNames}
              categoryValues={operatingExpensesCategoryValues}
              growthValues={operatingExpensesGrowthValues}
            />
          {/if}
        {:else}
          <Infobox
            text={`Currently, there are no business metrics available for ${removeCompanyStrings($displayCompanyName)}.`}
          />
        {/if}
      </div>
    </div>
  </div>
</section>
