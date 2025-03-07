<script lang="ts">
  import { screenWidth } from "$lib/store";
  import { onMount } from "svelte";
  import * as Card from "$lib/components/shadcn/card/index.ts";
  import * as Table from "$lib/components/shadcn/table/index.ts";
  import HoverStockChart from "$lib/components/HoverStockChart.svelte";
  //import UpgradeToPro from '$lib/components/UpgradeToPro.svelte';
  import { abbreviateNumber } from "$lib/utils";
  import { Chart } from "svelte-echarts";
  import Link from "lucide-svelte/icons/external-link";
  import ThumbsUp from "lucide-svelte/icons/thumbs-up";
  import MessageCircle from "lucide-svelte/icons/message-circle";
  import Lazy from "$lib/components/Lazy.svelte";
  import { init, use } from "echarts/core";
  import { LineChart, BarChart } from "echarts/charts";
  import { GridComponent, TooltipComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";
  import SEO from "$lib/components/SEO.svelte";

  use([LineChart, BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

  export let data;
  let isLoaded = false;
  let optionGraphPost;
  let optionGraphComment;
  let postList = [];
  let commentList = [];
  let timePeriod = "oneDay";

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

  function getPlotOptions() {
    let rawData = data?.getRedditTracker?.stats;
    rawData = rawData?.sort((a, b) => new Date(a?.date) - new Date(b?.date));
    let dates = [];

    rawData?.forEach((item) => {
      dates?.push(item?.date);
      postList?.push(item?.totalPosts);
      commentList?.push(item?.totalComments);
    });

    const optionPost = {
      silent: true,
      animation: false,
      tooltip: {
        trigger: "axis",
        hideDelay: 100, // Set the delay in milliseconds
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "0%",
        top: $screenWidth < 640 ? "20%" : "10%",
        containLabel: true,
      },
      xAxis: [
        {
          type: "category",
          boundaryGap: false,
          splitLine: {
            show: false, // Disable x-axis grid lines
          },
          data: dates,
          axisLabel: {
            show: false, // Hide x-axis labels
          },
        },
      ],
      yAxis: [
        {
          type: "value",
          splitLine: {
            show: false, // Disable x-axis grid lines
          },
          axisLabel: {
            show: false, // Hide y-axis labels
          },
        },
      ],
      series: [
        {
          name: "Total Posts",
          type: "line",
          smooth: true,
          lineStyle: {
            width: 0,
          },
          showSymbol: false,
          areaStyle: {
            opacity: 1,
            color: "#3B82F6",
          },
          emphasis: {
            focus: "series",
          },
          data: postList,
        },
      ],
    };

    const optionComment = {
      silent: true,
      animation: false,
      tooltip: {
        trigger: "axis",
        hideDelay: 100, // Set the delay in milliseconds
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "0%",
        top: $screenWidth < 640 ? "20%" : "10%",
        containLabel: true,
      },
      xAxis: [
        {
          type: "category",
          boundaryGap: false,
          splitLine: {
            show: false, // Disable x-axis grid lines
          },
          data: dates,
          axisLabel: {
            show: false, // Hide x-axis labels
          },
        },
      ],
      yAxis: [
        {
          type: "value",
          splitLine: {
            show: false, // Disable x-axis grid lines
          },
          axisLabel: {
            show: false, // Hide y-axis labels
          },
        },
      ],
      series: [
        {
          name: "Total Comments",
          type: "line",
          smooth: true,
          lineStyle: {
            width: 0,
          },
          showSymbol: false,
          areaStyle: {
            opacity: 1,
            color: "#E11D48",
          },
          emphasis: {
            focus: "series",
          },
          data: commentList,
        },
      ],
    };

    return { optionPost, optionComment };
  }

  onMount(() => {
    const { optionPost, optionComment } = getPlotOptions();
    optionGraphPost = optionPost;
    optionGraphComment = optionComment;
    isLoaded = true;
  });
  let activeIdx = 0;

  const tabs = [
    {
      title: "Today",
    },
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
      timePeriod = "oneDay";
    } else if (activeIdx === 1) {
      timePeriod = "oneWeek";
    } else if (activeIdx === 2) {
      timePeriod = "oneMonth";
    } else if (activeIdx === 3) {
      timePeriod = "threeMonths";
    }
  }
</script>

<SEO
  title="Reddit Stock Tracker - WSB Analytics & Insights"
  description="Track WallStreetBets stock discussions and trends in real-time. Get detailed analytics, sentiment analysis, and trading insights from Reddit's largest stock community."
/>

<section
  class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden min-h-screen pb-20 pt-5 px-4 lg:px-3"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">Reddit Tracker</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4 lg:pr-5">
          <div class="mb-6 border-b-[2px]">
            <h1 class="mb-1 text-white text-2xl sm:text-3xl font-bold">
              Wallsteetbets Tracker
            </h1>
          </div>

          {#if isLoaded}
            <div class=" grid gap-4 grid-cols-1 sm:grid-cols-2 md:gap-8">
              <Card.Root class="bg-[#141417]">
                <Card.Header class="flex flex-col items-start space-y-0 pb-2">
                  <Card.Title
                    class="text-start text-xl sm:text-2xl font-semibold pb-2"
                    >Post Activity</Card.Title
                  >
                  <Card.Description class="text-gray-300 text-sm pb-2"
                    >Number of Posts in the last 24 hours:</Card.Description
                  >
                  <Card.Description class="text-white text-[1rem] pb-2"
                    ><span class="text-[#408FFF] font-bold text-2xl">
                      +{postList?.at(-1)}
                    </span> posts today
                  </Card.Description>
                  <Card.Description class="text-gray-400 text-sm pb-2">
                    {((postList?.at(-1) / postList?.at(-2) - 1) * 100)?.toFixed(
                      0,
                    )}% from yesterday
                  </Card.Description>
                </Card.Header>
                <Card.Content>
                  <Lazy>
                    <div class="app w-full h-[150px]">
                      <Chart {init} options={optionGraphPost} class="chart" />
                    </div>
                  </Lazy>
                </Card.Content>
              </Card.Root>

              <Card.Root class="bg-[#141417]">
                <Card.Header class="flex flex-col items-start space-y-0 pb-2">
                  <Card.Title
                    class="text-start text-xl sm:text-2xl font-semibold pb-2"
                    >Comment Activity</Card.Title
                  >
                  <Card.Description class="text-gray-300 text-sm pb-2"
                    >Number of Comments in the last 24 hours:</Card.Description
                  >
                  <Card.Description class="text-white text-[1rem] pb-2"
                    ><span class="text-[#F71F4F] font-bold text-2xl">
                      +{abbreviateNumber(commentList?.at(-1))}
                    </span> comments today
                  </Card.Description>
                  <Card.Description class="text-gray-400 text-sm pb-2">
                    {(
                      (commentList?.at(-1) / commentList?.at(-2) - 1) *
                      100
                    )?.toFixed(0)}% from yesterday
                  </Card.Description>
                </Card.Header>
                <Card.Content>
                  <Lazy>
                    <div class="app w-full h-[150px]">
                      <Chart
                        {init}
                        options={optionGraphComment}
                        class="chart"
                      />
                    </div>
                  </Lazy>
                </Card.Content>
              </Card.Root>
            </div>

            <div
              class="mt-10 grid gap-4 md:gap-8 grid-cols-1 text-start text-white"
            >
              <Lazy>
                <div class="order-1 overflow-x-auto h-full mt-5 sm:mt-0">
                  <div class="flex flex-row items-center">
                    <div class="flex flex-col items-start w-full">
                      <div class="flex flex-row w-full items-center">
                        <div
                          class="text-start text-xl w-full flex flex-row items-center mb-3"
                        >
                          <span class="font-semibold">Trending Posts</span>
                          <span
                            class="text-sm sm:text-[1rem] ml-auto font-normal"
                            >Updated {formattedDate}</span
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="">
                    {#each data?.getRedditTracker?.posts as item}
                      <div
                        class="flex flex-col items-start mb-3 p-3 border border-gray-800 rounded-md bg-[#141417]"
                      >
                        <a
                          href={"https://www.reddit.com" + item?.permalink}
                          rel="noopener noreferrer"
                          target="_blank"
                          class="text-[1rem] sm:text-xl font-semibold mb-3 transition duration-100 text-white sm:hover:text-blue-400"
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
                          class="mt-2 mb-2 text-sm bg-white rounded-md px-3 py-1 text-black"
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
                            class="hidden sm:inline-block text-sm text-white sm:hover:text-blue-400"
                          >
                            Posted by {item?.author}
                          </a>
                          <a
                            href={"https://www.reddit.com" + item?.permalink}
                            rel="noopener noreferrer"
                            target="_blank"
                            class="mt-2 sm:mt-0 text-sm text-white sm:hover:text-blue-400"
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
                      class="text-sm sm:text-[1rem] mt-2 sm:mt-0 sm:ml-auto font-normal"
                      >Updated {formattedDate}</span
                    >
                  </div>
                  <nav class="border-b-[2px] overflow-x-auto whitespace-nowrap">
                    <ul
                      class="flex flex-row items-center w-full text-sm sm:text-[1rem] text-white"
                    >
                      {#each tabs as item, index}
                        {#if ["Pro", "Plus"]?.includes(data?.user?.tier) || index === 0}
                          <label
                            on:click={() => changeTimePeriod(index)}
                            class="p-2 px-5 cursor-pointer {activeIdx === index
                              ? 'text-white bg-primary/90'
                              : 'text-gray-400 sm:hover:text-white sm:hover:bg-primary/90'}"
                          >
                            {item.title}
                          </label>
                        {:else if !["Pro", "Plus"]?.includes(data?.user?.tier)}
                          <a
                            href="/pricing"
                            class="flex flex-row items-center p-2 px-5 cursor-pointer {activeIdx ===
                            index
                              ? 'text-white bg-primary/90'
                              : 'text-gray-400 sm:hover:text-white sm:hover:bg-primary/90'}"
                          >
                            <span class="">{item.title}</span>
                            <svg
                              class="ml-2 w-3.5 h-3.5"
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
                        <Table.Head class="text-white text-sm font-semibold"
                          >Rank</Table.Head
                        >
                        <Table.Head class="text-white text-sm font-semibold"
                          >Symbol</Table.Head
                        >
                        <Table.Head
                          class="text-white text-sm font-semibold text-end"
                          >Mentions</Table.Head
                        >
                        <Table.Head
                          class="text-white text-sm font-semibold text-end"
                          >Calls</Table.Head
                        >
                        <Table.Head
                          class="text-white text-sm font-semibold text-end"
                          >Puts</Table.Head
                        >
                        <Table.Head
                          class="text-white text-sm font-semibold text-end"
                          >Sentiment</Table.Head
                        >
                        <Table.Head
                          class="text-white text-sm font-semibold text-end"
                          >Price</Table.Head
                        >
                        <Table.Head
                          class="text-white text-sm text-right whitespace-nowrap"
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
                              <span
                                class="text-white whitespace-wrap hidden sm:block"
                              >
                                {item?.name}
                              </span>
                            </div>
                          </Table.Cell>
                          <Table.Cell class="text-right text-[1rem]"
                            >{item?.count}</Table.Cell
                          >
                          <Table.Cell
                            class="text-right text-[1rem] text-[#00FC50]"
                            >{item?.call}</Table.Cell
                          >
                          <Table.Cell
                            class="text-right text-[1rem] text-[#FF2F1F]"
                            >{item?.put}</Table.Cell
                          >
                          <Table.Cell
                            class="text-right text-[1rem] {item?.avgSentiment >
                            0.4
                              ? 'text-[#00FC50]'
                              : item?.avgSentiment < -0.1
                                ? 'text-[#FF2F1F]'
                                : 'text-[#C6A755]'} "
                            >{item?.avgSentiment > 0.4
                              ? "Bullish"
                              : item?.avgSentiment <= -0.1
                                ? "Bearish"
                                : "Neutral"}</Table.Cell
                          >

                          <Table.Cell class="text-right text-[1rem] text-white"
                            >{item?.price?.toFixed(2)}</Table.Cell
                          >

                          <Table.Cell class="text-right text-[1rem] ">
                            <span
                              class="{item?.changesPercentage > 0
                                ? 'text-[#00FC50]'
                                : 'text-[#FF2F1F]'} text-end"
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
        </main>

        <aside class="hidden lg:block relative fixed w-1/4 ml-4">
          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-inherit sm:hover:bg-secondary transition ease-out duration-100"
          >
            <a
              href="/potus-tracker"
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  POTUS Tracker
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Follow the latest executive orders of the US President
              </span>
            </a>
          </div>

          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-inherit sm:hover:bg-secondary transition ease-out duration-100"
          >
            <a
              href="/insider-tracker"
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Insider Tracker
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Get the latest unusual insider trading in realtime
              </span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  </div>
</section>

<style>
  .app {
    height: 150px;
    max-width: 100%; /* Ensure chart width doesn't exceed the container */
  }

  @media (max-width: 640px) {
    .app {
      height: 120px;
    }
  }

  .chart {
    width: 100%;
  }
</style>
