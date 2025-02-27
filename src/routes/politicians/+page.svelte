<script lang="ts">
  import republicanBackground from "$lib/images/bg-republican.png";
  import democraticBackground from "$lib/images/bg-democratic.png";
  import otherBackground from "$lib/images/bg-other.png";

  import SEO from "$lib/components/SEO.svelte";

  import { onMount } from "svelte";
  import { page } from "$app/stores";

  import { compareTwoStrings } from "string-similarity";
  //  import * as XLSX from 'xlsx';

  export let data;

  let cloudFrontUrl = import.meta.env.VITE_IMAGE_URL;
  let pagePathName = $page?.url?.pathname;

  let rawData = data?.getAllPolitician;
  let displayList = [];
  let filterQuery = "";
  let isLoaded = false;
  let animationClass = "";
  let animationId = "";
  let favoriteList = [];

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

  function handleInput(event) {
    filterQuery = event.target.value?.toLowerCase();
    let newData = [];

    setTimeout(() => {
      if (filterQuery?.length !== 0) {
        newData = rawData?.filter((item) => {
          const representative = item?.representative?.toLowerCase();
          // Check if representative includes filterQuery
          if (representative?.includes(filterQuery)) return true;

          // Implement fuzzy search by checking similarity
          // You can adjust the threshold as needed
          const similarityThreshold = 0.5;
          const similarity = compareTwoStrings(representative, filterQuery);
          return similarity > similarityThreshold;
        });

        if (newData?.length !== 0) {
          rawData = newData;
          displayList = [...newData];
        } else {
          // Reset to original data if no matches found
          rawData = data?.getAllPolitician;
          displayList = rawData?.slice(0, 20);
        }
      } else {
        // Reset to original data if filter is empty
        rawData = data?.getAllPolitician;
        displayList = rawData?.slice(0, 20);
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
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">Politicians</li>
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
              <h1 class="mb-3 text-white text-2xl sm:text-3xl font-bold">
                All US Politicians
              </h1>
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
                    <!--
                    <li
                      class="pl-3 py-1.5 flex-auto text-center bg-[#2E3238] rounded-[3px]"
                    >
                      <label
                        for="filterList"
                        class="flex flex-row items-center cursor-pointer"
                      >
                        <span
                          class="text-[0.75rem] sm:text-[1rem] text-gray-400 ml-2 text-start w-full px-0 py-1 bg-inherit"
                        >
                          Filter
                        </span>
                        <svg
                          class="ml-auto mr-5 h-5 w-5 inline-block transform transition-transform mr-2 rotate-180"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 1024 1024"
                          ><path
                            fill="#fff"
                            d="m488.832 344.32l-339.84 356.672a32 32 0 0 0 0 44.16l.384.384a29.44 29.44 0 0 0 42.688 0l320-335.872l319.872 335.872a29.44 29.44 0 0 0 42.688 0l.384-.384a32 32 0 0 0 0-44.16L535.168 344.32a32 32 0 0 0-46.336 0z"
                          /></svg
                        >
                      </label>
                    </li>
                    -->
                  </ul>
                </div>
              </div>

              <div class="w-full m-auto mt-4">
                <div
                  class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-5"
                >
                  {#each displayList as item}
                    <a
                      href={`/politicians/${item?.id}`}
                      class="w-full cursor-pointer bg-[#141417] sm:hover:bg-[#000] transition-colors ease-in-out {item?.party ===
                      'Republican'
                        ? 'sm:hover:shadow-[#80000D]'
                        : item?.party === 'Democratic'
                          ? 'sm:hover:shadow-[#1358C3]'
                          : 'sm:hover:shadow-[#636465]'}  shadow-md rounded-md h-auto pb-4 pt-4 mb-7"
                    >
                      <div class="flex flex-col relative">
                        <div
                          id={item?.id}
                          on:click|stopPropagation={(event) =>
                            addToFavorite(event, item?.id)}
                          class=" {favoriteList?.includes(item?.id)
                            ? 'text-[#FBCE3C]'
                            : 'text-white'} absolute top-0 right-5 z-20"
                        >
                          <svg
                            class="{item?.id === animationId
                              ? animationClass
                              : ''} w-[22px] h-[22px] inline-block cursor-pointer flex-shrink-0"
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
                            class="absolute -mt-4 w-full m-auto rounded-md"
                            src={republicanBackground}
                          />
                        {:else if item?.party === "Democratic"}
                          <img
                            class="absolute -mt-4 w-[500px] m-auto rounded-md"
                            src={democraticBackground}
                          />
                        {:else}
                          <img
                            class="absolute -mt-4 w-[500px] m-auto rounded-md"
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
                          <span
                            class="text-white text-lg font-medium mt-2 mb-2"
                          >
                            {item?.representative}
                          </span>
                          <span class="text-white text-md mb-8">
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
                            <span class="text-white text-[1rem] font-semibold"
                              >{item?.totalTrades?.toLocaleString(
                                "en-US",
                              )}</span
                            >
                            <span class="text-slate-300 font-medium text-sm"
                              >Total Trades</span
                            >
                          </label>

                          <div class="flex flex-col items-center">
                            <span class="text-white text-[1rem] font-semibold">
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
                            <span class="text-slate-300 font-medium text-sm"
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
            class="bg-secondary rounded-md h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <span class="loading loading-spinner loading-md text-gray-400"
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
