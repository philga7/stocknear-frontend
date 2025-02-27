<script lang="ts">
  import SEO from "$lib/components/SEO.svelte";
  import { getLastTradingDay } from "$lib/utils";
  import { page } from "$app/stores";

  import InfoModal from "$lib/components/InfoModal.svelte";

  export let data;
  const lastTradingDay = new Date(getLastTradingDay() ?? null)?.toLocaleString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
  const displayTitle = {
    active: "title Today",
    week: "Week title",
    month: "Month title",
    year: "1 Year title",
    "3Y": "3 Year title",
    "5Y": "5 Year title",
  };

  let timePeriod;

  let title = "Active";

  $: {
    const pathSegments = $page.url.pathname.split("/");
    timePeriod = pathSegments[pathSegments.length - 1];
  }
</script>

<SEO
  title={timePeriod === "active"
    ? `Today's Top Stock ${title}`
    : `Top Stock ${title} in the past ${timePeriod}`}
  description="A list of the stocks with the highest percentage gain, highest percentage loss and most active today. See stock price, volume, market cap and more."
/>

<section class="w-full overflow-hidden m-auto min-h-screen">
  <div class="flex justify-center w-full m-auto overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <main class="w-full">
        <!--Start Top Winners/active-->

        <nav class=" pt-1 overflow-x-auto whitespace-nowrap">
          <ul
            class="flex flex-row items-center w-full text-sm sm:text-[1rem] text-white"
          >
            <a
              href="/market-mover/active"
              class="p-2 px-5 cursor-pointer {timePeriod === 'active'
                ? 'text-white bg-primary sm:hover:bg-opacity-[0.95]'
                : 'text-gray-400 sm:hover:text-white sm:hover:bg-primary sm:hover:bg-opacity-[0.95]'}"
            >
              Today
            </a>
            <a
              href="/market-mover/active/week"
              class="p-2 px-5 cursor-pointer {timePeriod === 'week'
                ? 'text-white bg-primary sm:hover:bg-opacity-[0.95]'
                : 'text-gray-400 sm:hover:text-white sm:hover:bg-primary sm:hover:bg-opacity-[0.95]'}"
            >
              Week
            </a>
            <a
              href="/market-mover/active/month"
              class="p-2 px-5 cursor-pointer {timePeriod === 'month'
                ? 'text-white bg-primary sm:hover:bg-opacity-[0.95]'
                : 'text-gray-400 sm:hover:text-white sm:hover:bg-primary sm:hover:bg-opacity-[0.95]'}"
            >
              Month
            </a>
            <a
              href="/market-mover/active/year"
              class="p-2 px-5 cursor-pointer {timePeriod === 'year'
                ? 'text-white bg-primary sm:hover:bg-opacity-[0.95]'
                : 'text-gray-400 sm:hover:text-white sm:hover:bg-primary sm:hover:bg-opacity-[0.95]'}"
            >
              Year
            </a>
            <a
              href="/market-mover/active/3Y"
              class="p-2 px-5 cursor-pointer {timePeriod === '3Y'
                ? 'text-white bg-primary sm:hover:bg-opacity-[0.95]'
                : 'text-gray-400 sm:hover:text-white sm:hover:bg-primary sm:hover:bg-opacity-[0.95]'}"
            >
              3 Years
            </a>
            <a
              href="/market-mover/active/5Y"
              class="p-2 px-5 cursor-pointer {timePeriod === '5Y'
                ? 'text-white bg-primary sm:hover:bg-opacity-[0.95]'
                : 'text-gray-400 sm:hover:text-white sm:hover:bg-primary sm:hover:bg-opacity-[0.95]'}"
            >
              5 Years
            </a>
          </ul>
        </nav>

        <div
          class="flex flex-col justify-center items-center overflow-hidden mt-10"
        >
          <div class="controls groups w-full">
            <div
              class="title-group flex flex-row items-center justify-start mb-3"
            >
              <h1 class="text-white text-xl sm:text-2xl font-semibold">
                {displayTitle[timePeriod]?.replace("title", title)}
              </h1>
              {#if timePeriod === "1D" && ["active", "active"]?.includes(title)}
                <InfoModal
                  title={`${title} Today`}
                  content={`The stocks with the highest percentage ${title === "active" ? "gains" : "loss"} today, updated every two minutes during market open. Excludes stocks with a market cap under 10M and volume under 50K.`}
                  id={"marketmoverId"}
                />
              {/if}

              <div
                class="mb-0 ml-5 mt-1 whitespace-nowrap text-sm font-semiboldt text-white"
              >
                <span class="hidden lg:inline">Updated</span>
                {lastTradingDay}
              </div>
            </div>
          </div>
          <slot />
        </div>
      </main>
    </div>
  </div>
</section>
