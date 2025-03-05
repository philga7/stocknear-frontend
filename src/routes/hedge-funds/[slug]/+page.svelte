<script lang="ts">
  import { formatString, sectorNavigation, abbreviateNumber } from "$lib/utils";
  import Table from "$lib/components/Table/Table.svelte";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";
  import SEO from "$lib/components/SEO.svelte";

  import defaultAvatar from "$lib/images/hedge-fund-avatar.png";

  export let data;

  let hedgeFundStats = data?.getHedgeFundsData;
  let companyName = data?.getHedgeFundsData?.name ?? "Company Data";

  const excludedRules = new Set([
    "sharesNumber",
    "changeInSharesNumberPercentage",
    "marketValue",
    "avgPricePaid",
    "weight",
    "price",
    "changesPercentage",
  ]);

  const defaultList = [
    { name: "Price", rule: "price" },
    { name: "% Change", rule: "changesPercentage" },
    { name: "Shares", rule: "sharesNumber" },
    { name: "% Change Shares", rule: "changeInSharesNumberPercentage" },
    { name: "Market Value", rule: "marketValue" },
    { name: "Avg. Price Paid", rule: "avgPricePaid" },
    { name: "% Weight", rule: "weight" },
  ];

  const specificRows = [
    { name: "Shares", rule: "sharesNumber", type: "int" },
    {
      name: "% Change Shares",
      rule: "changeInSharesNumberPercentage",
      type: "percentSign",
    },
    { name: "% Weight", rule: "weight", type: "percent" },
    { name: "Avg. Price Paid", rule: "avgPricePaid", type: "float" },
    { name: "Market Value", rule: "marketValue", type: "int" },
  ];
</script>

<SEO
  title="Top Wall Street hedge funds"
  description="A list of the top Wall Street hedge funds, ranked by their success rate and average return per rating."
/>

