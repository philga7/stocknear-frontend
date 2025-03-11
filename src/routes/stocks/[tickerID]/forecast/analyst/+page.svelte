<script lang="ts">
  import { displayCompanyName, screenWidth, stockTicker } from "$lib/store";
  import InfoModal from "$lib/components/InfoModal.svelte";
  import { onMount } from "svelte";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";
  import { goto } from "$app/navigation";
  import Infobox from "$lib/components/Infobox.svelte";
  import SEO from "$lib/components/SEO.svelte";
  import { removeCompanyStrings } from "$lib/utils";
  export let data;

  let analystRating = data?.getAnalystSummary ?? {};

  let rawData = data?.getAnalystTickerHistory ?? [];
  let historyList = [];
  let priceTarget = "n/a";
  let numOfAnalyst = "n/a";
  let consensusRating = "n/a";
  let changesPercentage = "n/a";

  const tabs = [
    {
      title: "All Analysts",
    },
    {
      title: "Top Analysts",
    },
  ];

  let activeIdx = 0;
  function changeTab(index) {
    activeIdx = index;

    if (Object?.keys(analystRating)?.length !== 0) {
      numOfAnalyst = analystRating?.numOfAnalyst;
      priceTarget =
        analystRating?.medianPriceTarget !== ("n/a" && 0)
          ? analystRating?.medianPriceTarget
          : "-";
      consensusRating = analystRating?.consensusRating;
      changesPercentage =
        analystRating?.medianPriceTarget !== "n/a" &&
        analystRating?.medianPriceTarget !== null &&
        analystRating?.medianPriceTarget !== undefined &&
        data?.getStockQuote?.price !== null
          ? (
              (analystRating.medianPriceTarget / data.getStockQuote.price - 1) *
              100
            )?.toFixed(2)
          : "-";
    }

    function filterLatestEntries(data) {
      const latestEntries = {};

      data?.forEach((entry) => {
        try {
          // Create a unique key by combining 'analyst' and 'name'
          const key = `${entry.analyst}-${entry.name}`;

          // Convert date and time to a Date object
          const dateTimeStr = `${entry.date}`;
          const dateTime = new Date(dateTimeStr);

          // Check if this entry is the latest for the given key
          if (!latestEntries[key] || dateTime > latestEntries[key].dateTime) {
            latestEntries[key] = { dateTime, entry };
          }
        } catch (e) {
          console.error(`Error processing entry: ${e}`);
        }
      });

      // Return only the latest entries
      return Object?.values(latestEntries)?.map(({ entry }) => entry);
    }

    const now = new Date();
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    rawData =
      data?.getAnalystTickerHistory?.filter(
        (item) => item?.analystScore >= 4,
      ) ?? [];
    rawData = filterLatestEntries(rawData);

    if (activeIdx === 1) {
      const recentData = rawData
        ?.filter((item) => {
          const date = new Date(item?.date);
          return date >= oneYearAgo;
        })
        ?.slice(0, 30); //Consider only the last 30 ratings in the last 12 months

      const filteredAnalystCount = recentData?.length ?? "n/a";
      const priceTargets = recentData
        ?.map((item) => parseFloat(item.adjusted_pt_current))
        ?.filter((pt) => !isNaN(pt));
      const medianPriceTarget = priceTargets?.length
        ? priceTargets?.sort((a, b) => a - b)[
            Math.floor(priceTargets?.length / 2)
          ]
        : "n/a";

      numOfAnalyst = filteredAnalystCount === 0 ? "n/a" : filteredAnalystCount;
      priceTarget = medianPriceTarget;
      changesPercentage =
        medianPriceTarget !== "-" && data?.getStockQuote?.price != null
          ? ((medianPriceTarget / data?.getStockQuote.price - 1) * 100).toFixed(
              2,
            )
          : "n/a";

      // Consensus rating calculation based on rating_current
      const ratingScores = {
        "Strong Buy": 5,
        Buy: 4,
        Hold: 3,
        Sell: 2,
        "Strong Sell": 1,
      };

      const totalRatingScore = recentData
        ?.map((item) => ratingScores[item.rating_current] || 0)
        ?.reduce((sum, score) => sum + score, 0);

      const averageRatingScore = filteredAnalystCount
        ? totalRatingScore / filteredAnalystCount
        : 0;

      consensusRating =
        averageRatingScore >= 4.5
          ? "Strong Buy"
          : averageRatingScore >= 3.5
            ? "Buy"
            : averageRatingScore >= 2.5
              ? "Hold"
              : averageRatingScore >= 1.5
                ? "Sell"
                : averageRatingScore >= 1
                  ? "Strong Sell"
                  : "n/a";

      rawData = recentData;
      historyList = rawData.slice(0, 50);
    } else {
      rawData = data?.getAnalystTickerHistory;
      historyList = rawData.slice(0, 50);
    }
  }

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;
    if (isBottom && historyList?.length !== rawData?.length) {
      const nextIndex = historyList?.length;
      const filteredNewResults = rawData?.slice(nextIndex, nextIndex + 50);
      historyList = [...historyList, ...filteredNewResults];
    }
  }

  function latestInfoDate(inputDate) {
    // Convert the input date string to milliseconds since epoch
    const inputDateMs = Date?.parse(inputDate);

    // Get today's date in milliseconds since epoch
    const todayMs = Date?.now();

    // Calculate the difference in milliseconds
    const differenceInMs = todayMs - inputDateMs;

    // Convert milliseconds to days
    const differenceInDays = Math?.floor(
      differenceInMs / (1000 * 60 * 60 * 24),
    );

    // Return the difference in days
    return differenceInDays <= 4;
  }

  changeTab(0);

  onMount(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  $: charNumber = $screenWidth < 640 ? 20 : 30;
</script>

<SEO
  title={`${$displayCompanyName} (${$stockTicker}) Analyst Ratings · Stocknear`}
  description={`A list of analyst ratings for ${$displayCompanyName} (${$stockTicker})} stock. See upgrades, downgrades, price targets and more from top Wall Street stock analysts.`}
/>

<section class=" overflow-hidden h-full min-h-screen mb-40 sm:mb-0 w-full">
  <div class="flex justify-center m-auto h-full overflow-hidden w-full">
    <div
      class="relative flex justify-center items-center overflow-hidden w-full"
    >
      <div class="sm:pl-4 sm:pt-4 w-full m-auto mt-2 sm:mt-0">
        <div class="mb-4">
          <div
            class="mb-5 flex flex-col justify-between gap-y-2.5 sm:mb-2 sm:flex-row sm:items-end"
          >
            <h1 class="mb-px text-xl font-bold sm:text-2xl sm:pl-1">
              {removeCompanyStrings($displayCompanyName)} Analyst Ratings
            </h1>
            <div>
              <div class="pr-4 hidden justify-end md:flex">
                <InfoModal
                  title={"Top Analysts"}
                  content={"Filter for analysts rated 4+ stars focusing on their win rate and average return per rating. Analysts with 4+ stars typically exhibit both high accuracy and high return per rating."}
                  id={"topAnalystsInfo"}
                />
              </div>
              <div
                class="inline-flex justify-center w-full rounded-md sm:w-auto"
              >
                <div
                  class="bg-gray-300 dark:bg-secondary w-full sm:w-fit relative flex flex-wrap items-center justify-center rounded-md p-1 mt-4"
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
                        on:click={() => changeTab(i)}
                        class="cursor-pointer group relative z-1 rounded-full w-1/2 min-w-24 md:w-auto px-5 py-1 {activeIdx ===
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
                            : ''}"
                        >
                          {item.title}
                        </span>
                      </button>
                    {/if}
                  {/each}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          class="mb-4 grid grid-cols-2 grid-rows-2 divide-contrast rounded-md border border-gray-300 dark:border-gray-600 md:grid-cols-4 md:grid-rows-1 md:divide-x"
        >
          <div
            class="p-4 bp:p-5 sm:p-6 border-r border-gray-300 dark:border-gray-600"
          >
            <div class="text-[1rem] font-normal">Total Analysts</div>

            <div
              class="mt-1 break-words font-semibold leading-8 text-xl sm:text-2xl"
            >
              {numOfAnalyst}
            </div>
          </div>
          <div
            class="p-4 bp:p-5 sm:p-6 border-r-0 md:border-r border-gray-300 dark:border-gray-600"
          >
            <div class="text-[1rem] font-normal">Consensus Rating</div>
            <div
              class="mt-1 break-words font-semibold leading-8 text-xl sm:text-2xl"
            >
              {consensusRating}
            </div>
          </div>
          <div
            class="p-4 bp:p-5 sm:p-6 border-r-0 md:border-r border-t md:border-t-0 border-gray-300 dark:border-gray-600"
          >
            <div class="text-[1rem] font-normal">Price Target</div>
            <div
              class="mt-1 break-words font-semibold leading-8 text-xl sm:text-2xl"
            >
              {priceTarget !== null && priceTarget !== undefined
                ? priceTarget
                : "n/a"}
            </div>
          </div>
          <div
            class="p-4 bp:p-5 sm:p-6 border-t border-gray-300 dark:border-gray-600 md:border-0 border-l border-gray-300 dark:border-gray-600 md:border-0"
          >
            <div class="text-[1rem] font-normal">Upside</div>
            <div
              class="mt-1 break-words font-semibold leading-8 text-xl sm:text-2xl {changesPercentage >=
              0
                ? "before:content-['+'] after:content-['%'] text-green-600 dark:text-[#00FC50]"
                : changesPercentage < 0
                  ? "after:content-['%'] text-red-600 dark:text-[#FF2F1F]"
                  : ''}"
            >
              {changesPercentage}
            </div>
          </div>
        </div>

        {#if rawData?.length !== 0}
          {#if activeIdx === 1}
            <Infobox
              text="Considering only the latest rating within the past 12 months from each unique analyst with a 4-star or higher rating."
            />
          {/if}

          <div
            class="mt-10 mb-2 items-center justify-between py-0 md:mt-8 md:flex md:py-2"
          >
            <div class="flex justify-between md:block">
              <h3 class="text-xl sm:text-2xl font-bold">Ratings History</h3>
            </div>
          </div>

          <div class=" w-full m-auto mb-4 overflow-x-auto lg:overflow-hidden">
            <table
              class="table table-sm table-compact no-scrollbar rounded-none sm:rounded-md w-full bg-white dark:bg-table border border-gray-300 dark:border-gray-800 m-auto"
            >
              <thead class="text-muted dark:text-white dark:bg-default">
                <tr>
                  <td class=" font-semibold text-sm text-start">Analyst</td>
                  <td class=" font-semibold text-sm text-start">Firm</td>
                  <td class=" font-semibold text-sm text-end">Rating</td>
                  <td class=" font-semibold text-sm text-end">Action</td>
                  <td class=" font-semibold text-sm text-end">Price Target</td>

                  <td class=" font-semibold text-sm text-end">Date</td>
                </tr>
              </thead>
              <tbody>
                {#each ["Pro", "Plus"]?.includes(data?.user?.tier) ? historyList : historyList?.slice(0, 3) as item, index}
                  <tr
                    class=" {latestInfoDate(item?.date)
                      ? 'bg-blue-100 dark:bg-[#F9AB00]/10  shadow'
                      : 'dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd'}  {index +
                      1 ===
                      historyList?.slice(0, 3)?.length &&
                    !['Pro', 'Plus']?.includes(data?.user?.tier)
                      ? 'opacity-[0.1]'
                      : ''}"
                  >
                    <td
                      class="text-sm sm:text-[1rem] whitespace-nowrap text-start"
                    >
                      <div class="flex flex-col items-start">
                        <a
                          href={item?.analystId !== null
                            ? `/analysts/${item?.analystId}`
                            : "#"}
                          class="font-semibold dark:font-normal text-blue-500 sm:hover:text-muted dark:sm:hover: dark:text-blue-400"
                          >{item?.analyst_name}
                        </a>

                        <div class="flex flex-row items-center mt-1">
                          {#each Array.from({ length: 5 }) as _, i}
                            {#if i < Math.floor(item?.analystScore)}
                              <svg
                                class="w-3 h-3 text-[#FBCE3C]"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 22 20"
                              >
                                <path
                                  d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"
                                />
                              </svg>
                            {:else}
                              <svg
                                class="w-3 h-3 text-gray-400 dark:text-gray-500"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 22 20"
                              >
                                <path
                                  d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"
                                />
                              </svg>
                            {/if}
                          {/each}

                          <span class="ml-1 text-sm">
                            ({item?.analystScore !== null
                              ? item?.analystScore
                              : 0})
                          </span>
                        </div>
                      </div>
                    </td>

                    <td
                      class="text-sm sm:text-[1rem] whitespace-nowrap text-start"
                    >
                      {item?.analyst?.length > charNumber
                        ? item?.analyst?.slice(0, charNumber) + "..."
                        : item?.analyst}
                    </td>

                    <td
                      class="text-sm sm:text-[1rem] whitespace-nowrap text-end"
                    >
                      <span
                        class=" {['Strong Buy', 'Buy']?.includes(
                          item?.rating_current,
                        )
                          ? 'text-green-600 dark:text-[#00FC50]'
                          : item?.rating_current === 'Hold'
                            ? '"text-red-600 dark:text-[#FF7070]"'
                            : ['Strong Sell', 'Sell']?.includes(
                                  item?.rating_current,
                                )
                              ? 'text-red-600 dark:text-[#FF2F1F]'
                              : ''}"
                      >
                        {item?.rating_current}
                      </span>
                    </td>

                    <td
                      class="text-sm sm:text-[1rem] whitespace-nowrap text-end"
                    >
                      {item?.action_company?.replace(
                        "Initiates Coverage On",
                        "Initiates",
                      )}
                    </td>

                    <td
                      class="text-sm sm:text-[1rem] whitespace-nowrap text-end font-semibold"
                    >
                      <div class="flex flex-col items-end">
                        <div class="flex flex-row items-center">
                          {#if Math?.ceil(item?.adjusted_pt_prior) !== 0}
                            <span class="text-gray-100 font-normal"
                              >{Math?.ceil(item?.adjusted_pt_prior)}</span
                            >
                            <svg
                              class="w-3 h-3 ml-1 mr-1 inline-block"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              ><path
                                fill="none"
                                stroke="white"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2.5"
                                d="M4 12h16m0 0l-6-6m6 6l-6 6"
                              /></svg
                            >
                            <span class=""
                              >{Math?.ceil(item?.adjusted_pt_current)}</span
                            >
                          {:else if Math?.ceil(item?.adjusted_pt_current) !== 0}
                            <span class=""
                              >{Math?.ceil(item?.adjusted_pt_current)}</span
                            >
                          {:else}
                            <span class="">n/a</span>
                          {/if}
                        </div>
                      </div>
                    </td>

                    <td
                      class=" text-end text-sm sm:text-[1rem] whitespace-nowrap"
                    >
                      <div class="flex flex-col items-end">
                        {#if latestInfoDate(item?.date)}
                          <label
                            class="border-gray-300 shadow-sm bg-blue-100 dark:bg-[#fff] text-black font-semibold text-xs rounded px-2 py-0.5 ml-3 mb-1"
                          >
                            New
                          </label>
                        {/if}
                        {new Date(item?.date).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          daySuffix: "2-digit",
                        })}
                      </div>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {:else if activeIdx === 1}
          <div class="w-full flex justify-start items-center m-auto mt-10 mb-6">
            <div
              class="text-center w-fit text-gray-100 text-sm sm:text-[1rem] rounded-md h-auto border border-gray-300 dark:border-gray-600 p-4"
            >
              <svg
                class="w-5 h-5 inline-block sm:mr-1 shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
                ><path
                  fill="#fff"
                  d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-4 48a12 12 0 1 1-12 12a12 12 0 0 1 12-12m12 112a16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16a16 16 0 0 1 16 16v40a8 8 0 0 1 0 16"
                /></svg
              >
              There are no top analyst ratings available for the past 12 months for
              {$displayCompanyName}
            </div>
          </div>
        {/if}

        {#if rawData?.length !== 0}
          <UpgradeToPro {data} />
        {/if}
        {#if !["Pro", "Plus"]?.includes(data?.user?.tier)}
          <div class="mt-4 py-6 xl:mt-10 border-t border-gray-200">
            <div class="mx-auto max-w-7xl px-3 xs:px-6 lg:px-8">
              <div class="mx-auto max-w-2xl md:text-center">
                <h3 class="mt-2 text-2xl font-bold tracking-tight bp:text-3xl">
                  Analyst Star Rankings
                </h3>
                <p class="mt-3 leading-8 xl:text-lg">
                  Our analyst star rankings are based on these four factors
                </p>
              </div>
              <div class="mx-auto mt-6 max-w-2xl lg:max-w-5xl">
                <dl
                  class="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 lg:max-w-none lg:grid-cols-4 lg:gap-y-16"
                >
                  <div class="relative pl-14">
                    <dt class=" font-semibold leading-4 md:leading-7">
                      <div
                        class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-md bg-[#3B82F6] dark:bg-[#fff]"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          class="h-6 w-6 text-white dark:text-black"
                          ><path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          ></path></svg
                        >
                      </div>
                      Success Rate
                    </dt>
                    <dd class="mt-2 leading-7">
                      The percentage of ratings that are profitable.
                    </dd>
                  </div>
                  <div class="relative pl-14">
                    <dt class=" font-semibold leading-4 md:leading-7">
                      <div
                        class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-md bg-[#3B82F6] dark:bg-[#fff]"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          class="h-6 w-6 text-white dark:text-black"
                          ><path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                          ></path></svg
                        >
                      </div>
                      Average Return
                    </dt>
                    <dd class="mt-2 leading-7">
                      The average percentage return within one year of the
                      rating.
                    </dd>
                  </div>
                  <div class="relative pl-14">
                    <dt class=" font-semibold leading-4 md:leading-7">
                      <div
                        class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-md bg-[#3B82F6] dark:bg-[#fff]"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          class="h-6 w-6 text-white dark:text-black"
                          ><path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z"
                          ></path></svg
                        >
                      </div>
                      Rating Count
                    </dt>
                    <dd class="mt-2 leading-7">
                      The more ratings the analyst has provided, the higher the
                      score.
                    </dd>
                  </div>
                  <div class="relative pl-14">
                    <dt class=" font-semibold leading-4 md:leading-7">
                      <div
                        class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-md bg-[#3B82F6] dark:bg-[#fff]"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          class="h-6 w-6 text-white dark:text-black"
                          ><path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                          ></path></svg
                        >
                      </div>
                      Recency
                    </dt>
                    <dd class="mt-2 leading-7">
                      Ratings provided within the past year contribute to a
                      higher score.
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</section>
