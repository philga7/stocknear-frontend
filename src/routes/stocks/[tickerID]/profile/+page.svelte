<script lang="ts">
  import { stockTicker, displayCompanyName } from "$lib/store";
  import { sectorNavigation } from "$lib/utils";
  import SEO from "$lib/components/SEO.svelte";

  export let data;

  const rawData = data?.getData;

  function getIndustryHref(industryName) {
    // Replace spaces with hyphens
    let formattedName = industryName?.replace(/ /g, "-");
    // Replace "&" with "and"
    formattedName = formattedName?.replace(/&/g, "and");
    // Remove any extra hyphens (e.g., from consecutive spaces)
    formattedName = formattedName?.replace(/-{2,}/g, "-");
    // Convert to lowercase for consistency
    return "/list/industry/" + formattedName?.toLowerCase();
  }

  function textToParagraphs(text) {
    // Split the text into sentences
    const sentences = text.split(
      /(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.)\s+(?=[A-Z])/,
    );

    // Wrap sentences in paragraphs
    const paragraphs = sentences.map(
      (sentence) => `<p class="mb-5">${sentence.trim()}</p>`,
    );

    // Wrap paragraphs in a div with additional classes
    return `<div class="mb-5 md:text-lg [&>p]:mb-5">
${paragraphs.join("\n")}
</div>`;
  }

  const formattedText = textToParagraphs(
    rawData?.description || "No Company description available at the moment.",
  );
</script>

<SEO
  title={`${$displayCompanyName} (${$stockTicker}) Company Profile & Overview`}
  description={`Company profile for ${$displayCompanyName} (${$stockTicker}) with a description, list of executives, contact details and other key facts.`}
/>

