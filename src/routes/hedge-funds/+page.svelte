<script lang="ts">
  import cardBackground from "$lib/images/bg-hedge-funds.png";
  import defaultAvatar from "$lib/images/hedge-fund-avatar.png";

  import { abbreviateNumber, formatString } from "$lib/utils";
  import { onMount } from "svelte";
  import SEO from "$lib/components/SEO.svelte";

  export let data;

  let rawData = data?.getAllHedgeFunds;
  let displayList = rawData?.slice(0, 20) ?? [];
  let filterQuery = "";

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
    const SyncWorker = await import("./workers/filterQuery?worker");
    syncWorker = new SyncWorker.default();
    syncWorker.postMessage({
      rawData: data?.getAllHedgeFunds,
      filterQuery: filterQuery,
    });
    syncWorker.onmessage = handleMessage;
  };

  async function handleInput(event) {
    filterQuery = event.target.value?.toLowerCase();
    let newData = [];

    setTimeout(async () => {
      if (filterQuery?.length !== 0) {
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
        <li><a href="/" class="text-gray-300">Home</a></li>
        <li class="text-gray-300">Hedge Funds</li>
      </ul>
    </div>

    <section class="w-full overflow-hidden m-auto sm:mt-10 px-0 mt-10">
      <div class=" flex justify-center w-full m-auto overflow-hidden">
        <div
          class="relative flex justify-center items-center overflow-hidden w-full"
        >
          <main class="w-full">
            <div class="w-full pb-3">
              <div class="relative right-0 bg-default">
                <ul
                  class="relative grid grid-cols-1 sm:grid-cols-4 gap-y-3 gap-x-3 flex flex-wrap p-1 list-none rounded-[3px]"
                >
                  <li
                    class="pl-3 py-1.5 flex-auto text-center bg-[#2E3238] rounded-[3px]"
                  >
                    <label class="flex flex-row items-center">
                      <input
                        id="modal-search"
                        type="search"
                        class="text-white ml-2 text-[1rem] placeholder-gray-400 border-transparent focus:border-transparent focus:ring-0 flex items-center justify-center w-full px-0 py-1 bg-inherit"
                        placeholder="Find by name"
                        bind:value={filterQuery}
                        on:input={handleInput}
                        autocomplete="off"
                      />
                      <svg
                        class="ml-auto mr-5 h-8 w-8 inline-block mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        ><path
                          fill="#fff"
                          d="m19.485 20.154l-6.262-6.262q-.75.639-1.725.989t-1.96.35q-2.402 0-4.066-1.663T3.808 9.503T5.47 5.436t4.064-1.667t4.068 1.664T15.268 9.5q0 1.042-.369 2.017t-.97 1.668l6.262 6.261zM9.539 14.23q1.99 0 3.36-1.37t1.37-3.361t-1.37-3.36t-3.36-1.37t-3.361 1.37t-1.37 3.36t1.37 3.36t3.36 1.37"
                        /></svg
                      >
                    </label>
                  </li>
                </ul>
              </div>
            </div>

            <div class="w-full m-auto mt-4">
              <div
                class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-5"
              >
                {#each displayList as item}
                  <a
                    href={`/hedge-funds/${item?.cik}`}
                    class="w-full cursor-pointer bg-[#141417] sm:hover:bg-[#000] transition-colors ease-in-out border sm:hover:border-[#000] sm:hover:shadow-[#8C5F1B] border-gray-800 shadow-md rounded-md h-auto pb-4 pt-4 mb-7"
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
                          class="-mt-3 shadow-lg rounded-full border border-slate-600 w-20 h-20 relative hedge-fund-striped bg-[#20202E] flex items-center justify-center"
                        >
                          <img
                            style="clip-path: circle(50%);"
                            class="rounded-full w-16"
                            src={defaultAvatar}
                            loading="lazy"
                          />
                        </div>
                        <span
                          class="text-white text-md font-semibold mt-2 mb-2 w-64 text-center"
                        >
                          {formatString(item?.name)}
                        </span>
                        <span class="text-white text-md mb-8">
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
                            <span class="text-white text-[1rem] font-semibold">
                              {new Intl.NumberFormat("en", {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              }).format(item?.numberOfStocks)}
                            </span>
                            <span class="text-white font-medium text-sm"
                              ># of Holdings</span
                            >
                          </label>

                          <div class="flex flex-col items-end">
                            <span class="text-white text-[1rem] font-semibold">
                              {item?.turnover?.toFixed(2)}
                            </span>
                            <span class="text-white font-medium text-sm"
                              >Turnover</span
                            >
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
                                <span class="text-[#00FC50]"
                                  >+{abbreviateNumber(
                                    item?.performancePercentage3Year?.toFixed(
                                      2,
                                    ),
                                  )}%</span
                                >
                              {:else}
                                <span class="text-[#FF2F1F]"
                                  >{abbreviateNumber(
                                    item?.performancePercentage3Year?.toFixed(
                                      2,
                                    ),
                                  )}%
                                </span>
                              {/if}
                            </div>
                            <span class="text-white font-medium text-sm"
                              >3-Year Performance</span
                            >
                          </label>

                          <div class="flex flex-col items-end">
                            <div
                              class="flex flex-row mt-1 text-[1rem] font-semibold"
                            >
                              {#if item?.winRate >= 0}
                                <span class="text-[#00FC50]"
                                  >+{abbreviateNumber(
                                    item?.winRate?.toFixed(2),
                                  )}%</span
                                >
                              {:else}
                                <span class="text-[#FF2F1F]"
                                  >{abbreviateNumber(
                                    item?.winRate?.toFixed(2),
                                  )}%
                                </span>
                              {/if}
                            </div>
                            <span class="text-white font-medium text-sm"
                              >Win Rate</span
                            >
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
