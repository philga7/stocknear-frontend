<script lang="ts">
  import { formatString, abbreviateNumber } from "$lib/utils";
  import { screenWidth } from "$lib/store";
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  import SEO from "$lib/components/SEO.svelte";

  export let data;

  let rawData = data?.getIPOCalendar?.filter(
    (item) => new Date(item?.ipoDate).getFullYear() >= data?.getYear,
  );

  let ipoList = rawData?.slice(0, 150);
  let year = data?.getYear;
  let ipoNews = data?.getNews;

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;
    if (isBottom && ipoList?.length !== rawData?.length) {
      const nextIndex = ipoList?.length;
      const filteredNewResults = rawData?.slice(nextIndex, nextIndex + 50);
      ipoList = [...ipoList, ...filteredNewResults];
    }
  }

  onMount(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  $: {
    if ($page?.url?.pathname) {
      rawData = data?.getIPOCalendar?.filter(
        (item) => new Date(item?.ipoDate).getFullYear() == data?.getYear,
      );
      ipoList = rawData?.slice(0, 150);
      year = data?.getYear;
    }
  }

  $: charNumber = $screenWidth < 640 ? 20 : 30;
</script>

<SEO
  title={`All ${data?.getYear} IPOs - A Complete List`}
  description={`A list of all the initial public offerings (IPOs) on the US stock market in the year ${data?.getYear}.`}
/>

<div class="w-full overflow-hidden min-h-screen pb-20 m-auto mt-5">
  <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
    <div
      class="relative flex justify-center items-start overflow-hidden w-full"
    >
      <main class="w-full lg:w-3/4 lg:pr-10">
        <div class="flex flex-col justify-center items-center">
          {#if rawData?.length !== 0}
            <h2
              class="text-white text-xl font- text-start mt-5 w-full font-semibold"
            >
              {rawData?.length} IPOs
            </h2>
            <div class="w-full overflow-x-auto">
              <table
                class="mt-5 table table-sm table-compact rounded-none sm:rounded-md w-full bg-table border border-gray-800 m-auto overflow-hidden"
              >
                <thead class="bg-default">
                  <tr>
                    <th class="text-white font-semibold text-sm text-start"
                      >IPO Date</th
                    >
                    <th class="text-white font-semibold text-sm text-start"
                      >Symbol</th
                    >
                    <th class="text-white font-semibold text-sm">Name</th>
                    <th class="text-white font-semibold text-end text-sm"
                      >IPO Price</th
                    >
                    <th class="text-white font-semibold text-end text-sm"
                      >Current Price</th
                    >
                    <th class="text-white font-semibold text-end text-sm"
                      >Return Since</th
                    >
                  </tr>
                </thead>
                <tbody>
                  {#each ipoList as item}
                    <tr
                      class="sm:hover:bg-[#245073]/10 odd:bg-odd border-b-[#09090B]"
                    >
                      <td
                        class="text-white text-sm sm:text-[1rem] whitespace-nowrap text-start border-b-[#09090B] whitespace-nowrap"
                      >
                        {new Date(item?.ipoDate)?.toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          daySuffix: "2-digit",
                        })}
                      </td>

                      <td
                        class="text-sm sm:text-[1rem] whitespace-nowrap text-start border-b-[#09090B] whitespace-nowrap"
                      >
                        <a
                          href={"/stocks/" + item?.symbol}
                          class="sm:hover:text-white text-blue-400"
                        >
                          {item?.symbol}
                        </a>
                      </td>

                      <td
                        class="text-gray-200 border-b-[#09090B] whitespace-nowrap text-sm sm:text-[1rem]"
                      >
                        <span class="text-white"
                          >{item?.name?.length > charNumber
                            ? formatString(item?.name?.slice(0, charNumber)) +
                              "..."
                            : formatString(item?.name)}</span
                        >
                      </td>

                      <td
                        class="text-white text-sm sm:text-[1rem] whitespace-nowrap border-b-[#09090B] text-end"
                      >
                        {item?.ipoPrice !== null ? item?.ipoPrice : "n/a"}
                      </td>

                      <td
                        class="text-white border-b-[#09090B] text-sm sm:text-[1rem] text-end"
                      >
                        {item?.currentPrice !== null
                          ? item?.currentPrice
                          : "n/a"}
                      </td>

                      <td
                        class="text-white border-b-[#09090B] text-end flex flex-row items-center justify-end"
                      >
                        {#if item?.return >= 0 && item?.return !== null}
                          <span
                            class="inline-block text-[#00FC50] text-sm sm:text-[1rem] whitespace-nowrap"
                            >+{abbreviateNumber(item?.return)}%</span
                          >
                        {:else if item?.return < 0 && item?.return !== null}
                          <span
                            class="inline-block text-[#FF2F1F] text-sm sm:text-[1rem] whitespace-nowrap"
                            >{abbreviateNumber(item?.return)}%
                          </span>
                        {:else}
                          <span
                            class="inline-block text-white text-sm sm:text-[1rem] whitespace-nowrap"
                          >
                            n/a
                          </span>
                        {/if}
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {:else}
            <div class="w-full">
              <Infobox
                text={`No IPOs found. Please adjust your search timeframe for the latest ${year}
          IPOs.`}
              />
            </div>
          {/if}
        </div>
      </main>
      <aside class="hidden lg:block relative fixed w-1/4">
        {#if ipoNews?.length !== 0}
          <div
            class="w-full sm:hover:text-white text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-inherit"
          >
            <div class="p-4 text-sm">
              <h3 class="text-xl text-white font-bold mb-3">IPO News</h3>
              <ul class="text-white">
                {#each ipoNews?.slice(0, 10) as item}
                  <li class="mb-3 last:mb-1">
                    {item?.timestamp}
                    <a
                      class="sm:hover:text-white text-blue-400"
                      href={item?.link}
                      target="_blank"
                      rel="noopener noreferrer nofollow">{item?.title}</a
                    >
                  </li>
                {/each}
              </ul>
              <a
                href={`/ipos/news`}
                class="flex justify-center items-center rounded cursor-pointer w-full py-2 mt-3 text-[1rem] text-center font-semibold text-black m-auto sm:hover:bg-gray-300 bg-[#fff] transition duration-100"
              >
                More IPO News
              </a>
            </div>
          </div>
        {/if}
      </aside>
    </div>
  </div>
</div>
