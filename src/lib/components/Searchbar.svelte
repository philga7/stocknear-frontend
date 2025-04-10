<script lang="ts">
  import { screenWidth } from "$lib/store";
  import { onMount } from "svelte";
  import Search from "lucide-svelte/icons/search";
  import { goto } from "$app/navigation";
  import { Combobox } from "bits-ui";

  let searchHistory = [];
  let updatedSearchHistory = [];
  let searchBarData = [];
  let isLoading = false;
  let timeoutId;
  let focusedSuggestion = "";
  let showSuggestions = false;
  let touchedInput = false;

  $: inputValue = "";
  let nextPage = false;
  let searchOpen = false;
  let searchBarModalChecked = false; // Initialize it to false
  let inputElement;
  let isNavigating = false;

  const popularList = [
    {
      symbol: "KO",
      name: "Coca Cola Company",
      type: "Stock",
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc",
      type: "Stock",
    },
    {
      symbol: "AMD",
      name: "Advanced Micro Devices",
      type: "Stock",
    },
    {
      symbol: "SPY",
      name: "SPDR S&P 500 ETF Trust",
      type: "ETF",
    },
    {
      symbol: "NVDA",
      name: "Nvidia",
      type: "Stock",
    },
  ];

  async function handleSearch(symbol, assetType) {
    if (isNavigating) return; // Prevent double calls
    isNavigating = true;

    // Find the matching ticker data
    const newSearchItem = searchBarData?.find(
      (item) => item?.symbol === symbol?.toUpperCase(),
    );
    if (newSearchItem) {
      updatedSearchHistory = [
        newSearchItem,
        ...(searchHistory?.filter(
          (item) => item?.symbol?.toUpperCase() !== symbol?.toUpperCase(),
        ) || []),
      ].slice(0, 5);
    }

    // Close search modal
    searchOpen = false;
    if ($screenWidth < 640) {
      const closePopup = document.getElementById("searchBarModal");
      closePopup?.dispatchEvent(new MouseEvent("click"));
    }

    await goto(
      `/${assetType === "ETF" ? "etf" : assetType === "Index" ? "index" : "stocks"}/${symbol}`,
    );

    // Reset the flag after navigation
    setTimeout(() => {
      isNavigating = false;
    }, 100);
  }

  async function popularTicker(state) {
    if (isNavigating) return;
    isNavigating = true;

    searchOpen = false;
    if (!state) {
      isNavigating = false;
      return;
    }

    const upperState = state.toUpperCase();
    const newSearchItem = searchBarData?.find(
      ({ symbol }) => symbol === upperState,
    );

    if (newSearchItem) {
      updatedSearchHistory = [
        newSearchItem,
        ...(searchHistory?.filter(
          (item) => item?.symbol?.toUpperCase() !== upperState,
        ) || []),
      ].slice(0, 5);
    }

    const closePopup = document.getElementById("searchBarModal");
    closePopup?.dispatchEvent(new MouseEvent("click"));

    // Reset the flag after a short delay
    setTimeout(() => {
      isNavigating = false;
    }, 100);
  }

  function searchBarTicker(state) {
    if (isNavigating) return;
    showSuggestions = false;

    if (
      !state ||
      !searchBarData?.find((item) => item?.symbol === state?.toUpperCase())
    ) {
      if ($screenWidth < 640) {
        const closePopup = document.getElementById("searchBarModal");
        closePopup?.dispatchEvent(new MouseEvent("click"));
      }
      return;
    }

    const upperState = state.toUpperCase();
    const newSearchItem = searchBarData?.find(
      ({ symbol }) => symbol === upperState,
    );

    if (newSearchItem) {
      updatedSearchHistory = [
        newSearchItem,
        ...(searchHistory?.filter(
          (item) => item?.symbol?.toUpperCase() !== upperState,
        ) || []),
      ].slice(0, 5);
    }

    searchOpen = false;
    if ($screenWidth < 640) {
      const closePopup = document.getElementById("searchBarModal");
      closePopup?.dispatchEvent(new MouseEvent("click"));
    }
  }

  async function search() {
    isLoading = true;
    clearTimeout(timeoutId); // Clear any existing timeout

    if (!inputValue.trim()) {
      // Skip if query is empty or just whitespace
      searchBarData = []; // Clear previous results
      isLoading = false;
      return;
    }

    timeoutId = setTimeout(async () => {
      const response = await fetch(
        `/api/searchbar?query=${encodeURIComponent(inputValue)}&limit=10`,
      );
      searchBarData = await response?.json();
    }, 50); // delay
    isLoading = false;
  }

  function handleKeyDown(symbol) {
    if (isNavigating) return;

    const list = Array.from(
      new Map(
        [...searchHistory, ...searchBarData, ...popularList].map((item) => [
          item.symbol,
          item,
        ]),
      ).values(),
    );

    if (!list?.length) return;

    const newData = list.find((item) => item?.symbol === symbol);
    if (newData) {
      handleSearch(newData?.symbol, newData?.type);
    }
  }

  const handleControlK = async (event) => {
    if (event.ctrlKey && event.key === "k") {
      const keyboardSearch = document.getElementById("combobox-input");
      keyboardSearch?.dispatchEvent(new MouseEvent("click"));
      inputValue = "";
      event.preventDefault();
    }
  };

  function saveRecentTicker() {
    try {
      // Save the version along with the rules
      localStorage?.setItem("search-history", JSON?.stringify(searchHistory));
    } catch (e) {
      console.log("Failed saving indicator rules: ", e);
    }
  }

  onMount(() => {
    try {
      const savedRules = localStorage?.getItem("search-history");

      if (savedRules) {
        searchHistory = JSON.parse(savedRules);
      }
    } catch (e) {
      console.log(e);
    }

    window.addEventListener("keydown", handleControlK);
    return () => {
      window.removeEventListener("keydown", handleControlK);
    };
  });

  $: {
    if (searchBarModalChecked === true && typeof window !== "undefined") {
      if ($screenWidth > 640) {
        inputElement.focus();
      }
      //Page is not scrollable now
      document.body.classList.add("overflow-hidden");
    }
  }

  $: {
    if (searchBarModalChecked === false && typeof window !== "undefined") {
      showSuggestions = inputValue = "";
      document.body.classList?.remove("overflow-hidden");
    }
  }

  $: {
    if (
      (nextPage === true || searchBarModalChecked === false) &&
      updatedSearchHistory?.length > 0
    ) {
      (async () => {
        // Add 500 ms delay is important otherwise bug since #each has searchHistory and updates too quickly and redirects to wrong symbol
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Update search history after delay
        searchHistory = updatedSearchHistory;
        updatedSearchHistory = [];
        saveRecentTicker();
        nextPage = false;
      })();
    }
  }

  $: {
    if (searchBarData) {
      if (searchBarData?.length > 0) {
        showSuggestions = true;
      } else {
        showSuggestions = false;
      }
    }
  }

  $: {
    if (inputValue) {
      search();
    }
  }
