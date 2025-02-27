<script lang="ts">
  import { formatString } from "$lib/utils";
  import { screenWidth, numberOfUnreadNotification } from "$lib/store";
  import { onMount } from "svelte";
  import HoverStockChart from "$lib/components/HoverStockChart.svelte";
  //import UpgradeToPro from '$lib/components/UpgradeToPro.svelte';
  import ArrowLogo from "lucide-svelte/icons/move-up-right";
  import Infobox from "$lib/components/Infobox.svelte";

  import SEO from "$lib/components/SEO.svelte";

  export let data;

  let cloudFrontUrl = import.meta.env.VITE_IMAGE_URL;

  let rawData = data?.getPoliticianRSS;
  let displayList = rawData?.slice(0, 50) || [];

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;
    if (isBottom && displayList?.length !== rawData?.length) {
      const nextIndex = displayList?.length;
      const filteredNewResults = rawData?.slice(nextIndex, nextIndex + 9);
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

  function getAbbreviatedName(fullName) {
    if (fullName === null) {
      return "-";
    }

    const names = fullName?.split(" ");
    let firstName = names[0];
    // Remove any title prefix (e.g. Dr., Mr., Mrs., Ms.)
    if (names.length > 1 && /^(Dr|Mr|Mrs|Ms)\.?$/i.test(names[0])) {
      firstName = names[1];
      names?.splice(0, 1);
    }
    const initials = names
      ?.slice(0, -1)
      ?.map((name) => name?.charAt(0))
      ?.join(". ");
    const lastName = names[names?.length - 1];
    return `${firstName?.charAt(0)}. ${lastName}`;
  }

  $: charNumber = $screenWidth < 640 ? 20 : 40;
</script>

<SEO
  title="Latest
    Congressional Trading"
  description="Find the latest congress trading and see what insiders who have access to regulations are investing."
/>

<section
  class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden min-h-screen pb-20 pt-5 px-4 lg:px-3"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">Congress Flow</li>
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
              Latest Trades of Politicians
            </h1>
          </div>

          <Infobox
            text="We provide real-time updates on the latest congressional trading activities."
          />

          <body class="w-full overflow-hidden m-auto">
            <section class="w-full overflow-hidden m-auto mt-5">
              <div class=" flex justify-center w-full m-auto overflow-hidden">
                <div
                  class="relative flex justify-center items-center overflow-hidden w-full"
                >
                  <main class="w-full">
                    <div class="w-full m-auto mt-4">
                      <div
                        class="w-full m-auto rounded-none sm:rounded-md mb-4 overflow-x-auto sm:overflow-hidden"
                      >
                        <table
                          class="table table-sm table-pin-cols table-compact rounded-none sm:rounded-md w-full bg-default border border-gray-800 m-auto"
                        >
                          <thead class="bg-default">
                            <tr class="">
                              <th
                                class=" text-start bg-default text-white text-sm font-medium sm:font-semibold"
                              >
                                Person
                              </th>
                              <td
                                class="text-start bg-default text-white text-sm font-medium sm:font-semibold"
                              >
                                Company
                              </td>

                              <td
                                class="text-end bg-default text-white text-sm font-medium sm:font-semibold"
                              >
                                Date
                              </td>
                              <td
                                class="text-center bg-default text-white text-sm font-medium sm:font-semibold"
                              >
                                Amount
                              </td>
                              <td
                                class="text-white text-end text-sm font-medium sm:font-semibold"
                                >Type</td
                              >
                            </tr>
                          </thead>
                          <tbody>
                            {#each displayList as item, index}
                              <tr
                                class="bg-table odd:bg-odd border-bborder-gray-800 {index +
                                  1 ===
                                  rawData?.length && data?.user?.tier !== 'Pro'
                                  ? 'opacity-[0.1]'
                                  : ''}"
                              >
                                <th
                                  class="{index % 2
                                    ? 'bg-table'
                                    : 'bg-odd'} text-white text-sm sm:text-[1rem] whitespace-nowrap"
                                >
                                  <div class="flex flex-row items-center">
                                    <div
                                      class="flex-shrink-0 rounded-full border border-slate-700 w-9 h-9 relative {item?.party ===
                                      'Republican'
                                        ? 'bg-[#98272B]'
                                        : item?.party === 'Democratic'
                                          ? 'bg-[#295AC7]'
                                          : 'bg-[#4E2153]'} flex items-center justify-center"
                                    >
                                      <img
                                        style="clip-path: circle(50%);"
                                        class="rounded-full w-7"
                                        src={`${cloudFrontUrl}/assets/senator/${item?.representative?.replace(/\s+/g, "_")}.png`}
                                        loading="lazy"
                                      />
                                    </div>
                                    <div class="flex flex-col ml-3 font-normal">
                                      <a
                                        href={`/politicians/${item?.id}`}
                                        class="sm:hover:text-white text-blue-400"
                                        >{getAbbreviatedName(
                                          item?.representative?.replace(
                                            "_",
                                            " ",
                                          ),
                                        )}</a
                                      >
                                      <span class="text-white"
                                        >{item?.party}</span
                                      >
                                    </div>
                                  </div>
                                  <!--{item?.firstName} {item?.lastName}-->
                                </th>

                                <td
                                  class="text-start whitespace-nowrap text-sm sm:text-[1rem] text-blue-400"
                                >
                                  <div class="flex flex-col items-start">
                                    <HoverStockChart
                                      symbol={item?.ticker}
                                      assetType={item?.assetType}
                                    />

                                    <span class="text-white"
                                      >{item?.assetDescription.length >
                                      charNumber
                                        ? formatString(
                                            item?.assetDescription.slice(
                                              0,
                                              charNumber,
                                            ),
                                          ) + "..."
                                        : formatString(item?.assetDescription)
                                            ?.replace("- Common Stock", "")
                                            ?.replace("Common Stock", "")}</span
                                    >
                                  </div>
                                </td>

                                <td
                                  class="text-end text-sm sm:text-[1rem] text-white whitespace-nowrap"
                                >
                                  {new Date(
                                    item?.disclosureDate,
                                  )?.toLocaleString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    daySuffix: "2-digit",
                                  })}
                                </td>

                                <td
                                  class="text-center text-sm sm:text-[1rem] text-white whitespace-nowrap"
                                >
                                  {item?.amount?.replace(
                                    "$1,000,001 - $5,000,000",
                                    "$1Mio - $5Mio",
                                  )}
                                </td>
                                <td
                                  class="text-sm sm:text-[1rem] text-end text-white"
                                >
                                  {#if item?.type === "Bought"}
                                    <span class="text-[#00FC50]">Bought</span>
                                  {:else if item?.type === "Sold"}
                                    <span class="text-[#FF2F1F]">Sold</span>
                                  {/if}
                                </td>
                              </tr>
                            {/each}
                          </tbody>
                        </table>
                      </div>
                      <!--<InfiniteLoading on:infinite={infiniteHandler} />-->

                      <!--<UpgradeToPro data={data} title="Track the latest trades of corrupt US Politicians"/>-->
                    </div>
                  </main>
                </div>
              </div>
            </section>
          </body>
        </main>

        <aside class="hidden lg:block relative fixed w-1/4 ml-4">
          {#if data?.user?.tier !== "Pro"}
            <div
              class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-inherit sm:hover:bg-secondary transition ease-out duration-100"
            >
              <a
                href={"/pricing"}
                class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
              >
                <div class="w-full flex justify-between items-center p-3 mt-3">
                  <h2 class="text-start text-xl font-semibold text-white ml-3">
                    Pro Subscription
                  </h2>
                  <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
                </div>
                <span class="text-white p-3 ml-3 mr-3">
                  Upgrade now for unlimited access to all data and tools.
                </span>
              </a>
            </div>
          {/if}

          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-inherit sm:hover:bg-secondary transition ease-out duration-100"
          >
            <a
              href={"/analysts"}
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Top Analyst
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Get the latest top Wall Street analyst ratings
              </span>
            </a>
          </div>

          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-inherit sm:hover:bg-secondary transition ease-out duration-100"
          >
            <a
              href={"/politicians"}
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Congress Trading
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Get the latest top Congress trading insights.
              </span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  </div>
</section>
