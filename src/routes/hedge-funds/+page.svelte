<script lang="ts">
  import cardBackground from "$lib/images/bg-hedge-funds.png";
  import defaultAvatar from "$lib/images/hedge-fund-avatar.png";

  import { abbreviateNumber, formatString } from "$lib/utils";
  import { onMount } from "svelte";
  import SEO from "$lib/components/SEO.svelte";

  export let data;

  let rawData = data?.getAllHedgeFunds;
  let displayList = rawData?.slice(0, 20) ?? [];
  let inputValue = "";

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;
    if (isBottom && displayList?.length !== rawData?.length) {
      const nextIndex = displayList?.length;
      const filteredNewResults = rawData?.slice(nextIndex, nextIndex + 20);
      displayList = [...displayList, ...filteredNewResults];
    }
  }

  onMount(async () => {
    if (!syncWorker) {
      const SyncWorker = await import("./workers/filterQuery?worker");
      syncWorker = new SyncWorker.default();
      syncWorker.onmessage = handleMessage;
    }

    window.addEventListener("scroll", handleScroll);
    //window.addEventListener('keydown', handleKeyDown);

    return () => {
      // Cleanup the event listeners when the component is unmounted
      window.removeEventListener("scroll", handleScroll);
      //window.removeEventListener('keydown', handleKeyDown);
    };
  });

  let syncWorker: Worker | undefined = undefined;

  // Handling messages from the worker
  const handleMessage = async (event) => {
    const filterData = event.data?.output;

    if (filterData?.length !== 0) {
      rawData = filterData;
      displayList = [...filterData]?.slice(0, 20);
    } else {
      // Reset to original data if no matches found
      rawData = data?.getAllHedgeFunds;
      displayList = rawData?.slice(0, 20);
    }
  };

  const loadWorker = async () => {
    syncWorker.postMessage({
      rawData: data?.getAllHedgeFunds,
      inputValue: inputValue,
    });
  };

  async function search() {
    inputValue = inputValue?.toLowerCase();

    setTimeout(async () => {
      if (inputValue?.length !== 0) {
        await loadWorker();
      } else {
        // Reset to original data if filter is empty
        rawData = data?.getAllHedgeFunds;
        displayList = rawData?.slice(0, 20);
      }
    }, 500);
  }
</script>

<SEO
  title="All
    listed Hedge Funds"
  description="Find all listed Hedge Funds based on the US Market."
/>

<section
  class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden min-h-screen pt-5 pb-40 px-3"
