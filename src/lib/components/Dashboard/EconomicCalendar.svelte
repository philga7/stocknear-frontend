<script lang="ts">
  import * as Card from "$lib/components/shadcn/card/index.ts";
  import * as Table from "$lib/components/shadcn/table/index.ts";
  import Infobox from "$lib/components/Infobox.svelte";
  import { abbreviateNumber } from "$lib/utils";

  export let dataList;
</script>

<Card.Root
  class="bg-gray-50 dark:bg-default overflow-x-auto overflow-hidden overflow-y-auto no-scrollbar"
>
  <Card.Header class="flex flex-row items-center">
    <div class="flex flex-col items-start w-full">
      <div class="flex flex-row w-full items-center">
        <Card.Title>
          <a
            href="/economic-calendar/"
            class="text-xl sm:text-2xl text-muted dark:text-white font-semibold cursor-pointer sm:hover:underline sm:hover:underline-offset-4"
          >
            Economic Events
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
            >
          </a></Card.Title
        >
      </div>
    </div>
  </Card.Header>
  <Card.Content>
    {#if dataList?.length > 0}
      <Table.Root class="overflow-x-auto w-full">
        <Table.Header>
          <Table.Row>
            <Table.Head class=" text-left text-sm font-bold dark:font-semibold"
              >Time</Table.Head
            >
            <Table.Head class=" text-left text-sm font-bold dark:font-semibold"
              >Event</Table.Head
            >
            <Table.Head
              class="text-right table-cell text-sm font-bold dark:font-semibold"
              >Prior</Table.Head
            >
            <Table.Head
              class="text-right table-cell text-sm font-bold dark:font-semibold"
              >Forecast</Table.Head
            >
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each dataList as item}
            <Table.Row>
              <Table.Cell class="text-sm sm:text-[1rem] whitespace-nowrap">
                {item?.time}
              </Table.Cell>
              <Table.Cell class="text-sm sm:text-[1rem] whitespace-nowrap">
                {item?.event}
              </Table.Cell>
              <Table.Cell
                class="table-cell xl:table.-column text-sm sm:text-[1rem] text-right"
              >
                {item?.prior ? item?.prior : "n/a"}
              </Table.Cell>
              <Table.Cell
                class="table-cell xl:table.-column text-sm sm:text-[1rem] text-right"
              >
                {item?.consensus ? item?.consensus : "n/a"}
              </Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    {:else}
      <Infobox
        text="Currently, no relevant Economic Events data are available."
      />
    {/if}
  </Card.Content>
</Card.Root>
