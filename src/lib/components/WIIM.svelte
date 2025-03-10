<script lang="ts">
  import { stockTicker, etfTicker, indexTicker } from "$lib/store";
  import InfoModal from "$lib/components/InfoModal.svelte";
  import { get } from "svelte/store";
  import { formatDate } from "$lib/utils";

  export let data;

  let wiim = [];
  let showFullHistory = false;

  function latestInfoDate(inputDate) {
    // Create a Date object for the input date and convert it to New York time zone
    const inputDateLocal = new Date(inputDate).toLocaleString("en-US", {
      timeZone: "America/New_York",
    });

    // Get the current date and time in New York timezone
    const todayLocal = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
    });

    // Convert the localized strings back to Date objects
    const inputDateMs = new Date(inputDateLocal).getTime();
    const todayMs = new Date(todayLocal).getTime();

    // Calculate the difference in milliseconds
    const differenceInMs = todayMs - inputDateMs;

    // Convert milliseconds to days
    const differenceInDays = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));

    // Return whether the difference is less than or equal to 1 day
    return differenceInDays <= 1;
  }

  $: {
    if (get(stockTicker) || get(etfTicker) || get(indexTicker)) {
      showFullHistory = false;
      wiim = data?.getWhyPriceMoved || [];
    }
  }
</script>