</script>

<div class="hidden sm:block w-full sm:max-w-[600px] shadow-sm">
  <div>
    <div class="relative flex items-center">
      <div class="absolute inset-y-0 left-0 flex items-center pl-2.5">
        <svg
          class="h-4 w-4 text-icon xs:h-5 xs:w-5"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="3"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style="max-width: 40px"
          aria-hidden="true"
          ><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg
        >
      </div>
      <Combobox.Root
        items={searchBarData}
        bind:inputValue
        bind:touchedInput
        onSelectedChange={(state) => handleKeyDown(state?.value)}
      >
        <div class="relative w-full">
          <div
            class="absolute inset-y-0 left-0 flex items-center pl-2.5 text-gray-400"
          >
            <svg
              class="text-icon h-5 w-5"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style="max-width: 40px"
              aria-hidden="true"
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <Combobox.Input
            id="combobox-input"
            on:click={() => (inputValue = "")}
            class="grow rounded-sm border border-gray-300 dark:border-gray-600 py-2 pl-9 text-[1rem] placeholder-gray-600 dark:placeholder-gray-400  focus:shadow-lg focus:outline-hidden focus:ring-0 tiny:pl-8 xs:pl-10 text-muted dark:text-white md:py-2 w-full bg-[#F9FAFB] dark:bg-secondary focus:bg-white dark:focus:bg-secondary"
            placeholder="Company or stock symbol..."
            aria-label="Company or stock symbol..."
          />
          <div
            class="absolute inset-y-0 right-0 flex items-center gap-x-2 px-3 text-gray-350 font-semibold"
          >
            {#if isLoading}
              <span class="loading loading-spinner loading-sm"></span>
            {:else if inputValue?.length > 0}
              <label class="cursor-pointer" on:click={() => (inputValue = "")}>
                <svg
                  class="w-6 h-6"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  ><path
                    fill="currentColor"
                    d="m6.4 18.308l-.708-.708l5.6-5.6l-5.6-5.6l.708-.708l5.6 5.6l5.6-5.6l.708.708l-5.6 5.6l5.6 5.6l-.708.708l-5.6-5.6z"
                  /></svg
                >
              </label>
            {:else}
              <div
                class="pointer-events-none absolute end-6 top-2.5 gap-1 opacity-80 rtl:flex-row-reverse hidden lg:flex"
              >
                <kbd
                  class="kbd kbd-sm bg-gray-300 dark:bg-[#1C2128] text-gray-600 dark:text-gray-400"
                  >ctrl</kbd
                >
                <kbd
                  class="kbd kbd-sm bg-gray-300 dark:bg-[#1C2128] text-gray-600 dark:text-gray-400"
                  >K</kbd
                >
              </div>
            {/if}
          </div>
        </div>
        <Combobox.Content
          class="w-auto z-40 -mt-0.5  rounded-md border border-gray-300 dark:border-gray-700 bg-[#F9FAFB] dark:bg-secondary px-1 py-3 shadow-xl outline-hidden"
          sideOffset={8}
        >
          {#if inputValue?.length > 0 && searchBarData?.length > 0}
            <div
              class="pl-2 pb-2 border-b border-gray-300 dark:border-gray-600 text-muted dark:text-white text-sm font-semibold w-full"
            >
              Suggestions
            </div>
            {#each searchBarData as item}
              <Combobox.Item
                class="cursor-pointer text-muted dark:text-white border-b border-gray-300 dark:border-gray-600 last:border-none flex h-fit w-auto select-none items-center rounded-button py-3 pl-2 pr-1.5 text-sm capitalize outline-hidden transition-all duration-75 data-highlighted:bg-gray-200 dark:data-highlighted:bg-gray-200 dark:data-highlighted:bg-primary"
                value={item?.symbol}
                label={item?.name}
                on:click={() => handleSearch(item?.symbol, item?.type)}
              >
                <div class="flex flex-row items-center justify-between w-full">
                  <span
                    class="text-sm text-muted font-semibold dark:font-normal dark:text-blue-400"
                    >{item?.symbol}</span
                  >
                  <span class="ml-3 text-sm text-muted dark:text-white"
                    >{item?.name}</span
                  >
                  <span class="ml-auto text-sm text-muted dark:text-white"
                    >{item?.type}</span
                  >
                </div>
              </Combobox.Item>
            {/each}
          {:else if inputValue?.length === 0 || !showSuggestions}
            <div
              class="pl-2 pb-2 border-b border-gray-300 dark:border-gray-600 text-muted dark:text-white text-sm font-semibold w-full"
            >
              {searchHistory?.length > 0 ? "Recent" : "Popular"}
            </div>
            {#each searchHistory?.length > 0 ? searchHistory : popularList as item}
              <Combobox.Item
                class="cursor-pointer text-white border-b border-gray-300 dark:border-gray-600 last:border-none flex h-fit w-auto select-none items-center rounded-button py-3 pl-2 pr-1.5 text-sm capitalize outline-hidden transition-all duration-75 data-highlighted:bg-gray-200 dark:data-highlighted:bg-primary"
                value={item?.symbol}
                label={item?.name}
                on:click={() => handleSearch(item?.symbol, item?.type)}
              >
                <div class="flex flex-row items-center justify-between w-full">
                  <span
                    class="text-sm text-muted font-semibold dark:font-normal dark:text-blue-400"
                    >{item?.symbol}</span
                  >
                  <span class="ml-3 text-sm text-muted dark:text-white"
                    >{item?.name}</span
                  >
                  <span class="ml-auto text-sm text-muted dark:text-white"
                    >{item?.type}</span
                  >
                </div>
              </Combobox.Item>
            {/each}
          {:else}
            <span class="block px-5 py-2 text-sm text-muted dark:text-white">
              No results found
            </span>
          {/if}
        </Combobox.Content>
      </Combobox.Root>
    </div>
  </div>
</div>

<label
  for="searchBarModal"
  class="sm:hidden shadow cursor-pointer p-2 text-gray-500 dark:text-gray-300 dark:sm:hover:text-white shrink-0 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-md"
>
  <Search class="h-[20px] w-[20px]" />
</label>

<input
  type="checkbox"
  id="searchBarModal"
  class="modal-toggle"
  bind:checked={searchBarModalChecked}
/>

<dialog id="searchBarModal" class="modal bg-[#000]/40 p-3">
  <label for="searchBarModal" class="cursor-pointer modal-backdrop"></label>

  <div
    class="z-999 modal-box overflow-hidden rounded-md shadow bg-white dark:bg-secondary border border-gray-300 dark:border-gray-600 sm:my-8 sm:m-auto sm:h-auto w-full sm:w-3/4 lg:w-1/2 2xl:w-1/3"
  >
    <label
      for="searchBarModal"
      class="inline-block cursor-pointer absolute right-3 top-3 text-[1.3rem] sm:text-[1.8rem]"
    >
      <svg
        class="w-6 h-6 sm:w-8 sm:h-8"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        ><path
          fill="currentColor"
          d="m6.4 18.308l-.708-.708l5.6-5.6l-5.6-5.6l.708-.708l5.6 5.6l5.6-5.6l.708.708l-5.6 5.6l5.6 5.6l-.708.708l-5.6-5.6z"
        /></svg
      >
    </label>

    <!-- Search layout -->
    <div class="mt-8">
      <div class="relative">
        <div
          class="inline-block cursor-pointer absolute right-5 top-1.5 text-[1.3rem] sm:text-[1.5rem]"
        >
          {#if isLoading}
            <span class="loading loading-spinner loading-sm"></span>
          {:else if inputValue?.length > 0}
            <label class="cursor-pointer" on:click={() => (inputValue = "")}>
              <svg
                class="w-6 h-6 mt-2 ml-1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                ><path
                  fill="currentColor"
                  d="m6.4 18.308l-.708-.708l5.6-5.6l-5.6-5.6l.708-.708l5.6 5.6l5.6-5.6l.708.708l-5.6 5.6l5.6 5.6l-.708.708l-5.6-5.6z"
                /></svg
              >
            </label>
          {:else}
            /
          {/if}
        </div>

        <label for="modal-search" class="sr-only">Search</label>

        <input
          id="modal-search"
          class="focus:outline-none rounded-md w-full bg-gray-300 dark:bg-secondary border border-gray-300 dark:border-gray-600 focus:ring-transparent placeholder-gray-600 dark:placeholder-gray-200 py-3 pl-10 pr-4"
          type="search"
          placeholder="Company or stock symbol..."
          bind:value={inputValue}
          bind:this={inputElement}
          autocomplete="off"
        />

        <button
          on:click={() => searchBarTicker(inputValue)}
          class="absolute inset-0 right-auto group"
          type="submit"
          aria-label="Search"
        >
          <svg
            class="w-4 h-4 shrink-0 fill-current ml-4 mr-2 dark:text-slate-400"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z"
            />
            <path
              d="M15.707 14.293L13.314 11.9a8.019 8.019 0 01-1.414 1.414l2.393 2.393a.997.997 0 001.414 0 .999.999 0 000-1.414z"
            />
          </svg>
        </button>
      </div>
    </div>

    <div class="py-4">
      <!-- Popular searches -->
      <div class="mb-3 last:mb-0 mt-3">
        {#if !showSuggestions}
          <div class="text-start text-sm font-semibold mb-2">
            {searchHistory?.length > 0 ? "Recent" : "Popular"}
          </div>
        {/if}

        <ul class="text-sm">
          {#if !showSuggestions}
            {#each searchHistory?.length > 0 ? searchHistory : popularList as item}
              <li class="border-b border-gray-300 dark:border-gray-600">
                <a
                  href={`/${item?.type === "ETF" ? "etf" : item?.type === "Index" ? "index" : "stocks"}/${item?.symbol}`}
                  on:click={() => popularTicker(item?.symbol)}
                  class="mb-2 {item?.symbol === focusedSuggestion
                    ? 'cursor-pointer flex justify-start items-center p-2 bg-white dark:bg-primary rounded group'
                    : 'cursor-pointer bg-white dark:bg-secondary sm:hover:bg-gray-300 dark:sm:hover:bg-primary rounded-md flex justify-start items-center p-2   group'} w-full"
                >
                  <div class="flex flex-row items-center w-full">
                    <div class="flex flex-col">
                      <span
                        class="font-semibold dark:font-normal text-muted dark:text-blue-400"
                        >{item?.symbol}</span
                      >
                      <span class=""
                        >{item?.name.length > 150
                          ? item?.name?.slice(0, 150) + "..."
                          : item?.name}</span
                      >
                    </div>

                    <div class=" ml-auto">
                      {item?.type}
                    </div>
                  </div>
                </a>
              </li>
            {/each}
          {:else if showSuggestions && searchBarData?.length > 0}
            <div class="text-start text-sm font-semibold mb-2">Suggestions</div>
            {#each searchBarData as item}
              <li class="border-b border-gray-300 dark:border-gray-600">
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <a
                  href={`/${item?.type === "ETF" ? "etf" : item?.type === "Index" ? "index" : "stocks"}/${item?.symbol}`}
                  on:click={() => searchBarTicker(item?.symbol)}
                  class="mb-2 {item?.symbol === focusedSuggestion
                    ? 'shake-ticker cursor-pointer flex justify-start items-center p-2 bg-whitedark:bg-primary rounded group'
                    : 'cursor-pointer mb-2 bg-white dark:bg-secondary sm:hover:bg-primary rounded-md flex justify-start items-center p-2  group'}"
                >
                  <div class="flex flex-row items-center w-full">
                    <div class="flex flex-col">
                      <span
                        class="font-semibold dark:font-normal text-muted dark:text-blue-400"
                        >{item?.symbol}</span
                      >
                      <span class=""
                        >{item?.name?.length > 150
                          ? item?.name?.slice(0, 150) + "..."
                          : item?.name}</span
                      >
                    </div>

                    <div class=" ml-auto">
                      {item?.type}
                    </div>
                  </div>
                </a>
              </li>
            {/each}
          {:else if showSuggestions && searchBarData?.length === 0}
            <li>
              <label class="flex items-center p-2 rounded group">
                <svg
                  class="w-3 h-3 fill-slate-400 shrink-0 mr-3 dark:fill-slate-500"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.953 4.29a.5.5 0 0 0-.454-.292H6.14L6.984.62A.5.5 0 0 0 6.12.173l-6 7a.5.5 0 0 0 .379.825h5.359l-.844 3.38a.5.5 0 0 0 .864.445l6-7a.5.5 0 0 0 .075-.534Z"
                  />
                </svg>
                <span>No results found</span>
              </label>
            </li>
          {/if}
        </ul>
      </div>
    </div>
  </div>
</dialog>
