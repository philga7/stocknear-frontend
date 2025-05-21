<script lang="ts">
  import republicanBackground from "$lib/images/bg-republican.png";
  import democraticBackground from "$lib/images/bg-democratic.png";
  import otherBackground from "$lib/images/bg-other.png";
  import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
  import { Button } from "$lib/components/shadcn/button/index.js";

  import SEO from "$lib/components/SEO.svelte";

  import { onMount } from "svelte";
  import { page } from "$app/stores";

  import { compareTwoStrings } from "string-similarity";
  //  import * as XLSX from 'xlsx';

  export let data;

  let cloudFrontUrl = import.meta.env.VITE_IMAGE_URL;
  let syncWorker: Worker | undefined;

  let pagePathName = $page?.url?.pathname;
  let timeoutId;

  let rawData = data?.getAllPolitician;

  let displayList = [];
  let isLoaded = false;
  let animationClass = "";
  let animationId = "";
  let favoriteList = [];
  let inputValue = "";
  let filterList = [];
  let checkedItems: Set<any> = new Set();

  // Handle messages from our filtering web worker.
  const handleMessage = (event) => {
    rawData = event.data?.output || [];
    rawData?.sort((a, b) => {
      // Check if each id is in the favoriteList
      const aIsFavorite = favoriteList?.includes(a?.id);
      const bIsFavorite = favoriteList?.includes(b?.id);

      // If both are favorites or both are not, keep their order
      if (aIsFavorite === bIsFavorite) return 0;

      // If a is favorite and b is not, a comes first; otherwise, b comes first
      return aIsFavorite ? -1 : 1;
    });

    displayList = rawData?.slice(0, 20) ?? [];
  };

  // Tell the web worker to filter our data
  const loadWorker = async () => {
    syncWorker?.postMessage({
      rawData: data?.getAllPolitician,
      filterList: filterList,
    });
  };

  async function handleChangeValue(value) {
    if (checkedItems.has(value)) {
      checkedItems.delete(value);
    } else {
      checkedItems.add(value);
    }
    const filterSet = new Set(filterList);
    filterSet.has(value) ? filterSet.delete(value) : filterSet.add(value);
    filterList = Array.from(filterSet);

    if (filterList.length > 0) {
      await loadWorker();
    } else {
      rawData = [...data?.getAllPolitician];
      rawData?.sort((a, b) => {
        // Check if each id is in the favoriteList
        const aIsFavorite = favoriteList?.includes(a?.id);
        const bIsFavorite = favoriteList?.includes(b?.id);

        // If both are favorites or both are not, keep their order
        if (aIsFavorite === bIsFavorite) return 0;

        // If a is favorite and b is not, a comes first; otherwise, b comes first
        return aIsFavorite ? -1 : 1;
      });

      displayList = rawData?.slice(0, 20) ?? [];
    }
  }

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
    try {
      const savedList = localStorage?.getItem(pagePathName);

      if (savedList) {
        favoriteList = JSON?.parse(savedList);
      }
    } catch (e) {
      console.log(e);
    }

    if (!syncWorker) {
      const SyncWorker = await import("./workers/filterWorker?worker");
      syncWorker = new SyncWorker.default();
      syncWorker.onmessage = handleMessage;
    }

    rawData?.sort((a, b) => {
      // Check if each id is in the favoriteList
      const aIsFavorite = favoriteList?.includes(a?.id);
      const bIsFavorite = favoriteList?.includes(b?.id);

      // If both are favorites or both are not, keep their order
      if (aIsFavorite === bIsFavorite) return 0;

      // If a is favorite and b is not, a comes first; otherwise, b comes first
      return aIsFavorite ? -1 : 1;
    });

    displayList = rawData?.slice(0, 20) ?? [];
    isLoaded = true;

    window.addEventListener("scroll", handleScroll);
    //window.addEventListener('keydown', handleKeyDown);

    return () => {
      // Cleanup the event listeners when the component is unmounted
      window.removeEventListener("scroll", handleScroll);
      //window.removeEventListener('keydown', handleKeyDown);
    };
  });

  function search() {
    clearTimeout(timeoutId); // Clear any existing timeout
    let newData = [];

    timeoutId = setTimeout(async () => {
      if (inputValue?.length > 0) {
        newData = rawData?.filter((item) => {
          const representative = item?.representative?.toLowerCase();
          // Check if representative includes inputValue
          if (representative?.includes(inputValue)) return true;

          // Implement fuzzy search by checking similarity
          // You can adjust the threshold as needed
          const similarityThreshold = 0.5;
          const similarity = compareTwoStrings(representative, inputValue);
          return similarity > similarityThreshold;
        });

        if (newData?.length > 0) {
          rawData = newData;
          displayList = [...newData];
        } else {
          if (filterList?.length === 0) {
            rawData = [...data?.getAllPolitician];
            displayList = rawData?.slice(0, 20);
          } else {
            await loadWorker();
          }
        }
      } else {
        // Reset to original data if filter is empty
        if (filterList?.length === 0) {
          rawData = [...data?.getAllPolitician];
          displayList = rawData?.slice(0, 20);
        } else {
          await loadWorker();
        }
      }
    }, 500);
  }

  function saveList() {
    try {
      // Save the version along with the rules
      localStorage?.setItem(pagePathName, JSON?.stringify(favoriteList));
    } catch (e) {
      console.log("Failed saving indicator rules: ", e);
    }
  }

  async function addToFavorite(event, itemId) {
    event?.preventDefault();
    if (favoriteList.includes(itemId)) {
      // Remove ticker from the watchlist.
      favoriteList = favoriteList?.filter((item) => item !== itemId);
    } else {
      // Add ticker to the watchlist.
      animationId = itemId;
      animationClass = "heartbeat";
      const removeAnimation = () => {
        animationId = "";
        animationClass = "";
      };
      favoriteList = [...favoriteList, itemId];
      const heartbeatElement = document.getElementById(itemId);
      if (heartbeatElement) {
        // Only add listener if it's not already present
        if (!heartbeatElement.classList.contains("animation-added")) {
          heartbeatElement.addEventListener("animationend", removeAnimation);
          heartbeatElement.classList.add("animation-added"); // Prevent re-adding listener
        }
      }
    }

    saveList();
  }
