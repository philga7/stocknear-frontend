<script lang="ts">
  import { stockTicker } from "$lib/store";
  import { sectorNavigation } from "$lib/utils";
  export let data;

  let info;

  let sector = "n/a";
  let industry = "n/a";
  let exchange = "n/a";
  let employees = "n/a";
  let description = "";
  let website = "n/a";
  let snippet;

  let buyCount = 0;
  let holdCount = 0;
  let sellCount = 0;
  let priceTarget = "n/a";
  let numOfAnalyst = 0;
  let consensusRating = "n/a";
  let changesPercentage = 0;
  let ipoDate = "n/a";

  function getIndustryHref(industryName) {
    // Replace spaces with hyphens
    let formattedName = industryName?.replace(/ /g, "-");
    // Replace "&" with "and"
    formattedName = formattedName?.replace(/&/g, "and");
    // Remove any extra hyphens (e.g., from consecutive spaces)
    formattedName = formattedName?.replace(/-{2,}/g, "-");
    // Convert to lowercase for consistency
    return "/list/industry/" + formattedName?.toLowerCase();
  }

  $: {
    if ($stockTicker) {
      info = data?.getStockDeck;
      ipoDate =
        info?.ipoDate !== null && info?.ipoDate?.length > 0
          ? new Date(info?.ipoDate)?.toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              daySuffix: "2-digit",
            })
          : "n/a";

      //ceoName = info?.ceoName?.length !== 0 ? getAbbreviatedName(info?.ceoName) : "-";
      sector = info?.sector ?? "n/a";
      industry = info?.industry ?? "n/a";
      exchange = info?.exchange;
      employees = info?.fullTimeEmployees ?? "n/a";
      //country = info?.country ?? "n/a";
      description =
        info?.description ??
        "A detailed description of the company is not yet available.";
      website = info?.website;
      snippet = description?.slice(0, 450) + "...";

      numOfAnalyst = data?.getAnalystSummary?.numOfAnalyst;
      buyCount = ((data?.getAnalystSummary?.Buy / numOfAnalyst) * 100)?.toFixed(
        2,
      );
      holdCount = (
        (data?.getAnalystSummary?.Hold / numOfAnalyst) *
        100
      )?.toFixed(2);
      sellCount = (
        (data?.getAnalystSummary?.Sell / numOfAnalyst) *
        100
      )?.toFixed(2);
      priceTarget =
        data?.getAnalystSummary?.medianPriceTarget !== ("n/a" && 0)
          ? data?.getAnalystSummary?.medianPriceTarget
          : "n/a";
      consensusRating = data?.getAnalystSummary?.consensusRating;

      try {
        changesPercentage =
          ((priceTarget / data?.getStockQuote?.price - 1) * 100)?.toFixed(2) ??
          0;
      } catch (e) {
        changesPercentage = 0;
      }
    }
  }
</script>

