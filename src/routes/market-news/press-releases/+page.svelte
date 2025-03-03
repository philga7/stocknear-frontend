<script lang="ts">
  import { numberOfUnreadNotification } from "$lib/store";
  import { onMount } from "svelte";

  export let data;

  let rawData = data?.getPressNews;
  let stockNews = data?.getStockNews;
  let news = rawData.slice(0, 10) ?? [];

  const formatDate = (dateString) => {
    // Create a date object for the input dateString
    const inputDate = new Date(dateString);

    // Create a date object for the current time in New York City
    const nycTime = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
    });
    const currentNYCDate = new Date(nycTime);

    // Calculate the difference in milliseconds
    const difference = inputDate.getTime() - currentNYCDate.getTime();

    // Convert the difference to minutes
    const minutes = Math.abs(Math.round(difference / (1000 * 60)));

    if (minutes < 60) {
      return `${minutes} minutes`;
    } else if (minutes < 1440) {
      const hours = Math.round(minutes / 60);
      return `${hours} hour${hours !== 1 ? "s" : ""}`;
    } else {
      const days = Math.round(minutes / 1440);
      return `${days} day${days !== 1 ? "s" : ""}`;
    }
  };

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;
    if (isBottom && news?.length !== rawData?.length) {
      const nextIndex = news?.length;
      const filteredNewResults = rawData?.slice(nextIndex, nextIndex + 25);
      news = [...news, ...filteredNewResults];
    }
  }

  onMount(async () => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>
    {$numberOfUnreadNotification > 0 ? `(${$numberOfUnreadNotification})` : ""} Press
    Releases From Publicly Traded Companies · Stocknear
  </title>
  <meta
    name="description"
    content={`Press releases for publicly traded companies on the US stock market. Includes important company events, earnings releases and more.`}
  />

  <!-- Other meta tags -->
  <meta
    property="og:title"
    content={`TPress Releases From Publicly Traded Companies · Stocknear`}
  />
  <meta
    property="og:description"
    content={`Press releases for publicly traded companies on the US stock market. Includes important company events, earnings releases and more.`}
  />
  <meta property="og:type" content="website" />
  <!-- Add more Open Graph meta tags as needed -->

  <!-- Twitter specific meta tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={`TPress Releases From Publicly Traded Companies · Stocknear`}
  />
  <meta
    name="twitter:description"
    content={`Press releases for publicly traded companies on the US stock market. Includes important company events, earnings releases and more.`}
  />
  <!-- Add more Twitter meta tags as needed -->
</svelte:head>

<div class="w-full overflow-hidden m-auto mt-5">
  <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
    <div
      class="relative flex justify-center items-start overflow-hidden w-full"
    >
      <main class="w-full lg:w-3/4 lg:pr-5">
        <div class="w-full m-auto">
          <div class="grid grid-cols-1 gap-y-3">
            {#if news.length !== 0}
              {#each news as item}
                <div class="w-full flex flex-col bg-default m-auto">
                  <div class="w-full flex flex-col sm:flex-row">
                    <a
                      href={item?.url}
                      rel="noopener noreferrer"
                      target="_blank"
                      class="w-full sm:max-w-56 h-fit max-h-96 sm:mr-3"
                    >
                      <div class="shrink-0 m-auto">
                        <img
                          src={item?.image}
                          class="h-full w-full object-cover rounded"
                          alt="news image"
                          loading="lazy"
                        />
                      </div>
                    </a>

                    <div class="w-full">
                      <h3 class="text-sm text-white/80 truncate mb-2">
                        {formatDate(item?.publishedDate)} ago · {item?.site}
                      </h3>

                      <a
                        href={item?.url}
                        rel="noopener noreferrer"
                        target="_blank"
                        class="text-lg sm:text-xl font-bold text-white"
                      >
                        {item?.title}
                        <p class="text-white text-sm mt-2 font-normal">
                          {item?.text?.length > 200
                            ? item?.text?.slice(0, 200) + "..."
                            : item?.text}
                        </p>
                      </a>
                      <div class=" mt-2 text-white">
                        <span>Stocks:</span>

                        <a
                          href={"/stocks/" + item?.symbol}
                          class="px-2.5 text-sm py-0.5 rounded-md bg-white/10 sm:hover:bg-white/20 ml-1"
                        >
                          {item?.symbol}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <hr class="border-gray-600 w-full m-auto mt-3 mb-5" />
              {/each}
            {/if}
          </div>
        </div>
      </main>
      <aside class="hidden lg:block relative fixed w-1/4">
        {#if stockNews?.length !== 0}
          <div
            class="w-full sm:hover:text-white text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-inherit"
          >
            <div class="p-4 text-sm">
              <h3 class="text-xl text-white font-bold mb-3">Stock News</h3>
              <ul class="text-white">
                {#each stockNews?.slice(0, 10) as item}
                  <li class="mb-3 last:mb-1">
                    {formatDate(item?.publishedDate)} ago -
                    <a
                      class="sm:hover:text-white text-blue-400"
                      href={item?.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow">{item?.title}</a
                    >
                    - {item?.site}
                  </li>
                {/each}
              </ul>
            </div>
          </div>
        {/if}
      </aside>
    </div>
  </div>
</div>