</script>

<SEO
  title="US
    Politician Stock Trade Tracker"
  description="What are US Politicians trading? Filter by Senate or House, Party, Committee, State and more - get detailed infomation about it."
/>

<section
  class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden min-h-screen pt-5 px-3"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-muted dark:text-gray-300">Home</a></li>
      <li class="text-muted dark:text-gray-300">Politicians</li>
    </ul>
  </div>

  <body class="w-full overflow-hidden m-auto">
    {#if isLoaded}
      <section class="w-full overflow-hidden m-auto mt-5">
        <div class=" flex justify-center w-full m-auto overflow-hidden">
          <div
            class="relative flex justify-center items-center overflow-hidden w-full"
          >
            <main class="w-full">
              <h1 class="mb-3 text-2xl sm:text-3xl font-bold">
                All US Politicians
              </h1>
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
                    placeholder="Search Politician"
                    class="w-fit py-[5.5px] pl-10 border bg-inherit shadow-xs focus:outline-hidden border border-gray-300 dark:border-gray-600 rounded placeholder:text-gray-600 dark:placeholder:text-gray-300 px-3 focus:outline-none focus:ring-0 focus:border-gray-600 grow w-full sm:min-w-56 sm:max-w-xs"
                  />
                </div>

                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild let:builder>
                    <Button
                      builders={[builder]}
                      class="ml-3 border-gray-300 dark:border-gray-600 border border-gray-300 shadow-xs sm:hover:bg-gray-100 dark:sm:hover:bg-primary ease-out  px-3 py-2  rounded "
                    >
                      <span class="truncate">Filter by Party</span>
                      <svg
                        class="-mr-1 ml-1 h-5 w-5 xs:ml-2 inline-block"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        style="max-width:40px"
                        aria-hidden="true"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content
                    class="w-56 h-fit max-h-72 overflow-y-auto scroller"
                  >
                    <DropdownMenu.Group>
                      {#each ["Democratic", "Republican"] as item}
                        <DropdownMenu.Item
                          class="sm:hover:bg-gray-300 dark:sm:hover:bg-primary"
                        >
                          <div class="flex items-center">
                            <label
                              class="cursor-pointer"
                              on:click={() => handleChangeValue(item)}
                              for={item}
                            >
                              <input
                                type="checkbox"
                                checked={checkedItems.has(item)}
                              />
                              <span class="ml-2">{item}</span>
                            </label>
                          </div>
                        </DropdownMenu.Item>
                      {:else}
                        <DropdownMenu.Item
                          class="sm:hover:bg-gray-300 dark:sm:hover:bg-primary"
                        >
                          No country found
                        </DropdownMenu.Item>
                      {/each}
                    </DropdownMenu.Group>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </div>

              <div class="w-full m-auto mt-4">
                <div
                  class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-5"
                >
                  {#each displayList as item}
                    <a
                      href={`/politicians/${item?.id}`}
                      class="w-full cursor-pointer bg-gray-100 dark:bg-[#141417] sm:hover:bg-gray-400 dark:sm:hover:bg-[#000] ease-in-out border dark:sm:hover:border-[#000] sm:hover:shadow-[#8C5F1B] border-gray-300 dark:border-gray-800 shadow-md rounded h-auto pb-4 pt-4 mb-7 {item?.party ===
                      'Republican'
                        ? 'sm:hover:shadow-[#80000D]'
                        : item?.party === 'Democratic'
                          ? 'sm:hover:shadow-[#1358C3]'
                          : 'sm:hover:shadow-[#636465]'}  shadow-md rounded h-auto pb-4 pt-4 mb-7"
                    >
                      <div class="flex flex-col relative">
                        <div
                          id={item?.id}
                          on:click|stopPropagation={(event) =>
                            addToFavorite(event, item?.id)}
                          class=" {favoriteList?.includes(item?.id)
                            ? 'text-[#FFA500]'
                            : ''} absolute top-0 right-5 z-20"
                        >
                          <svg
                            class="{item?.id === animationId
                              ? animationClass
                              : ''} w-[22px] h-[22px] inline-block cursor-pointer shrink-0"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 16 16"
                            ><path
                              fill="currentColor"
                              d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327l4.898.696c.441.062.612.636.282.95l-3.522 3.356l.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"
                            /></svg
                          >
                        </div>
                        {#if item?.party === "Republican"}
                          <img
                            class="absolute -mt-4 w-full m-auto rounded"
                            src={republicanBackground}
                          />
                        {:else if item?.party === "Democratic"}
                          <img
                            class="absolute -mt-4 w-[500px] m-auto rounded"
                            src={democraticBackground}
                          />
                        {:else}
                          <img
                            class="absolute -mt-4 w-[500px] m-auto rounded"
                            src={otherBackground}
                          />
                        {/if}
                        <div
                          class="flex flex-col justify-center items-center rounded-2xl"
                        >
                          <div
                            class="-mt-3 shadow-lg rounded-full border border-gray-800 w-20 h-20 relative {item?.party ===
                            'Republican'
                              ? 'republican-striped bg-[#98272B]'
                              : item?.party === 'Democratic'
                                ? 'democratic-striped bg-[#295AC7]'
                                : 'other-striped bg-[#20202E]'} flex items-center justify-center"
                          >
                            <img
                              style="clip-path: circle(50%);"
                              class="rounded-full w-16"
                              src={`${cloudFrontUrl}/assets/senator/${item?.representative?.replace(/\s+/g, "_")}.png`}
                              loading="lazy"
                            />
                          </div>
                          <span class=" text-lg mt-2 mb-2">
                            {item?.representative}
                          </span>
                          <span class=" text-md mb-8">
                            {item?.party ?? "n/a"}
                            {#if item?.district !== undefined && item?.district?.length !== 0}
                              / {item?.district}
                            {/if}
                          </span>
                        </div>

                        <div
                          class="flex flex-row justify-between items-center w-full px-10 pb-4"
                        >
                          <label
                            class="cursor-pointer flex flex-col items-center"
                          >
                            <span class=" text-[1rem] font-semibold"
                              >{item?.totalTrades?.toLocaleString(
                                "en-US",
                              )}</span
                            >
                            <span class="text-muted dark:text-slate-300 text-sm"
                              >Total Trades</span
                            >
                          </label>

                          <div class="flex flex-col items-center">
                            <span class=" text-[1rem] font-semibold">
                              {item?.lastTrade?.length !== undefined
                                ? new Date(item?.lastTrade)?.toLocaleString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                      daySuffix: "2-digit",
                                    },
                                  )
                                : "n/a"}
                            </span>
                            <span class="text-muted dark:text-slate-300 text-sm"
                              >Last Traded</span
                            >
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
    {:else}
      <div class="flex justify-center items-center h-80">
        <div class="relative">
          <label
            class="shadow-xs bg-gray-300 dark:bg-secondary rounded h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <span
              class="loading loading-spinner loading-md text-muted dark:text-gray-400"
            ></span>
          </label>
        </div>
      </div>
    {/if}
  </body>
</section>

<style>
  .republican-striped {
    background-image: repeating-linear-gradient(
      -45deg,
      #98272b,
      #98272b 10px,
      #840412 10px,
      #840412 20px
    );
  }

  .democratic-striped {
    background-image: repeating-linear-gradient(
      -45deg,
      #295ac7,
      #295ac7 10px,
      #164d9d 10px,
      #164d9d 20px
    );
  }

  .other-striped {
    background-image: repeating-linear-gradient(
      -45deg,
      #a4a6a8,
      #a4a6a8 10px,
      #c0c3c5 10px,
      #c0c3c5 20px
    );
  }

  .heartbeat {
    animation: heartbeat-animation 0.3s;
    animation-timing-function: ease-in-out;
  }

  @keyframes heartbeat-animation {
    0% {
      transform: rotate(0deg) scale(0.95);
    }
    25% {
      transform: rotate(10deg) scale(1.05);
    }
    50% {
      transform: rotate(0deg) scale(1.2);
    }
    75% {
      transform: rotate(-10deg) scale(1.05);
    }
    100% {
      transform: rotate(0deg) scale(0.95);
    }
  }
</style>