<div class="space-y-3">
  <div class="h-auto w-full">
    <!--Start Content-->
    <div class="w-auto lg:w-full flex flex-col m-auto">
      <h2 class="mb-2 text-2xl text-white font-semibold">
        About {$stockTicker}
      </h2>
      <p class="text-gray-200">
        {snippet}
      </p>
      <div class="inline-block">
        <a
          href={`/stocks/${$stockTicker}/profile`}
          class="w-full text-md mt-1 cursor-pointer font-medium sm:hover:text-white text-blue-400 sm:hover:underline"
        >
          [Show more]
        </a>
      </div>

      <div class="mt-3 grid grid-cols-2 gap-3 w-full">
        <div class="col-span-1 text-gray-200">
          <span class="block font-semibold">Industry</span>
          <a
            href={getIndustryHref(industry)}
            class="sm:hover:text-blue-400 text-white underline underline-offset-4"
            >{industry}</a
          >
        </div>
        <div class="col-span-1 text-gray-200">
          <span class="block font-semibold">Sector</span>
          <a
            href={sectorNavigation?.find((item) => item?.title === sector)
              ?.link}
            class="sm:hover:text-blue-400 text-white underline underline-offset-4"
            >{sector}</a
          >
        </div>
        <div class="col-span-1 text-gray-200">
          <span class="block font-semibold">IPO Date</span>
          <span>{ipoDate}</span>
        </div>
        <div class="col-span-1 text-gray-200">
          <span class="block font-semibold">Employees</span>
          <a
            href={`/stocks/${$stockTicker}/profile/employees`}
            class="sm:hover:text-blue-400 text-white underline underline-offset-4"
            >{new Intl.NumberFormat("en")?.format(employees)}</a
          >
        </div>
        <div class="col-span-1 text-gray-200">
          <span class="block font-semibold">Stock Exchange</span>
          <span>{exchange}</span>
        </div>
        <div class="col-span-1 text-gray-200">
          <span class="block font-semibold">Ticker Symbol</span>
          <span>{$stockTicker}</span>
        </div>
        {#if website}
          <div class="col-span-1 whitespace-nowrap text-gray-200">
            <span class="block font-semibold">Website</span>
            <a
              href={website}
              class="hover:sm:text-white truncate text-blue-400"
              target="_blank">{website}</a
            >
          </div>
        {/if}
      </div>
      <a
        href={`/stocks/${$stockTicker}/profile`}
        class="rounded cursor-pointer w-full m-auto py-2 h-full mt-6 text-lg text-center font-semibold text-black sm:hover:hover:bg-gray-300 bg-[#ffff] transition duration-100"
      >
        Full Company Profile
      </a>
    </div>
  </div>
</div>

{#if Object?.keys(data?.getAnalystSummary ?? {})?.length !== 0}
  <div
    class="space-y-3 pt-10 sm:pt-5 {Object?.keys(data?.getAnalystSummary ?? {})
      ?.length !== 0
      ? ''
      : 'hidden'}"
  >
    <div class="h-auto w-full">
      <!--Start Content-->
      <div class="w-auto lg:w-full flex flex-col m-auto pb-10">
        <h2 class="mb-2 text-2xl text-white font-semibold">Analyst Forecast</h2>
        <p class="text-gray-200">
          According to {numOfAnalyst} analyst ratings, the average rating for {$stockTicker}
          stock is "{consensusRating}." The 12-month stock price forecast is ${priceTarget},
          which is {changesPercentage > 0 ? "an increase" : "a decrease"} of {changesPercentage}%
          from the latest price.
        </p>

        <div class="mt-5 w-full m-auto flex justify-center items-center mb-5">
          <div class="flex flex-col items-center w-full">
            <!--Start Progress-->

            <div class="flex flex-col items-center w-full">
              <div class="flex flex-row items-center w-full mt-5 mb-2">
                <span class="text-white font-medium text-start mr-auto">
                  Buy
                </span>
                <span class="text-white text-md font-medium ml-auto">
                  {buyCount}%
                </span>
              </div>
              <progress
                class="progress bg-[#3B3D3F] w-full [&::-webkit-progress-value]:bg-[#00FC50] [&::-moz-progress-bar]:bg-[#00FC50]"
                value={buyCount}
                max="100"
              ></progress>
            </div>

            <div class="flex flex-col items-center w-full">
              <div class="flex flex-row items-center w-full mt-5 mb-2">
                <span class="text-white font-medium text-start mr-auto">
                  Hold
                </span>
                <span class="text-white text-md font-medium ml-auto">
                  {holdCount}%
                </span>
              </div>
              <progress
                class="progress bg-[#3B3D3F] w-full [&::-webkit-progress-value]:bg-[#fff] [&::-moz-progress-bar]:bg-[#fff]"
                value={holdCount}
                max="100"
              ></progress>
            </div>

            <div class="flex flex-col items-center w-full">
              <div class="flex flex-row items-center w-full mt-5 mb-2">
                <span class="text-white font-medium text-start mr-auto">
                  Sell
                </span>
                <span class="text-white text-md font-medium ml-auto">
                  {sellCount}%
                </span>
              </div>
              <progress
                class="progress bg-[#3B3D3F] w-full [&::-webkit-progress-value]:bg-[#FF2F1F] [&::-moz-progress-bar]:bg-[#FF2F1F]"
                value={sellCount}
                max="100"
              ></progress>
            </div>

            <!--End Progress-->
          </div>
        </div>

        <a
          href={`/stocks/${$stockTicker}/forecast/analyst`}
          class="rounded cursor-pointer w-full m-auto py-2 h-full mt-6 text-lg text-center font-semibold text-black sm:hover:hover:bg-gray-300 bg-[#ffff] transition duration-100"
        >
          Stock Forecasts
        </a>
      </div>
    </div>
  </div>
{/if}
