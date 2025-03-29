<script lang="ts">
  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  import SEO from "$lib/components/SEO.svelte";
  import { screenWidth } from "$lib/store";
  import { onMount } from "svelte";

  export let data;

  let rawData = data?.getData;

  let stockList = rawData?.slice(0, 50);

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;
    if (isBottom && stockList?.length !== rawData?.length) {
      const nextIndex = stockList?.length;
      const filteredNewResults = rawData?.slice(nextIndex, nextIndex + 25);
      stockList = [...stockList, ...filteredNewResults];
    }
  }

  onMount(() => {
    if (["Pro", "Plus"]?.includes(data?.user?.tier)) {
      window.addEventListener("scroll", handleScroll);
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }
  });

  $: columns = [
    { key: "analystScore", label: "Rank", align: "left" },
    { key: "analystName", label: "Analyst", align: "left" },
    { key: "symbol", label: "Symbol", align: "left" },
    { key: "name", label: "Name", align: "left" },
    { key: "rating_current", label: "Action", align: "left" },
    { key: "adjusted_pt_current", label: "Price Target", align: "right" },
    { key: "upside", label: "Upside [%]", align: "right" },
    { key: "date", label: "Date", align: "right" },
  ];

  let sortOrders = {
    analystName: { order: "none", type: "string" },
    analystScore: { order: "none", type: "number" },
    filingDate: { order: "none", type: "date" },
    symbol: { order: "none", type: "string" },
    name: { order: "none", type: "string" },
    rating_current: { order: "none", type: "string" },
    adjusted_pt_current: { order: "none", type: "number" },
    upside: { order: "none", type: "number" },
    date: { order: "none", type: "date" },
  };

  const sortData = (key) => {
    // Reset all other keys to 'none' except the current key
    for (const k in sortOrders) {
      if (k !== key) {
        sortOrders[k].order = "none";
      }
    }

    // Cycle through 'none', 'asc', 'desc' for the clicked key
    const orderCycle = ["none", "asc", "desc"];

    let originalData = rawData;

    const currentOrderIndex = orderCycle.indexOf(sortOrders[key].order);
    sortOrders[key].order =
      orderCycle[(currentOrderIndex + 1) % orderCycle.length];
    const sortOrder = sortOrders[key].order;

    // Reset to original data when 'none' and stop further sorting
    if (sortOrder === "none") {
      stockList = [...originalData]?.slice(0, 50); // Reset to original data (spread to avoid mutation)
      return;
    }

    // Define a generic comparison function
    const compareValues = (a, b) => {
      const { type } = sortOrders[key];
      let valueA, valueB;

      switch (type) {
        case "date":
          valueA = new Date(a[key]);
          valueB = new Date(b[key]);
          break;
        case "string":
          valueA = a[key].toUpperCase();
          valueB = b[key].toUpperCase();
          return sortOrder === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        case "number":
        default:
          valueA = parseFloat(a[key]);
          valueB = parseFloat(b[key]);
          break;
      }

      if (sortOrder === "asc") {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    };

    // Sort using the generic comparison function
    stockList = [...originalData].sort(compareValues)?.slice(0, 50);
  };

  $: charNumber = $screenWidth < 640 ? 20 : 40;
</script>

<SEO
  title="Analyst Flow - Latest Wall Street Analyst Ratings & Insights"
  description="Stay updated with the latest Wall Street analyst ratings, stock upgrades, downgrades, and price target changes. Get real-time insights to make informed investment decisions."
/>

<section
  class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden min-h-screen pb-20 pt-5 px-4 lg:px-3"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-muted dark:text-gray-300">Home</a></li>
      <li class="text-muted dark:text-gray-300">Analyst Live Flow</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:pr-5">
          <div class="mb-6 border-b-[2px]">
            <h1 class="mb-3 text-2xl sm:text-3xl font-bold">
              Wallstreet Analyst Live Flow
            </h1>
          </div>

          <Infobox
            text={"Stay ahead with real-time Wall Street analyst ratings, keeping you informed of the latest stock upgrades, downgrades and recommendations."}
          />

          <div class="w-full m-auto mt-4">
            <div
              class="w-full m-auto rounded-none sm:rounded-md mb-4 overflow-x-auto"
            >
              <table
                class="table table-sm table-compact no-scrollbar rounded-none sm:rounded-md w-full bg-white dark:bg-table border border-gray-300 dark:border-gray-800 m-auto"
              >
                <thead>
                  <TableHeader {columns} {sortOrders} {sortData} />
                </thead>
                <tbody>
                  {#each stockList as item, index}
                    <tr
                      class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd {index +
                        1 ===
                        stockList?.length &&
                      !['Pro', 'Plus']?.includes(data?.user?.tier)
                        ? 'opacity-[0.1]'
                        : ''}"
                    >
                      <td
                        class="text-sm sm:text-[1rem] whitespace-nowrap flex flex-row mt-2.5 sm:mt-0 items-center"
                      >
                        <div>{item?.analystScore?.toFixed(1)}</div>
                        <svg
                          class="ml-1 w-4 h-4"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="#FFA500"
                          viewBox="0 0 22 20"
                        >
                          <path
                            d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"
                          />
                        </svg>
                      </td>

                      <td
                        class="text-sm sm:text-[1rem] text-start whitespace-nowrap"
                      >
                        <a
                          href={`/analysts/${item?.analystId}`}
                          class="underline underline-offset-4 sm:hover:text-blue-600 dark:sm:hover:text-blue-400"
                          >{item?.analystName}</a
                        >
                      </td>

                      <td
                        class="text-sm sm:text-[1rem] text-start whitespace-nowrap"
                      >
                        <a
                          href={`/stocks/${item?.symbol}`}
                          class="text-blue-600 sm:hover:text-muted dark:text-blue-400 dark:sm:hover:text-white"
                          >{item?.symbol}</a
                        >
                      </td>

                      <td
                        class="text-sm sm:text-[1rem] text-start whitespace-nowrap"
                      >
                        {item?.name?.length > charNumber
                          ? item?.name?.slice(0, charNumber) + "..."
                          : item?.name}
                      </td>

                      <td
                        class="text-sm sm:text-[1rem] text-start whitespace-nowrap"
                      >
                        <div class="flex flex-col sm:flex-row items-start">
                          <span class="mr-1">{item?.action}:</span>
                          <span
                            class=" {[
                              'Strong Buy',
                              'Buy',
                              'Outperform',
                            ]?.includes(item?.rating_current)
                              ? 'text-green-700 dark:text-[#00FC50]'
                              : item?.rating_current === 'Hold'
                                ? '"text-red-700 dark:text-[#FF7070]"'
                                : [
                                      'Strong Sell',
                                      'Sell',
                                      'Underperform',
                                    ]?.includes(item?.rating_current)
                                  ? 'text-red-700 dark:text-[#FF2F1F]'
                                  : 'text-muted dark:text-gray-300'}"
                          >
                            {item?.rating_current}
                          </span>
                        </div>
                      </td>

                      <td class=" text-sm sm:text-[1rem] whitespace-nowrap">
                        <div class="flex flex-row items-center justify-end">
                          {#if Math?.ceil(item?.adjusted_pt_prior) !== 0}
                            <span
                              class="text-muted dark:text-gray-100 font-normal"
                              >{Math?.ceil(item?.adjusted_pt_prior)}</span
                            >
                            <svg
                              class="w-3 h-3 ml-1 mr-1 inline-block"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              ><path
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                                d="M4 12h16m0 0l-6-6m6 6l-6 6"
                              /></svg
                            >
                            <span class=" font-semibold"
                              >{Math?.ceil(item?.adjusted_pt_current)}</span
                            >
                          {:else if Math?.ceil(item?.adjusted_pt_current) !== 0}
                            <span class=" font-semibold"
                              >{Math?.ceil(item?.adjusted_pt_current)}</span
                            >
                          {:else}
                            n/a
                          {/if}
                        </div>
                      </td>

                      <td
                        class="{item?.upside >= 0 && item?.upside !== null
                          ? "before:content-['+'] text-green-600 dark:text-[#00FC50]"
                          : item?.upside < 0 && item?.upside !== null
                            ? 'text-red-600 dark:text-[#FF2F1F]'
                            : ''} text-end text-sm sm:text-[1rem] whitespace-nowrap"
                      >
                        {item?.upside !== null ? item?.upside + "%" : "n/a"}
                      </td>

                      <td
                        class=" text-end text-sm sm:text-[1rem] whitespace-nowrap"
                      >
                        {new Date(item?.date).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          daySuffix: "2-digit",
                        })}
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>

          <UpgradeToPro {data} />
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
                          class="h-6 w-6 text-white"
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
        </main>
      </div>
    </div>
  </div>
</section>