>
  <body class="w-full overflow-hidden m-auto">
    <div class="text-sm sm:text-[1rem] breadcrumbs">
      <ul>
        <li><a href="/" class="text-muted dark:text-gray-300">Home</a></li>
        <li class="text-muted dark:text-gray-300">Hedge Funds</li>
      </ul>
    </div>

    <section class="w-full overflow-hidden m-auto sm:mt-10 px-0 mt-10">
      <div class=" flex justify-center w-full m-auto overflow-hidden">
        <div
          class="relative flex justify-center items-center overflow-hidden w-full"
        >
          <main class="w-full">
            <h1 class="mb-3 text-2xl sm:text-3xl font-bold">
              All US Hedge Funds
            </h1>
            <div class="w-full pt-2">
              <div class="w-full flex flex-row items-center">
                <div class="relative w-fit">
                  <div
                    class="absolute inset-y-0 left-3 flex items-center pointer-events-none"
                  >
                    <svg
                      class="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      ></path>
                    </svg>
                  </div>
                  <input
                    bind:value={inputValue}
                    on:input={search}
                    type="text"
                    placeholder="Search Hedge Fund"
                    class="w-fit py-[5.5px] pl-10 border bg-inherit shadow-sm focus:outline-hidden border border-gray-300 dark:border-gray-600 rounded placeholder:text-gray-600 dark:placeholder:text-gray-300 px-3 focus:outline-none focus:ring-0 focus:border-gray-600 grow w-full sm:min-w-56 sm:max-w-xs"
                  />
                </div>
              </div>
            </div>

            <div class="w-full m-auto mt-4">
              <div
                class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-5"
              >
                {#each displayList as item}
                  <a
                    href={`/hedge-funds/${item?.cik}`}
                    class="w-full cursor-pointer bg-gray-300 dark:bg-[#141417] sm:hover:bg-gray-400 dark:sm:hover:bg-[#000] ease-in-out border dark:sm:hover:border-[#000] sm:hover:shadow-[#8C5F1B] border-gray-300 dark:border-gray-800 shadow-md rounded-md h-auto pb-4 pt-4 mb-7"
                  >
                    <div class="flex flex-col relative">
                      <img
                        class="absolute -mt-4 w-full m-auto rounded-md"
                        src={cardBackground}
                      />
                      <div
                        class="flex flex-col justify-center items-center rounded-2xl"
                      >
                        <div
                          class="-mt-3 shadow-lg rounded-full border border-slate-300 dark:border-slate-600 w-20 h-20 relative hedge-fund-striped bg-[#20202E] flex items-center justify-center"
                        >
                          <img
                            style="clip-path: circle(50%);"
                            class="rounded-full w-16"
                            src={defaultAvatar}
                            loading="lazy"
                          />
                        </div>
                        <span
                          class=" text-md font-semibold mt-2 mb-2 w-64 text-center"
                        >
                          {formatString(item?.name)}
                        </span>
                        <span class=" text-md mb-8">
                          AUM: {abbreviateNumber(item?.marketValue)}
                        </span>
                      </div>

                      <div class="relative bottom-0 w-full px-8">
                        <div
                          class="flex flex-row justify-between items-center w-full mb-6"
                        >
                          <label
                            class="cursor-pointer flex flex-col items-start"
                          >
                            <span class=" text-[1rem] font-semibold">
                              {new Intl.NumberFormat("en", {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              }).format(item?.numberOfStocks)}
                            </span>
                            <span class=" text-sm"># of Holdings</span>
                          </label>

                          <div class="flex flex-col items-end">
                            <span class=" text-[1rem] font-semibold">
                              {item?.turnover?.toFixed(2)}
                            </span>
                            <span class=" text-sm">Turnover</span>
                          </div>
                        </div>

                        <div
                          class="flex flex-row justify-between items-center w-full"
                        >
                          <label
                            class="cursor-pointer flex flex-col items-start"
                          >
                            <div
                              class="flex flex-row mt-1 text-[1rem] font-semibold"
                            >
                              {#if item?.performancePercentage3Year >= 0}
                                <span class="text-green-800 dark:text-[#00FC50]"
                                  >+{abbreviateNumber(
                                    item?.performancePercentage3Year?.toFixed(
                                      2,
                                    ),
                                  )}%</span
                                >
                              {:else}
                                <span class="text-red-800 dark:text-[#FF2F1F]"
                                  >{abbreviateNumber(
                                    item?.performancePercentage3Year?.toFixed(
                                      2,
                                    ),
                                  )}%
                                </span>
                              {/if}
                            </div>
                            <span class=" text-sm">3-Year Performance</span>
                          </label>

                          <div class="flex flex-col items-end">
                            <div
                              class="flex flex-row mt-1 text-[1rem] font-semibold"
                            >
                              {#if item?.winRate >= 0}
                                <span class="text-green-800 dark:text-[#00FC50]"
                                  >+{abbreviateNumber(
                                    item?.winRate?.toFixed(2),
                                  )}%</span
                                >
                              {:else}
                                <span class="text-red-800 dark:text-[#FF2F1F]"
                                  >{abbreviateNumber(
                                    item?.winRate?.toFixed(2),
                                  )}%
                                </span>
                              {/if}
                            </div>
                            <span class=" text-sm">Win Rate</span>
                          </div>
                        </div>
                      </div>
                    </div></a
                  >
                {/each}

                <!--<InfiniteLoading on:infinite={infiniteHandler} />-->
              </div>
            </div>
          </main>
        </div>
      </div>
    </section>
  </body>
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
