<script lang="ts">
  import * as Card from "$lib/components/shadcn/card/index.ts";
  import Infobox from "$lib/components/Infobox.svelte";
  import { compareTimes, abbreviateNumber } from "$lib/utils";
  import ArrowUpRight from "lucide-svelte/icons/arrow-up-right";

  export let upcomingEarnings;
</script>

<Card.Root
  class=" overflow-x-auto overflow-hidden overflow-y-auto no-scrollbar h-fit"
>
  <Card.Header class="flex flex-row items-center">
    <div class="flex flex-col items-start w-full">
      <div class="flex flex-row w-full items-center">
        <Card.Title
          class="text-xl sm:text-2xl text-muted dark:text-white font-semibold"
          >Upcoming Earnings</Card.Title
        >
        <a
          href="/earnings-calendar"
          class="ml-auto rounded text-xs sm:text-sm px-2 sm:px-3 py-2 font-semibold bg-blue-500 sm:hover:bg-blue-600 transition dark:bg-[#fff] text-white dark:text-black"
        >
          View All
          <ArrowUpRight
            class="hidden sm:inline-block h-4 w-4 shrink-0 -mt-1 ml-0.5"
          />
        </a>
      </div>
    </div>
  </Card.Header>
  <Card.Content>
    {#if upcomingEarnings?.length !== 0}
      <ul style="padding-left: 5px;">
        {#each upcomingEarnings as item, index}
          <li
            class="text-sm sm:text-[1rem]"
            style=" margin-left: 8px;  margin-bottom: 30px; list-style-type: disc;"
          >
            <strong>{item?.name}</strong> (<a
              href={`/stocks/${item?.symbol}`}
              class="text-blue-700 dark:text-blue-400 dark:sm:hover:text-white sm:hover:text-muted cursor-pointer"
              >{item?.symbol}</a
            >)
            {item?.isToday === true
              ? "will report today"
              : ["Monday", "Tuesday", "Wednesday", "Thursday"].includes(
                    new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                    }),
                  )
                ? "will report tomorrow"
                : "will report monday"}
            {#if item?.time}
              {#if compareTimes(item?.time, "16:00") >= 0}
                after market closes.
              {:else if compareTimes(item?.time, "09:30") <= 0}
                before market opens.
              {:else}
                during market.
              {/if}
            {/if}Analysts estimate {abbreviateNumber(item?.revenueEst)} in revenue
            ({((item?.revenueEst / item?.revenuePrior - 1) * 100)?.toFixed(2)}%
            YoY) and {item?.epsEst} in earnings per share
            {#if item?.epsPrior !== 0}
              ({((item?.epsEst / item?.epsPrior - 1) * 100)?.toFixed(2)}% YoY).
            {/if}
          </li>
        {/each}
      </ul>
    {:else}
      <Infobox
        text="There are no major upcoming earnings to report today but you can check the earnings calendar for a complete list."
      />
    {/if}
  </Card.Content>
</Card.Root>
