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
          ><a
            href="/earnings-calendar"
            class="text-xl sm:text-2xl text-muted dark:text-white font-semibold cursor-pointer sm:hover:underline sm:hover:underline-offset-4"
          >
            Upcoming Earnings
            <svg
              class="h-5 w-5 inline-block"
              viewBox="0 0 20 20"
              fill="currentColor"
              style="max-width:40px"
              aria-hidden="true"
              ><path
                fill-rule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clip-rule="evenodd"
              ></path></svg
            ></a
          >
        </Card.Title>
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