<section class="w-full bg-default overflow-hidden text-white h-full">
  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <div
        class="relative flex flex-row justify-center items-start overflow-hidden w-full"
      >
        <div class="sm:p-7 w-full mt-2 sm:mt-0">
          <div class="lg:float-left lg:w-[calc(100%-336px-20px)]">
            <h1 class="text-xl sm:text-2xl font-bold mb-4 w-full">
              Company Description
            </h1>
            {@html formattedText}
          </div>
          <div class="lg:-mr-6 flex-shrink-0 lg:float-right lg:w-[336px]">
            <div
              class="mt-7 rounded border border-gray-600 bg-primary px-3 pb-2 pt-3 xs:px-4 xs:pt-4 lg:mt-1"
            >
              <div class="text-center text-2xl font-semibold">
                {$displayCompanyName}
              </div>
              <div class="mb-0">
                <img
                  src={`https://financialmodelingprep.com/image-stock/${$stockTicker?.toUpperCase()}.png`}
                  alt={`${$displayCompanyName} logo`}
                  class="mx-auto py-0.5 w-28 h-28 mt-5 mb-5"
                />
              </div>
              <table class="w-full">
                <tbody
                  ><tr class="border-b border-gray-600 last:border-0"
                    ><td
                      class="px-1 py-1.5 font-semibold lg:py-2"
                      data-svelte-h="svelte-bpivlp">Country</td
                    >
                    <td class="px-1 py-1.5 text-right lg:py-2"
                      >{rawData?.country
                        ? rawData?.country?.replace("US", "United States")
                        : "n/a"}</td
                    ></tr
                  >

                  <tr class="border-b border-gray-600 last:border-0"
                    ><td
                      class="px-1 py-1.5 font-semibold lg:py-2"
                      data-svelte-h="svelte-pqn7mx">IPO Date</td
                    >
                    <td class="px-1 py-1.5 text-right lg:py-2"
                      >{rawData?.ipoDate !== null &&
                      rawData?.ipoDate?.length > 0
                        ? new Date(rawData?.ipoDate)?.toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            daySuffix: "2-digit",
                          })
                        : "n/a"}</td
                    ></tr
                  >
                  <tr class="border-b border-gray-600 last:border-0"
                    ><td class="px-1 py-1.5 font-semibold lg:py-2">Industry</td>
                    <td class="px-1 py-1.5 text-right lg:py-2"
                      ><a
                        href={rawData?.industry
                          ? getIndustryHref(rawData?.industry)
                          : "#"}
                        class="sm:hover:text-blue-400 text-white underline underline-offset-4"
                        >{rawData?.industry ?? "n/a"}</a
                      ></td
                    ></tr
                  >
                  <tr class="border-b border-gray-600 last:border-0"
                    ><td
                      class="px-1 py-1.5 font-semibold lg:py-2"
                      data-svelte-h="svelte-5e1uzt">Sector</td
                    >
                    <td class="px-1 py-1.5 text-right lg:py-2">
                      <a
                        href={sectorNavigation?.find(
                          (item) => item?.title === rawData?.sector,
                        )?.link}
                        class="sm:hover:text-blue-400 text-white underline underline-offset-4"
                        >{rawData?.sector ? rawData?.sector : "n/a"}</a
                      ></td
                    ></tr
                  >
                  <tr class="border-b border-gray-600 last:border-0"
                    ><td class="px-1 py-1.5 font-semibold lg:py-2">Employees</td
                    >
                    <td class="px-1 py-1.5 text-right lg:py-2"
                      ><a
                        class="sm:hover:text-blue-400 text-white underline underline-offset-4"
                        href={`/stocks/${$stockTicker}/profile/employees`}
                        >{rawData?.fullTimeEmployees
                          ? new Intl.NumberFormat("en")?.format(
                              rawData?.fullTimeEmployees,
                            )
                          : "n/a"}</a
                      ></td
                    ></tr
                  >
                  <tr class="border-b border-gray-600 last:border-0"
                    ><td
                      class="px-1 py-1.5 font-semibold lg:py-2"
                      data-svelte-h="svelte-1qhfmvo">CEO</td
                    >
                    <td class="px-1 py-1.5 text-right lg:py-2"
                      >{rawData?.ceo || "n/a"}</td
                    ></tr
                  ></tbody
                >
              </table>
            </div>
            <h2 class="mt-6 xs:mt-8 font-bold text-2xl mb-2">
              Contact Details
            </h2>
            <div
              class="rounded border border-gray-600 bg-primary px-4 pb-2 pt-4"
            >
              <table class="w-full">
                <tbody
                  ><tr class="border-b border-gray-600 last:border-0"
                    ><td colspan="2" class="pb-3"
                      ><div
                        class="mb-2 text-lg font-bold"
                        data-svelte-h="svelte-4u53xl"
                      >
                        Address:
                      </div>
                      <div>
                        {rawData?.address
                          ? rawData?.address
                          : "No Address available"}<br />{rawData?.city
                          ? rawData?.city
                          : "No city data available"}, {rawData?.state ?? ""}<br
                        />{rawData?.country?.replace("US", "United States") ??
                          ""}
                      </div></td
                    ></tr
                  >

                  <tr class="border-b border-gray-600 last:border-0"
                    ><td class="px-0.5 py-2 font-semibold">Website</td>
                    <td class="px-0.5 py-2 text-right">
                      <a
                        href={rawData?.website}
                        class="hover:sm:text-white truncate text-blue-400"
                        target="_blank">{rawData?.website ?? "n/a"}</a
                      ></td
                    ></tr
                  ></tbody
                >
              </table>
            </div>
            <h2 class="mt-6 xs:mt-8 font-bold text-2xl mb-2">Stock Details</h2>
            <div
              class="rounded border border-gray-600 bg-primary px-2 pb-2 pt-2 xs:px-4 xs:pt-2.5"
            >
              <table class="w-full">
                <tbody
                  ><tr class="border-b border-gray-600 last:border-0"
                    ><td
                      class="px-1 py-1.5 font-semibold lg:py-2"
                      data-svelte-h="svelte-lmvnpx">Ticker Symbol</td
                    >
                    <td class="px-1 py-1.5 text-right lg:py-2"
                      >{rawData?.symbol ?? "n/a"}</td
                    ></tr
                  >
                  <tr class="border-b border-gray-600 last:border-0"
                    ><td
                      class="px-1 py-1.5 font-semibold lg:py-2"
                      data-svelte-h="svelte-h7dsem">Exchange</td
                    >
                    <td class="px-1 py-1.5 text-right lg:py-2"
                      >{rawData?.exchange ?? "n/a"}</td
                    ></tr
                  >
                  <tr class="border-b border-gray-600 last:border-0"
                    ><td
                      class="px-1 py-1.5 font-semibold lg:py-2"
                      data-svelte-h="svelte-q9yzrm">Fiscal Year</td
                    >
                    <td class="px-1 py-1.5 text-right lg:py-2"
                      >{rawData?.fiscalYearRange ?? "n/a"}</td
                    ></tr
                  >
                  <tr class="border-b border-gray-600 last:border-0"
                    ><td
                      class="px-1 py-1.5 font-semibold lg:py-2"
                      data-svelte-h="svelte-1tbczfa">Reporting Currency</td
                    >
                    <td class="px-1 py-1.5 text-right lg:py-2"
                      >{rawData?.currency ?? "n/a"}</td
                    ></tr
                  >
                  <tr class="border-b border-gray-600 last:border-0"
                    ><td
                      class="px-1 py-1.5 font-semibold lg:py-2"
                      data-svelte-h="svelte-ucpcs9">CIK Code</td
                    >
                    <td class="px-1 py-1.5 text-right lg:py-2"
                      >{rawData?.cik ?? "n/a"}</td
                    ></tr
                  >
                  <tr class="border-b border-gray-600 last:border-0"
                    ><td
                      class="px-1 py-1.5 font-semibold lg:py-2"
                      data-svelte-h="svelte-1fdyovu">CUSIP Number</td
                    >
                    <td class="px-1 py-1.5 text-right lg:py-2"
                      >{rawData?.cusip ?? "n/a"}</td
                    ></tr
                  >
                  <tr class="border-b border-gray-600 last:border-0"
                    ><td
                      class="px-1 py-1.5 font-semibold lg:py-2"
                      data-svelte-h="svelte-t5u2mr">ISIN Number</td
                    >
                    <td class="px-1 py-1.5 text-right lg:py-2"
                      >{rawData?.isin ?? "n/a"}</td
                    ></tr
                  >
                  <tr class="border-b border-gray-600 last:border-0"
                    ><td
                      class="px-1 py-1.5 font-semibold lg:py-2"
                      data-svelte-h="svelte-x8apyl">Employer ID</td
                    >
                    <td class="px-1 py-1.5 text-right lg:py-2"
                      >{rawData?.taxIdentificationNumber ?? "n/a"}</td
                    ></tr
                  >
                  <tr class="border-b border-gray-600 last:border-0"
                    ><td
                      class="px-1 py-1.5 font-semibold lg:py-2"
                      data-svelte-h="svelte-1o4kelt">SIC Code</td
                    >
                    <td class="px-1 py-1.5 text-right lg:py-2"
                      >{rawData?.sicCode ?? "n/a"}</td
                    ></tr
                  ></tbody
                >
              </table>
            </div>
          </div>

          <div class=" mb-2 lg:float-left lg:w-[calc(100%-336px-40px)]">
            <h2 class="mt-6 lg:mt-4 text-xl sm:text-2xl font-bold mb-5">
              Key Executives
            </h2>
            {#if rawData?.executives?.length > 0}
              <table class="mb-6 w-full text-base xs:mb-8">
                <thead class="bg-primary"
                  ><tr class="border-y border-gray-600"
                    ><th
                      class="px-2 py-2.5 text-left font-semibold text-white xs:px-3 xs:py-3 sm:px-4"
                      >Name</th
                    >
                    <th
                      class="px-2 py-2.5 text-left font-semibold text-white xs:px-3 xs:py-3 sm:px-4"
                      >Position</th
                    ></tr
                  ></thead
                >
                <tbody>
                  {#each rawData?.executives as item}
                    <tr class="border-b border-gray-600 text-sm sm:text-[1rem]"
                      ><td
                        class="px-2 py-2.5 align-top font-semibold text-white xs:px-3 xs:py-3 sm:px-4"
                        >{item?.name}</td
                      >
                      <td
                        class="px-2 py-2.5 align-top text-white xs:px-3 xs:py-3 sm:px-4"
                        >{item?.position}</td
                      >
                    </tr>
                  {/each}
                </tbody>
              </table>
            {:else}
              No executives data available.
            {/if}
            <h2 class="mt-10 text-xl sm:text-2xl font-bold mb-5">
              Latest SEC Filings
            </h2>
            {#if rawData?.filings?.length > 0}
              <table class="w-full">
                <thead
                  ><tr class="border-b border-t border-gray-600 bg-primary"
                    ><th class="px-1 py-2 text-left text-white xs:px-2">Date</th
                    >
                    <th class="px-1 py-2 text-left text-white xs:px-2">Type</th>
                    <th class="px-1 py-2 text-left text-white xs:px-2">Title</th
                    ></tr
                  ></thead
                >
                <tbody>
                  {#each rawData?.filings as item}
                    <tr class="border-b border-gray-600 text-sm sm:text-[1rem]"
                      ><td
                        class="whitespace-nowrap py-3 pr-1 align-top text-white xs:px-2"
                        >{item?.date}</td
                      >
                      <td class="px-1 py-3 align-top text-white xs:px-2"
                        >{item?.type}</td
                      >
                      <td class="py-3 pl-1 align-top xs:px-2"
                        ><a
                          class="text-blue-400 sm:hover:text-white sm:hover:underline sm:hover:underline-offset-4"
                          href={item?.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          >{item?.title?.length > 50
                            ? item?.title?.slice(0, 50) + "..."
                            : item?.title}</a
                        ></td
                      >
                    </tr>
                  {/each}
                </tbody>
              </table>
            {:else}
              No SEC filings available.
            {/if}
            <div
              class="border-b border-gray-600 py-3 text-lg sm:text-xl font-semibold"
            >
              <a
                class="text-blue-400 sm:hover:text-white sm:hover:underline sm:hover:underline-offset-4"
                href={`https://www.sec.gov/cgi-bin/browse-edgar?CIK=${rawData?.cik}&amp;count=100`}
                target="_blank"
                rel="noopener noreferrer">View All SEC Filings</a
              >
            </div>
          </div>
          <div class="clear-both min-h-5"></div>
        </div>
      </div>
    </div>
  </div>
</section>
