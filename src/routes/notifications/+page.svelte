<script lang="ts">
  import { formatDate } from "$lib/utils";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";
  import HoverStockChart from "$lib/components/HoverStockChart.svelte";
  import { onMount } from "svelte";
  import { numberOfUnreadNotification } from "$lib/store";
  import SEO from "$lib/components/SEO.svelte";
  import Infobox from "$lib/components/Infobox.svelte";

  export let data;
  export let form;

  let rawData = data?.getNotifications;
  let notificationList = rawData?.slice(0, 20);

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;
    if (isBottom && notificationList?.length !== rawData?.length) {
      const nextIndex = notificationList?.length;
      const filteredNewResults = rawData?.slice(nextIndex, nextIndex + 25);
      notificationList = [...notificationList, ...filteredNewResults];
    }
  }

  async function updateNotifications() {
    let notificationIdList = [];

    for (let i = 0; i < notificationList?.length; i++) {
      if (notificationList[i]?.readed == false) {
        notificationIdList?.push(notificationList[i]?.id);
      }
    }

    if (notificationIdList.length !== 0) {
      const postData = {
        unreadList: notificationIdList,
      };

      await fetch("/api/update-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      $numberOfUnreadNotification = 0;
    }
  }

  onMount(async () => {
    await updateNotifications();
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });
</script>

<SEO
  title="Stock Market Notifications | Real-Time Updates & Alerts"
  description="Stay informed with real-time stock market notifications. Get instant alerts on price changes, trends, and market movements to make smarter investment decisions."
/>

<section
  class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden min-h-screen pb-20 pt-5 px-4 lg:px-3"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">Notifications</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4 lg:pr-10">
          <div class="mb-3 border-b-[2px]">
            <h1 class="mb-1 text-white text-2xl sm:text-3xl font-bold">
              Notification
            </h1>
          </div>

          <div class="mb-4">
            <Infobox
              text="Personalize your notifications on your account page."
            />
          </div>

          {#if notificationList?.length !== 0}
            <div class="flex flex-col items-start w-full text-white">
              {#each notificationList as item}
                {#if item?.notifyType === "priceAlert"}
                  <!-- svelte-ignore a11y-click-events-have-key-events -->
                  <div
                    class=" pb-3 sm:p-3 mb-6 sm:mb-3 text-white w-full {!item?.readed
                      ? 'bg-[#F9AB00]/10'
                      : ''} "
                  >
                    <div class="flex flex-row items-center w-full">
                      <!-- svelte-ignore a11y-label-has-associated-control -->
                      <a class="avatar w-8 h-8 shrink-0 mr-4">
                        <img
                          style="clip-path: circle(50%);"
                          class="shrink-0 w-8 h-8 rounded-full inline-block"
                          src={`https://financialmodelingprep.com/image-stock/${item?.liveResults?.symbol}.png`}
                          alt="Company Logo"
                        />
                      </a>

                      <div class="text-white text-sm sm:text-[1rem]">
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <div class="flex flex-col items-start">
                          <div>
                            <div class="flex flex-col items-start">
                              <div class="text-md mt-0.5">
                                Price Alert triggered for <HoverStockChart
                                  symbol={item?.liveResults?.symbol}
                                  assetType={item?.liveResults?.assetType}
                                />
                              </div>
                              <div class="text-md mt-0.5">
                                The price of <span class="font-semibold"
                                  >{item?.liveResults?.currentPrice}</span
                                >
                                is {item?.liveResults?.condition} your target of
                                <span class="font-semibold"
                                  >{item?.liveResults?.targetPrice}</span
                                >
                              </div>
                            </div>
                          </div>
                          <span class="text-sm mt-1 text-[#A6ADBB0"
                            >{formatDate(item?.created)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                {:else if item?.notifyType === "wiim"}
                  <!-- svelte-ignore a11y-click-events-have-key-events -->
                  <div
                    class=" pb-3 sm:p-3 mb-6 sm:mb-3 text-white w-full {!item?.readed
                      ? 'bg-[#F9AB00]/10'
                      : ''} "
                  >
                    <div class="flex flex-row items-center w-full">
                      <!-- svelte-ignore a11y-label-has-associated-control -->
                      <a class="avatar w-8 h-8 shrink-0 mr-4">
                        <img
                          style="clip-path: circle(50%);"
                          class="shrink-0 w-8 h-8 rounded-full inline-block"
                          src={`https://financialmodelingprep.com/image-stock/${item?.liveResults?.symbol}.png`}
                          alt="Company Logo"
                        />
                      </a>

                      <div class="text-white text-sm sm:text-[1rem]">
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <div class="flex flex-col items-start">
                          <div>
                            <div class="flex flex-col items-start">
                              <div class="text-md mt-0.5">
                                <span class="font-semibold"
                                  >BREAKING News for</span
                                >
                                <HoverStockChart
                                  symbol={item?.liveResults?.symbol}
                                  assetType={item?.liveResults?.assetType}
                                />
                              </div>
                              <div class="text-md mt-0.5">
                                New data for "Why Price Moved" event is out.
                              </div>
                            </div>
                          </div>
                          <span class="text-sm mt-1 text-[#A6ADBB0"
                            >{formatDate(item?.created)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                {:else if item?.notifyType === "topAnalyst"}
                  <div
                    class=" pb-3 sm:p-3 mb-6 sm:mb-3 text-white w-full {!item?.readed
                      ? 'bg-[#F9AB00]/10'
                      : ''} "
                  >
                    <div class="flex flex-row items-center w-full">
                      <!-- svelte-ignore a11y-label-has-associated-control -->
                      <a class="avatar w-8 h-8 shrink-0 mr-4">
                        <img
                          style="clip-path: circle(50%);"
                          class="shrink-0 w-8 h-8 rounded-full inline-block"
                          src={`https://financialmodelingprep.com/image-stock/${item?.liveResults?.symbol}.png`}
                          alt="Company Logo"
                        />
                      </a>

                      <div class="text-white text-sm sm:text-[1rem]">
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <div class="flex flex-col items-start">
                          <div>
                            <div class="flex flex-col items-start">
                              <div class="text-md mt-0.5">
                                <span class="font-semibold"
                                  >New Top Analyst Rating for</span
                                >
                                <HoverStockChart
                                  symbol={item?.liveResults?.symbol}
                                  assetType={item?.liveResults?.assetType}
                                  link="forecast/analyst"
                                />
                              </div>
                              <div class="text-md mt-0.5">
                                The rating company {item?.liveResults?.analyst} has
                                issued a new rating of „{item?.liveResults
                                  ?.rating_current}“ with an updated price
                                target of ${item?.liveResults
                                  ?.adjusted_pt_current}.
                              </div>
                            </div>
                          </div>
                          <span class="text-sm mt-1 text-[#A6ADBB0"
                            >{formatDate(item?.created)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                {:else if item?.notifyType === "earningsSurprise"}
                  <div
                    class=" pb-3 sm:p-3 mb-6 sm:mb-3 text-white w-full {!item?.readed
                      ? 'bg-[#F9AB00]/10'
                      : ''} "
                  >
                    <div class="flex flex-row items-center w-full">
                      <!-- svelte-ignore a11y-label-has-associated-control -->
                      <a class="avatar w-8 h-8 shrink-0 mr-4">
                        <img
                          style="clip-path: circle(50%);"
                          class="shrink-0 w-8 h-8 rounded-full inline-block"
                          src={`https://financialmodelingprep.com/image-stock/${item?.liveResults?.symbol}.png`}
                          alt="Company Logo"
                        />
                      </a>

                      <div class="text-white text-sm sm:text-[1rem]">
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <div class="flex flex-col items-start">
                          <div>
                            <div class="flex flex-col items-start">
                              <div class="text-md mt-0.5">
                                <span class="font-semibold"
                                  >Earnings Release for</span
                                >
                                <HoverStockChart
                                  symbol={item?.liveResults?.symbol}
                                  assetType={item?.liveResults?.assetType}
                                />
                              </div>
                              <div class="text-md mt-0.5">
                                New data for "Earnings Surprise" event is out.
                              </div>
                            </div>
                          </div>
                          <span class="text-sm mt-1 text-[#A6ADBB0"
                            >{formatDate(item?.created)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                {/if}
              {/each}
            </div>
          {:else}
            <div
              class="mt-5 text-white font-semibold text-[1rem] justify-center items-center m-auto"
            >
              Empty just like our souls...
              <svg
                class="inline-block w-4 h-4 m-auto mb-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1200 1200"
                ><path
                  fill="white"
                  d="M567.663 0v190.423h64.679V0h-64.685h.006zm-264.11 57.225l-52.992 37.103l109.203 155.946l52.963-37.104L303.553 57.225zm592.886 0L787.268 213.171l52.971 37.104L949.44 94.328l-52.992-37.103h-.009zm-296.45 185.299c-158.227 0-286.493 96.083-286.493 214.625l162.772 492.948h247.47l162.758-492.948c0-118.54-128.258-214.625-286.492-214.625h-.015zM85.465 299.673l-22.099 60.814l178.849 65.114l22.181-60.785l-178.935-65.143h.004zm1029.062 0l-178.936 65.148l22.106 60.792l178.936-65.125l-22.106-60.815zM255.756 577.681l-183.9 49.326l16.686 62.431l183.9-49.255l-16.683-62.502h-.003zm688.48 0l-16.674 62.501l183.9 49.247l16.674-62.432l-183.9-49.318v.002zM472.66 986.032v85.686h254.687v-85.673H472.661l-.001-.013zm0 128.282V1200h254.687v-85.672H472.661l-.001-.014z"
                /></svg
              >
            </div>
          {/if}
        </main>

        <aside class="hidden lg:block relative fixed w-1/4 ml-4">
          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-inherit sm:hover:bg-secondary transition ease-out duration-100"
          >
            <a
              href="/watchlist/stocks"
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Watchlist
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Get realtime updates of your favorite stocks
              </span>
            </a>
          </div>

          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-inherit sm:hover:bg-secondary transition ease-out duration-100"
          >
            <a
              href="/reddit-tracker"
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Reddit Tracker
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Get the latest trends of r/Wallstreetbets
              </span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  </div>
</section>
