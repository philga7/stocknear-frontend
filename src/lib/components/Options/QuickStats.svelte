<script lang="ts">
  import InfoModal from "$lib/components/InfoModal.svelte";
  import { abbreviateNumberWithColor } from "$lib/utils";

  export let rawData = {};
</script>

<div class="text-white">
  <label
    for="avgOptionsStats"
    class="mr-1 cursor-pointer flex flex-row items-center text-white text-xl sm:text-2xl font-bold w-fit"
  >
    Avg. Options Trading Stats
    <InfoModal
      title={"Avg. Options Trading Stats"}
      content={"Average options activity stats provide insights into the trading behavior of options contracts. These statistics help traders to understand market sentiment, liquidity, and potential price movements for underlying assets."}
      id={"avgOptionsStats"}
    />
  </label>
  <div
    class="mt-5 order-5 lg:order-1 flex flex-row space-x-2 sm:space-x-3 xs:space-x-4"
  >
    <table class="w-[50%] text-sm text-white sm:text-[1rem] xl:min-w-[300px]">
      <tbody
        ><tr
          class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
          ><td
            class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
            >Call Volume</td
          >
          <td
            class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
            >{@html abbreviateNumberWithColor(
              rawData?.call_volume,
              false,
              true,
            )}</td
          ></tr
        >

        <tr
          class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
          ><td
            class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
            >Call Premium</td
          >
          <td
            class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
            >{@html abbreviateNumberWithColor(
              rawData?.call_premium,
              false,
              true,
            )}</td
          ></tr
        >

        <tr
          class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
          ><td
            class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
            >Premium</td
          >
          <td
            class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
            >{@html abbreviateNumberWithColor(
              rawData?.call_premium + rawData?.put_premium,
              false,
              true,
            )}</td
          ></tr
        >
        <tr
          class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
          ><td
            class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
            >Call Open Interest</td
          >
          <td
            class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
            >{@html abbreviateNumberWithColor(
              rawData?.call_open_interest,
              false,
              true,
            )}</td
          ></tr
        >
        <tr
          class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
          ><td
            class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
            >Implied Volatility (IV)
          </td>
          <td
            class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
            >{rawData?.iv}%</td
          ></tr
        >
        <tr
          class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
          ><td
            class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
            >Total Open Interest</td
          >
          <td
            class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
            >{@html abbreviateNumberWithColor(
              rawData?.total_open_interest,
              false,
              true,
            )}</td
          ></tr
        >
        <tr
          class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
          ><td
            class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
            >Volume</td
          >
          <td
            class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
            >{rawData?.volume?.toLocaleString("en-US")}</td
          ></tr
        >
      </tbody>
    </table>
    <table class="w-[50%] text-sm text-white xl:min-w-[300px]">
      <tbody
        ><tr
          class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
          ><td
            class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
            >Put Volume</td
          >
          <td
            class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
            >{@html abbreviateNumberWithColor(
              rawData?.put_volume,
              false,
              true,
            )}</td
          ></tr
        >

        <tr
          class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
          ><td
            class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
            >Put Premium</td
          >
          <td
            class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
            >{@html abbreviateNumberWithColor(
              rawData?.put_premium,
              false,
              true,
            )}</td
          ></tr
        >

        <tr
          class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
          ><td
            class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
            >P/C Ratio</td
          >
          <td
            class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
            >{rawData?.putCallRatio}</td
          ></tr
        >

        <tr
          class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
          ><td
            class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
            >Put Open Interest</td
          >
          <td
            class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
            >{@html abbreviateNumberWithColor(
              rawData?.put_open_interest,
              false,
              true,
            )}</td
          ></tr
        >

        <tr
          class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
          ><td
            class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
            >Open Interest (OI) Change</td
          >
          <td
            class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
          >
            {#if rawData?.changeOI >= 0}
              <span class="text-[#00FC50]"
                >+{rawData?.changeOI?.toLocaleString("en-US")}</span
              >
            {:else if rawData?.changeOI < 0}
              <span class="text-[#FF2F1F]"
                >{rawData?.changeOI?.toLocaleString("en-US")}
              </span>
            {:else}
              <span class="text-white"> n/a </span>
            {/if}</td
          ></tr
        >

        <tr
          class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
          ><td
            class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
            >% OI Change</td
          >
          <td
            class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
          >
            {#if rawData?.changesPercentageOI >= 0}
              <span class="text-[#00FC50]"
                >+{rawData?.changesPercentageOI >= 1000
                  ? abbreviateNumberWithColor(rawData?.changesPercentageOI)
                  : rawData?.changesPercentageOI?.toFixed(2)}%</span
              >
            {:else if rawData?.changesPercentageOI < 0}
              <span class="text-[#FF2F1F]"
                >{rawData?.changesPercentageOI <= -1000
                  ? abbreviateNumberWithColor(rawData?.changesPercentageOI)
                  : rawData?.changesPercentageOI?.toFixed(2)}%
              </span>
            {:else}
              <span class="text-white"> n/a </span>
            {/if}</td
          ></tr
        >

        <tr
          class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
          ><td
            class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
            >IV Rank</td
          >
          <td
            class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
            >{rawData?.iv_rank ?? "n/a"}</td
          ></tr
        >
      </tbody>
    </table>
  </div>
</div>
