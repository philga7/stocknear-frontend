<script lang="ts">
  import { numberOfUnreadNotification } from "$lib/store";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import SEO from "$lib/components/SEO.svelte";

  import { onMount } from "svelte";

  export let data;

  let isLoaded = true;

  let rawData = data?.getTopAnalyst;
  let originalData = [...rawData]; // Unaltered copy of raw data

  let analystList = rawData?.slice(0, 50) ?? [];

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;

    if (isBottom && analystList?.length !== originalData?.length) {
      const nextIndex = analystList?.length;
      const filteredNewResults = originalData?.slice(nextIndex, nextIndex + 50);
      analystList = [...analystList, ...filteredNewResults];
    }
  }

  onMount(async () => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  let columns = [
    { key: "rank", label: "Rank", align: "left" },
    { key: "analystName", label: "Analyst", align: "left" },
    { key: "successRate", label: "Success Rate", align: "right" },
    { key: "avgReturn", label: "Avg. Return", align: "right" },
    { key: "totalRatings", label: "Total Ratings", align: "right" },
    { key: "lastRating", label: "Last Rating", align: "right" },
  ];

  let sortOrders = {
    rank: { order: "none", type: "number" },
    analystName: { order: "none", type: "string" },
    successRate: { order: "none", type: "number" },
    avgReturn: { order: "none", type: "number" },
    totalRatings: { order: "none", type: "number" },
    lastRating: { order: "none", type: "date" },
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
    const currentOrderIndex = orderCycle.indexOf(
      sortOrders[key]?.order || "none",
    );
    sortOrders[key] = {
      ...(sortOrders[key] || {}),
      order: orderCycle[(currentOrderIndex + 1) % orderCycle.length],
    };
    const sortOrder = sortOrders[key]?.order;

    // Reset to original data when 'none' and stop further sorting
    if (sortOrder === "none") {
      originalData = [...rawData]; // Reset originalData to rawData
      analystList = originalData?.slice(0, 50); // Reset displayed data
      return;
    }

    // Generic comparison function
    const compareValues = (a, b) => {
      const { type } = sortOrders[key];
      let valueA, valueB;

      switch (type) {
        case "date":
          valueA = new Date(a[key]);
          valueB = new Date(b[key]);
          break;
        case "rating":
        case "string":
          // Retrieve values
          valueA = a[key];
          valueB = b[key];

          // Handle null or undefined values, always placing them at the bottom
          if (valueA == null && valueB == null) {
            return 0; // Both are null/undefined, no need to change the order
          } else if (valueA == null) {
            return 1; // null goes to the bottom
          } else if (valueB == null) {
            return -1; // null goes to the bottom
          }

          // Convert the values to uppercase for case-insensitive comparison
          valueA = valueA?.toUpperCase();
          valueB = valueB?.toUpperCase();

          // Perform the sorting based on ascending or descending order
          return sortOrder === "asc"
            ? valueA?.localeCompare(valueB)
            : valueB?.localeCompare(valueA);
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

    // Sort and update the originalData and analystList
    originalData = [...rawData].sort(compareValues);
    analystList = originalData?.slice(0, 50); // Update the displayed data
  };
</script>

<SEO
  title="Top Wall Street Stock Analysts"
  description="A list of the top Wall Street stock analysts, ranked by their success rate and average return per rating."
/>

<section
  class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden min-h-screen pt-5 px-4 lg:px-3 mb-20"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">Top Wall Street Analysts</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5 mb-20">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4 lg:pr-5">
          <div class="mb-6 border-b-[2px]">
            <h1 class="mb-1 text-white text-2xl sm:text-3xl font-bold">
              Top Wall Street Analysts
            </h1>
            <p class="mb-3 px-1 text-base font-semibold text-muted sm:px-0">
              A list of Wall Street Analysts, ranked by their performance
            </p>
          </div>

          <div class="w-full m-auto mt-16">
            {#if isLoaded}
              <div
                class="w-full m-auto rounded-none sm:rounded-md mb-4 overflow-x-auto sm:overflow-hidden"
              >
                <table
                  class="table table-sm table-compact rounded-none sm:rounded-md w-full bg-table border border-gray-800 m-auto"
                >
                  <thead>
                    <TableHeader {columns} {sortOrders} {sortData} />
                  </thead>
                  <tbody>
                    {#each analystList as item, index}
                      <tr
                        class="sm:hover:bg-[#245073]/10 odd:bg-odd {index +
                          1 ===
                          rawData?.length && data?.user?.tier !== 'Pro'
                          ? 'opacity-[0.1]'
                          : ''}"
                      >
                        <td
                          class="text-white text-sm sm:text-[1rem] text-white text-center"
                        >
                          {item?.rank}
                        </td>

                        <td
                          class="text-start text-sm sm:text-[1rem] whitespace-nowrap"
                        >
                          <div class="flex flex-col items-start">
                            <a
                              href={"/analysts/" + item?.analystId}
                              class="sm:hover:text-white text-blue-400"
                              >{item?.analystName}
                            </a>
                            <!--<span class="text-white">{item?.companyName} </span>-->
                            <div class="flex flex-row items-center mt-1">
                              {#each Array.from({ length: 5 }) as _, i}
                                {#if i < Math.floor(item?.analystScore)}
                                  <svg
                                    class="w-3.5 h-3.5 text-[#FBCE3C]"
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
                                    class="w-3.5 h-3.5 text-gray-300 dark:text-gray-500"
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

                              <span class="ml-1 text-gray-400">
                                ({item?.analystScore !== null
                                  ? item?.analystScore
                                  : 0})
                              </span>
                            </div>
                          </div>
                        </td>

                        <td
                          class="text-end text-sm sm:text-[1rem] whitespace-nowrap text-white"
                        >
                          {#if Number(item?.successRate) >= 0}
                            <span class="text-[#00FC50]"
                              >+{Number(item?.successRate)?.toFixed(2)}%</span
                            >
                          {/if}
                        </td>

                        <td
                          class="text-end text-sm sm:text-[1rem] whitespace-nowrap text-white"
                        >
                          {#if Number(item?.avgReturn) >= 0}
                            <span class="text-[#00FC50]"
                              >+{Number(item?.avgReturn)?.toFixed(2)}%</span
                            >
                          {:else}
                            <span class="text-[#B84242]"
                              >{Number(item?.avgReturn)?.toFixed(2)}%</span
                            >
                          {/if}
                        </td>

                        <td
                          class="text-end text-white text-sm sm:text-[1rem] whitespace-nowrap"
                        >
                          {item?.totalRatings}
                        </td>

                        <!--
                            <td class="text-white text-sm sm:text-[1rem] whitespace-nowrap text-white text-end">
                              {item?.mainSectors?.at(0)}
                            </td>
                            -->

                        <td
                          class="text-end text-sm sm:text-[1rem] whitespace-nowrap text-white"
                        >
                          {item?.lastRating !== null
                            ? new Date(item?.lastRating)?.toLocaleString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  daySuffix: "2-digit",
                                },
                              )
                            : "n/a"}
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            {:else}
              <div class="flex justify-center items-center h-80">
                <div class="relative">
                  <label
                    class="bg-secondary rounded-md h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  >
                    <span
                      class="loading loading-spinner loading-md text-gray-400"
                    ></span>
                  </label>
                </div>
              </div>
            {/if}
          </div>

          {#if isLoaded}
            <UpgradeToPro {data} />

            <div class="mt-4 py-6 xl:mt-10 border-t border-gray-200">
              <div class="mx-auto max-w-7xl px-3 xs:px-6 lg:px-8">
                <div class="mx-auto max-w-2xl md:text-center">
                  <h3
                    class="mt-2 text-2xl font-bold tracking-tight text-white bp:text-3xl"
                  >
                    Analyst Star Rankings
                  </h3>
                  <p
                    class="mt-3 text-base leading-8 text-muted dark:text-faded xl:text-lg"
                  >
                    Our analyst star rankings are based on these four factors
                  </p>
                </div>
                <div class="mx-auto mt-6 max-w-2xl lg:max-w-5xl">
                  <dl
                    class="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 lg:max-w-none lg:grid-cols-4 lg:gap-y-16"
                  >
                    <div class="relative pl-14">
                      <dt
                        class="text-base font-semibold leading-4 text-white md:leading-7"
                      >
                        <div
                          class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-md bg-[#fff]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            class="h-6 w-6 text-black"
                            ><path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path></svg
                          >
                        </div>
                        Success Rate
                      </dt>
                      <dd
                        class="mt-2 text-base leading-7 text-muted dark:text-faded"
                      >
                        The percentage of ratings that are profitable.
                      </dd>
                    </div>
                    <div class="relative pl-14">
                      <dt
                        class="text-base font-semibold leading-4 text-white md:leading-7"
                      >
                        <div
                          class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-md bg-[#fff]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            class="h-6 w-6 text-black"
                            ><path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                            ></path></svg
                          >
                        </div>
                        Average Return
                      </dt>
                      <dd
                        class="mt-2 text-base leading-7 text-muted dark:text-faded"
                      >
                        The average percentage return within one year of the
                        rating.
                      </dd>
                    </div>
                    <div class="relative pl-14">
                      <dt
                        class="text-base font-semibold leading-4 text-white md:leading-7"
                      >
                        <div
                          class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-md bg-[#fff]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            class="h-6 w-6 text-black"
                            ><path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z"
                            ></path></svg
                          >
                        </div>
                        Rating Count
                      </dt>
                      <dd
                        class="mt-2 text-base leading-7 text-muted dark:text-faded"
                      >
                        The more ratings the analyst has provided, the higher
                        the score.
                      </dd>
                    </div>
                    <div class="relative pl-14">
                      <dt
                        class="text-base font-semibold leading-4 text-white md:leading-7"
                      >
                        <div
                          class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-md bg-[#fff]"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            class="h-6 w-6 text-black"
                            ><path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path></svg
                          >
                        </div>
                        Recency
                      </dt>
                      <dd
                        class="mt-2 text-base leading-7 text-muted dark:text-faded"
                      >
                        Ratings provided within the past year contribute to a
                        higher score.
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          {/if}
        </main>
        <aside class="hidden lg:block relative fixed w-1/4 ml-4">
          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-inherit sm:hover:bg-secondary transition ease-out duration-100"
          >
            <a
              href={"/analysts/top-stocks"}
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Top Stocks Picks
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Get the latest top Wall Street analyst ratings.
              </span>
            </a>
          </div>

          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-inherit sm:hover:bg-secondary transition ease-out duration-100"
          >
            <a
              href={"/list/most-shorted-stocks"}
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Top Shorted Stocks
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Never miss out another short squeeze
              </span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  </div>
</section>
