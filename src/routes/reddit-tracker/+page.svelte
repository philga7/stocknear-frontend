<script lang="ts">
  import { screenWidth } from "$lib/store";
  import * as Card from "$lib/components/shadcn/card/index.ts";
  import * as Table from "$lib/components/shadcn/table/index.ts";
  import HoverStockChart from "$lib/components/HoverStockChart.svelte";
  //import UpgradeToPro from '$lib/components/UpgradeToPro.svelte';
  import Link from "lucide-svelte/icons/external-link";
  import ThumbsUp from "lucide-svelte/icons/thumbs-up";
  import MessageCircle from "lucide-svelte/icons/message-circle";
  import Lazy from "$lib/components/Lazy.svelte";

  import ArrowLogo from "lucide-svelte/icons/move-up-right";
  import SEO from "$lib/components/SEO.svelte";

  export let data;

  let timePeriod = "oneWeek";

  const today = new Date();
  const options = { month: "short", day: "numeric", year: "numeric" };
  const formattedDate = today.toLocaleDateString("en-US", options);

  function formatUtcTimestamp(timestamp) {
    // Create a Date object from the UTC timestamp (in seconds)
    let date = new Date(timestamp * 1000);

    // Define arrays for month names
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Extract date components
    let day = date.getUTCDate();
    let month = monthNames[date.getUTCMonth()];
    let year = date.getUTCFullYear();
    let hours = date.getUTCHours();
    let minutes = date.getUTCMinutes();

    // Format minutes to always be two digits
    minutes = minutes < 10 ? "0" + minutes : minutes;

    // Determine AM or PM suffix and adjust hours for 12-hour format
    let amPm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    // Construct formatted date string
    let formattedDate = `${day} ${month} ${year}, ${hours}:${minutes} ${amPm}`;

    return formattedDate;
  }

  function removeHttpsStrings(input) {
    // Split the input string by spaces
    let words = input?.split(" ");

    // Filter out words that contain "https"
    let filteredWords = words?.filter((word) => !word?.includes("https"));

    // Join the filtered words back into a single string
    let output = filteredWords?.join(" ");

    return output;
  }

  let activeIdx = 0;

  const tabs = [
    {
      title: "Week",
    },
    {
      title: "Month",
    },
    {
      title: "3 Months",
    },
  ];

  function changeTimePeriod(state) {
    activeIdx = state;
    if (activeIdx === 0) {
      timePeriod = "oneWeek";
    } else if (activeIdx === 1) {
      timePeriod = "oneMonth";
    } else if (activeIdx === 2) {
      timePeriod = "threeMonths";
    }
  }
</script>

<SEO
  title="Reddit Stock Tracker - WSB Analytics & Insights"
  description="Track WallStreetBets stock discussions and trends in real-time. Get detailed analytics, sentiment analysis, and trading insights from Reddit's largest stock community."
/>