<section
  class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden min-h-screen pt-5 px-4 lg:px-3 pb-40"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li><a href="/hedge-funds" class="text-gray-300">Hedge Fund</a></li>

      <li class="text-gray-300">{formatString(companyName)}</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full">
          <div class="w-full m-auto mt-12">
            <div class="items-center justify-between lg:flex">
              <div
                class="flex space-x-3 border-b-[2px] border-below-title pb-3 lg:border-none lg:pb-0"
              >
                <div
                  class=" sm:-mt-3 shadow-lg rounded-full border border-slate-600 w-14 h-14 sm:w-20 sm:h-20 relative hedge-fund-striped bg-[#20202E] flex items-center justify-center"
                >
                  <img
                    style="clip-path: circle(50%);"
                    class="rounded-full w-10 sm:w-16"
                    src={defaultAvatar}
                    loading="lazy"
                  />
                </div>

                <div class="mt-0 pt-0.5 text-left">
                  <h1 class="mb-0 text-2xl font-bold text-white">
                    {formatString(companyName)}
                  </h1>
                  <p class="mb-0.5 text-sm font-semibold text-gray-300">
                    CIK Number: {data?.getHedgeFundsData?.cik}
                  </p>
                </div>
              </div>
              <div
                class="mt-4 grid grid-cols-2 overflow-hidden rounded border border-gray-600 py-2 text-center md:grid-cols-5 md:p-0 lg:mt-0 lg:border-none"
              >
                <div class="flex flex-col px-4 py-2 bp:px-6 md:py-6">
                  <div class="text-2xl font-bold tracking-tight text-white">
                    {abbreviateNumber(hedgeFundStats?.marketValue)}
                  </div>
                  <div class="text-sm font-semibold leading-6 text-gray-300">
                    Market Value
                  </div>
                </div>

                <div
                  class="flex flex-col px-4 py-2 bp:px-6 sm:border-l sm:border-gray-600 md:py-6"
                >
                  <div class="text-2xl font-semibold tracking-tight text-white">
                    {data?.getHedgeFundsData?.holdings?.length?.toLocaleString(
                      "en-US",
                    )}
                  </div>
                  <div class="text-sm font-semibold leading-6 text-gray-300">
                    # of Holdings
                  </div>
                </div>
                <div
                  class="flex flex-col px-4 py-2 bp:px-6 sm:border-l sm:border-gray-600 md:py-6"
                >
                  <div class="text-2xl font-bold tracking-tight text-white">
                    {hedgeFundStats?.averageHoldingPeriod} months
                  </div>
                  <div class="text-sm font-semibold leading-6 text-gray-300">
                    Avg. Holding Period
                  </div>
                </div>

                <div
                  class="flex flex-col px-4 py-2 bp:px-6 sm:border-l sm:border-gray-600 md:py-6"
                >
                  <div class="text-2xl font-bold tracking-tight">
                    <span
                      class={hedgeFundStats?.winRate >= 0
                        ? "before:content-['+'] text-[#36D984]"
                        : "text-[#EF4444]"}
                      >{hedgeFundStats?.winRate?.toFixed(2)}%</span
                    >
                  </div>
                  <div class="text-sm font-semibold leading-6 text-gray-300">
                    Win Rate
                  </div>
                </div>
                <div
                  class="flex flex-col px-4 py-2 bp:px-6 sm:border-l sm:border-gray-600 md:py-6"
                >
                  <div class="text-2xl font-bold tracking-tight text-white">
                    <span
                      class={hedgeFundStats?.performancePercentage3Year >= 0
                        ? "before:content-['+'] text-[#36D984]"
                        : "text-[#EF4444]"}
                      >{hedgeFundStats?.performancePercentage3Year?.toFixed(
                        2,
                      )}%</span
                    >
                  </div>
                  <div class="text-sm font-semibold leading-6 text-gray-300">
                    Peformance 3-Years
                  </div>
                </div>
              </div>
            </div>

            <div class="mb-10 mt-10 text-white">
              <div
                class="relative my-3 space-y-2 rounded border border-gray-600 sm:my-6 p-4"
              >
                <div class="flex flex-col sm:flex-row">
                  <div class="mb-2 font-semibold sm:mb-0">Main Sectors:</div>
                  <div class="flex flex-wrap gap-x-2 gap-y-3 sm:ml-2">
                    {#each data?.getHedgeFundsData?.mainSectors as item}
                      <a
                        href={sectorNavigation?.find(
                          (listItem) => listItem?.title === item,
                        )?.link}
                        class="px-3 text-sm py-1 sm:text-[1rem] rounded-md bg-white/10 sm:hover:bg-white/20 ml-0"
                      >
                        {item}
                      </a>
                    {/each}
                  </div>
                </div>
                <div class="flex flex-col sm:flex-row">
                  <div class="mb-2 whitespace-nowrap font-semibold sm:mb-0">
                    Top Industries:
                  </div>
                  <div class="flex flex-wrap gap-x-2 gap-y-3 sm:ml-2">
                    {#each data?.getHedgeFundsData?.mainIndustries as item}
                      <a
                        href={`/list/industry/${item?.replace(/ /g, "-")?.replace(/&/g, "and")?.replace(/-{2,}/g, "-")?.toLowerCase()}`}
                        class="px-3 text-sm py-1 sm:text-[1rem] rounded-md bg-white/10 sm:hover:bg-white/20 ml-0"
                      >
                        {item}
                      </a>
                    {/each}
                  </div>
                </div>
              </div>
            </div>

            <div class="w-full m-auto mt-10">
              <Table
                {data}
                rawData={data?.user?.tier === "Pro"
                  ? data?.getHedgeFundsData?.holdings
                  : data?.getHedgeFundsData?.holdings?.slice(0, 5)}
                {excludedRules}
                {defaultList}
                {specificRows}
                hideLastRow={true}
              />
              <UpgradeToPro {data} />
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</section>

<style>
  .hedge-fund-striped {
    background-image: repeating-linear-gradient(
      -45deg,
      #a77120,
      #a77120 10px,
      #90621c 10px,
      #90621c 20px
    );
  }
</style>