<section class="overflow-hidden text-muted dark:text-white h-full mt-5">
  <main class="overflow-hidden">
    <div class="flex flex-row items-center">
      <label
        for="whyPriceMovedInfo"
        class="mr-1 cursor-pointer flex flex-row items-center text-2xl font-bold"
      >
        <h2>Why Price Moved</h2>
      </label>
      <InfoModal
        title={"Why Price Moved"}
        content={"Why Price Moved is a one-sentence explanation of why a stock is moving higher or down. By removing noise and collecting signals from news, press releases and SEC filings, we can pinpoint the trigger for price movements."}
        id={"whyPriceMovedInfo"}
      />
    </div>

    {#if wiim?.length !== 0}
      <div class="mt-5">
        {#each showFullHistory ? wiim : wiim?.slice(0, 2) as item, index}
          <div
            class="w-full {index === 1 && !showFullHistory && wiim?.length > 2
              ? 'opacity-[0.5]'
              : ''} "
          >
            <div class="relative">
              <div class="">
                <div class="flex justify-center">
                  <!--Start Item-->
                  <div class="flex flex-row items-center w-full mb-8">
                    <!-- Vertical Line -->
                    <div
                      class="w-1 h-full mr-4 rounded-lg {item?.changesPercentage ===
                      '-'
                        ? 'bg-white'
                        : item?.changesPercentage >= 0
                          ? 'bg-green-600 dark:bg-[#00FC50]'
                          : 'bg-red-600 dark:bg-[#FF2F1F]'}"
                    ></div>
                    <!-- Item Content -->

                    <div class="w-full h-full">
                      <div class="flex flex-col items-start">
                        <div class="flex flex-row items-start w-full">
                          <span class=" text-sm"
                            >{formatDate(item?.date)}
                            <!--
                            &#183;
                            <a
                              href={item?.url}
                              class="inline-block text-sm  sm:hover:underline sm:hover:underline-offset-4"
                            >
                              Source
                            </a>
                            -->
                          </span>
                          {#if latestInfoDate(item?.date)}
                            <label
                              class="shadow bg-blue-100 border border-gray-200 dark:border-0 dark:bg-[#fff] rounded text-black font-semibold text-xs px-2 py-0.5 ml-3"
                              >New</label
                            >
                          {/if}
                          <div class=" text-sm sm:text-[1rem] ml-auto">
                            {#if item?.changesPercentage >= 0}
                              <span
                                class="text-green-600 dark:text-[#00FC50] inline-block"
                                >+{item?.changesPercentage}%</span
                              >
                              <svg
                                class="w-5 h-5 hidden sm:inline-block"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                transform="rotate(180)matrix(-1, 0, 0, 1, 0, 0)"
                                ><g id="SVGRepo_bgCarrier" stroke-width="0"
                                ></g><g
                                  id="SVGRepo_tracerCarrier"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                ></g><g id="SVGRepo_iconCarrier">
                                  <g clip-path="url(#clip0_1076_36065)">
                                    <path
                                      d="M1.70711 5.29289C1.31658 4.90237 0.683417 4.90237 0.292893 5.29289C-0.0976311 5.68342 -0.0976311 6.31658 0.292893 6.70711L7.79289 14.2071C8.18342 14.5976 8.81658 14.5976 9.20711 14.2071L13.5 9.91421L20.5858 17H17C16.4477 17 16 17.4477 16 18C16 18.5523 16.4477 19 17 19H22.9993L23.003 19C23.1375 18.9996 23.2657 18.9727 23.3828 18.9241C23.5007 18.8753 23.6112 18.803 23.7071 18.7071C23.8902 18.524 23.9874 18.2877 23.9989 18.048C23.9996 18.032 24 18.016 24 18V12C24 11.4477 23.5523 11 23 11C22.4477 11 22 11.4477 22 12V15.5858L14.2071 7.79289C13.8166 7.40237 13.1834 7.40237 12.7929 7.79289L8.5 12.0858L1.70711 5.29289Z"
                                      fill="#00FC50"
                                    ></path>
                                  </g>
                                  <defs>
                                    <clipPath id="clip0_1076_36065">
                                      <rect
                                        width="24"
                                        height="24"
                                        fill="#00FC50"
                                      ></rect>
                                    </clipPath>
                                  </defs>
                                </g></svg
                              >
                            {:else if item?.changesPercentage < 0}
                              <span
                                class="text-red-600 dark:text-[#FF2F1F] inline-block"
                                >{item?.changesPercentage}%
                              </span>
                              <svg
                                class="w-5 h-5 hidden sm:inline-block"
                                viewBox="0 0 24 24"
                                fill="#FF2F1F"
                                xmlns="http://www.w3.org/2000/svg"
                                ><g id="SVGRepo_bgCarrier" stroke-width="0"
                                ></g><g
                                  id="SVGRepo_tracerCarrier"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                ></g><g id="SVGRepo_iconCarrier">
                                  <g clip-path="url(#clip0_1076_36065)">
                                    <path
                                      d="M1.70711 5.29289C1.31658 4.90237 0.683417 4.90237 0.292893 5.29289C-0.0976311 5.68342 -0.0976311 6.31658 0.292893 6.70711L7.79289 14.2071C8.18342 14.5976 8.81658 14.5976 9.20711 14.2071L13.5 9.91421L20.5858 17H17C16.4477 17 16 17.4477 16 18C16 18.5523 16.4477 19 17 19H22.9993L23.003 19C23.1375 18.9996 23.2657 18.9727 23.3828 18.9241C23.5007 18.8753 23.6112 18.803 23.7071 18.7071C23.8902 18.524 23.9874 18.2877 23.9989 18.048C23.9996 18.032 24 18.016 24 18V12C24 11.4477 23.5523 11 23 11C22.4477 11 22 11.4477 22 12V15.5858L14.2071 7.79289C13.8166 7.40237 13.1834 7.40237 12.7929 7.79289L8.5 12.0858L1.70711 5.29289Z"
                                      fill="#FF2F1F"
                                    ></path>
                                  </g>
                                  <defs>
                                    <clipPath id="clip0_1076_36065">
                                      <rect
                                        width="24"
                                        height="24"
                                        fill="#FF2F1F"
                                      ></rect>
                                    </clipPath>
                                  </defs>
                                </g></svg
                              >
                            {/if}
                          </div>
                        </div>

                        <div class="flex flex-col w-full pt-2">
                          {#if index === 0 && !["Pro", "Plus"]?.includes(data?.user?.tier)}
                            <span class="mt-3">
                              {item?.text?.slice(0, 50) + "..."}
                              Unlock content with
                              <a
                                class="inline-block ml-0.5 text-blue-500 sm:hover:text-muted dark:text-blue-400 dark:sm:hover:text-white"
                                href="/pricing"
                                >Pro Subscription <svg
                                  class="w-4 h-4 mb-1 inline-block"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  ><path
                                    fill="currentColor"
                                    d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                                  /></svg
                                ></a
                              >
                            </span>
                          {:else}
                            <span class=" text-[1rem]">
                              {item?.text}
                            </span>
                          {/if}
                        </div>
                      </div>
                    </div>
                  </div>
                  <!--End Item-->
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>

      {#if wiim?.length > 2}
        <label
          on:click={() => (showFullHistory = !showFullHistory)}
          class="cursor-pointer flex justify-center items-center mt-5"
        >
          <svg
            class="w-10 h-10 transform text-gray-400 dark:text-[#2A323C] {showFullHistory
              ? 'rotate-180'
              : ''} "
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            ><path
              fill="currentColor"
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 13.5L7.5 11l1.42-1.41L12 12.67l3.08-3.08L16.5 11L12 15.5z"
            /></svg
          >
        </label>
      {/if}
    {/if}
  </main>
</section>