<section
  class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden min-h-screen pb-20 pt-5 px-4 lg:px-3 text-muted dark:text-white"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-muted dark:text-gray-300">Home</a></li>
      <li class="text-muted dark:text-gray-300">Reddit Tracker</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4 lg:pr-5">
          <div class="mb-6 border-[#2C6288] dark:border-white border-b-[2px]">
            <h1 class="mb-1 text-2xl sm:text-3xl font-bold">
              Wallsteetbets Tracker
            </h1>
          </div>

          <div class="grid gap-4 md:gap-8 grid-cols-1 text-start">
            <Lazy>
              <div class="order-1 overflow-x-auto h-full mt-5 sm:mt-0">
                <div class="flex flex-row items-center">
                  <div class="flex flex-col items-start w-full">
                    <div class="flex flex-row w-full items-center">
                      <div
                        class="text-start text-xl w-full flex flex-row items-center mb-3"
                      >
                        <span class="font-semibold">Trending Posts</span>
                        <span class="text-sm ml-auto font-normal italic"
                          >Updated {formattedDate}</span
                        >
                      </div>
                    </div>
                  </div>
                </div>
                <div class="">
                  {#each data?.getRedditTracker?.posts as item}
                    <div
                      class="flex flex-col items-start mb-3 p-3 border border-gray-300 dark:border-gray-800 rounded shadow-xs border-gray-200 dark:bg-[#141417]"
                    >
                      <a
                        href={"https://www.reddit.com" + item?.permalink}
                        rel="noopener noreferrer"
                        target="_blank"
                        class="text-[1rem] sm:text-xl font-semibold mb-3 transition duration-100 sm:hover:text-blue-700 dark:sm:hover:text-blue-400"
                      >
                        {item?.title}
                      </a>

                      {#if item?.selftext?.length !== 0}
                        <div class="text-sm sm:text-[1rem] mb-3">
                          {#if $screenWidth < 640}
                            {item?.selftext?.length > 400
                              ? removeHttpsStrings(item?.selftext)?.slice(
                                  0,
                                  240,
                                ) + "..."
                              : removeHttpsStrings(item?.selftext)}
                          {:else}
                            {item?.selftext?.length > 1000
                              ? removeHttpsStrings(item?.selftext)?.slice(
                                  0,
                                  800,
                                ) + "..."
                              : removeHttpsStrings(item?.selftext)}
                          {/if}
                        </div>
                      {/if}

                      <div class="flex flex-row items-center mb-5 mt-3">
                        <label class="mr-4 text-sm">
                          <ThumbsUp
                            class="h-5 w-5 inline-block -mt-1 shrink-0 mr-1"
                          />
                          {item?.upvote_ratio}%
                        </label>
                        <label class="text-sm">
                          <MessageCircle
                            class="h-5 w-5 inline-block -mt-1 shrink-0 mr-1"
                          />
                          {item?.num_comments?.toLocaleString("en-US")}
                        </label>
                      </div>

                      <label
                        class="mt-2 mb-2 text-sm bg-white rounded px-3 py-1 text-black"
                      >
                        {item?.link_flair_text}
                      </label>
                      {#if item?.thumbnail !== null && item?.thumbnail}
                        <div class="relative m-auto mt-4">
                          <div
                            class="absolute inset-0 bg-cover object-fill bg-center bg-[#000]"
                          ></div>

                          <!--<div class="absolute -inset-3 md:-inset-y-20 md:mt-10 bg-cover object-contain blur-[40px]" style="clip-path: polygon(0 0, 100% 0, 100% 90%, 0 90%); background-image: url('{getImageURL(posts.collectionId, posts.id, posts.thumbnail)}');"></div>-->
                          <img
                            src={item?.thumbnail}
                            alt="post image"
                            class="m-auto w-auto relative max-h-[520px] sm:max-h-[700px] rounded"
                            style="position: relative;"
                            loading="lazy"
                          />
                        </div>
                      {/if}

                      <div
                        class="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full mt-3"
                      >
                        <a
                          href={"https://www.reddit.com/user/" + item?.author}
                          rel="noopener noreferrer"
                          target="_blank"
                          class="hidden sm:inline-block text-sm sm:hover:text-blue-700 dark:sm:hover:text-blue-400"
                        >
                          Posted by {item?.author}
                        </a>
                        <a
                          href={"https://www.reddit.com" + item?.permalink}
                          rel="noopener noreferrer"
                          target="_blank"
                          class="mt-2 sm:mt-0 text-sm sm:hover:text-blue-700 dark:sm:hover:text-blue-400"
                        >
                          {formatUtcTimestamp(item?.created_utc)}
                          <Link
                            class="h-3 w-3 inline-block shrink-0 -mt-1 ml-1"
                          />
                        </a>
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            </Lazy>
            <Card.Root class="order-0 overflow-x-auto no-scrollbar">
              <Card.Header>
                <div
                  class="text-start text-xl w-full flex flex-col sm:flex-row items-start sm:items-center mb-3"
                >
                  <span class="font-semibold">Trending Companies</span>
                  <span
                    class="text-sm mt-2 sm:mt-0 sm:ml-auto font-normal italic"
                    >Updated {formattedDate}</span
                  >
                </div>
                <nav
                  class="border-[#2C6288] dark:border-white border-b-[2px] overflow-x-auto whitespace-nowrap"
                >
                  <ul
                    class="flex flex-row items-center w-full text-sm sm:text-[1rem]"
                  >
                    {#each tabs as item, index}
                      {#if ["Pro", "Plus"]?.includes(data?.user?.tier) || index === 0}
                        <label
                          on:click={() => changeTimePeriod(index)}
                          class="p-2 px-5 cursor-pointer {activeIdx === index
                            ? 'text-muted dark:text-white bg-[#EEEEEE] dark:bg-primary/90 font-semibold'
                            : 'text-gray-600 dark:text-gray-400 sm:hover:text-muted dark:sm:hover:text-white sm:hover:bg-[#EEEEEE] dark:sm:hover:bg-primary/90'}"
                        >
                          {item.title}
                        </label>
                      {:else if !["Pro", "Plus"]?.includes(data?.user?.tier)}
                        <a
                          href="/pricing"
                          class="p-2 px-5 cursor-pointer flex flex-row items-center {activeIdx ===
                          index
                            ? 'text-muted dark:text-white bg-[#EEEEEE] dark:bg-primary/90 font-semibold'
                            : 'text-gray-600 dark:text-gray-400 sm:hover:text-muted dark:sm:hover:text-white sm:hover:bg-[#EEEEEE] dark:sm:hover:bg-primary/90'}"
                        >
                          <span class="">{item.title}</span>
                          <svg
                            class="ml-2 w-3.5 h-3.5 inline-block"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            ><path
                              fill="currentColor"
                              d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                            /></svg
                          >
                        </a>
                      {/if}
                    {/each}
                  </ul>
                </nav>
              </Card.Header>
              <Card.Content class="grid gap-y-4">
                <Table.Root class="overflow-x-auto w-full">
                  <Table.Header>
                    <Table.Row>
                      <Table.Head class=" text-sm font-semibold"
                        >Rank</Table.Head
                      >
                      <Table.Head class=" text-sm font-semibold"
                        >Symbol</Table.Head
                      >
                      <Table.Head class=" text-sm font-semibold text-end"
                        >Mentions</Table.Head
                      >
                      <Table.Head class=" text-sm font-semibold text-end"
                        >Calls</Table.Head
                      >
                      <Table.Head class=" text-sm font-semibold text-end"
                        >Puts</Table.Head
                      >
                      <Table.Head class=" text-sm font-semibold text-end"
                        >Sentiment</Table.Head
                      >
                      <Table.Head class=" text-sm font-semibold text-end"
                        >Price</Table.Head
                      >
                      <Table.Head
                        class=" text-sm text-right  font-semibold whitespace-nowrap"
                        >% Change</Table.Head
                      >
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {#each data?.getRedditTracker?.trending[timePeriod]?.slice(0, 5) as item, index}
                      <Table.Row>
                        <Table.Cell class="text-left text-[1rem]">
                          {index + 1}
                        </Table.Cell>
                        <Table.Cell>
                          <div class="flex flex-col items-start text-[1rem]">
                            <HoverStockChart
                              symbol={item?.symbol}
                              assetType={item?.assetType}
                            />
                            <span class="whitespace-wrap hidden sm:block">
                              {item?.name}
                            </span>
                          </div>
                        </Table.Cell>
                        <Table.Cell class="text-right text-[1rem] "
                          >{item?.count}</Table.Cell
                        >
                        <Table.Cell
                          class="text-right text-[1rem] text-green-800 dark:text-[#00FC50]"
                          >{item?.call}</Table.Cell
                        >
                        <Table.Cell
                          class="text-right text-[1rem] text-red-800 dark:text-[#FF2F1F]"
                          >{item?.put}</Table.Cell
                        >
                        <Table.Cell
                          class="text-right text-[1rem]  {item?.avgSentiment >
                          0.4
                            ? 'text-green-800 dark:text-[#00FC50]'
                            : item?.avgSentiment < -0.1
                              ? 'text-red-800 dark:text-[#FF2F1F]'
                              : 'text-yellow-600 dark:text-[#C6A755]'} "
                          >{item?.avgSentiment > 0.4
                            ? "Bullish"
                            : item?.avgSentiment <= -0.1
                              ? "Bearish"
                              : "Neutral"}</Table.Cell
                        >

                        <Table.Cell class="text-right text-[1rem] "
                          >{item?.price?.toFixed(2)}</Table.Cell
                        >

                        <Table.Cell class="text-right text-[1rem] ">
                          <span
                            class="{item?.changesPercentage > 0
                              ? 'text-green-800 dark:text-[#00FC50]'
                              : 'text-red-800 dark:text-[#FF2F1F]'} text-end"
                          >
                            {#if item?.changesPercentage > 0}
                              +{item?.changesPercentage?.toFixed(2)}%
                            {:else}
                              {item?.changesPercentage?.toFixed(2)}%
                            {/if}
                          </span>
                        </Table.Cell>
                      </Table.Row>
                    {/each}
                  </Table.Body>
                </Table.Root>
              </Card.Content>
            </Card.Root>
          </div>
        </main>

        <aside class="hidden lg:block relative fixed w-1/4 ml-4">
          <div
            class="w-full border border-gray-300 dark:border-gray-600 rounded h-fit pb-4 mt-4 cursor-pointer sm:hover:shadow-lg dark:sm:hover:bg-secondary transition ease-out duration-100"
          >
            <a
              href="/potus-tracker"
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-bold ml-3">POTUS Tracker</h2>
                <ArrowLogo
                  class="w-8 h-8 mr-3 shrink-0 text-gray-400 dark:text-white"
                />
              </div>
              <span class=" p-3 ml-3 mr-3">
                Follow the latest executive orders of the US President
              </span>
            </a>
          </div>

          <div
            class="w-full border border-gray-300 dark:border-gray-600 rounded h-fit pb-4 mt-4 cursor-pointer sm:hover:shadow-lg dark:sm:hover:bg-secondary transition ease-out duration-100"
          >
            <a
              href="/insider-tracker"
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-bold ml-3">
                  Insider Tracker
                </h2>
                <ArrowLogo
                  class="w-8 h-8 mr-3 shrink-0 text-gray-400 dark:text-white"
                />
              </div>
              <span class=" p-3 ml-3 mr-3">
                Get the latest unusual insider trading in realtime
              </span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  </div>
</section>
