<script lang="ts">
  import HoverStockChart from "$lib/components/HoverStockChart.svelte";
  import { abbreviateNumber } from "$lib/utils";
  import SEO from "$lib/components/SEO.svelte";
  import { onMount } from "svelte";
  import toast from "svelte-french-toast";

  export let data;
  let editMode = false;
  let numberOfChecked = 0;
  let deleteOptionsId = [];

  let isLoaded = false;

  function daysLeft(targetDate) {
    const targetTime = new Date(targetDate).getTime();
    const currentTime = new Date().getTime();
    const difference = targetTime - currentTime;

    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const daysLeft = Math?.ceil(difference / millisecondsPerDay);

    return daysLeft;
  }

  let optionsWatchlist = data?.getOptionsWatchlist?.optionsList;

  function reformatDate(dateString) {
    return (
      dateString.substring(5, 7) +
      "/" +
      dateString.substring(8) +
      "/" +
      dateString.substring(2, 4)
    );
  }

  function formatDate(dateStr) {
    // Parse the input date string (YYYY-mm-dd)
    var date = new Date(dateStr);

    // Get month, day, and year
    var month = date.getMonth() + 1; // Month starts from 0
    var day = date.getDate();
    var year = date.getFullYear();

    var shortYear = year?.toString().slice(-2);

    // Add leading zeros if necessary
    month = (month < 10 ? "0" : "") + month;
    day = (day < 10 ? "0" : "") + day;

    var formattedDate = month + "/" + day + "/" + shortYear;

    return formattedDate;
  }

  function formatTime(timeString) {
    // Split the time string into components
    const [hours, minutes, seconds] = timeString.split(":").map(Number);

    // Determine AM or PM
    const period = hours >= 12 ? "PM" : "AM";

    // Convert hours from 24-hour to 12-hour format
    const formattedHours = hours % 12 || 12; // Converts 0 to 12 for midnight

    // Format the time string
    const formattedTimeString = `${formattedHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")} ${period}`;

    return formattedTimeString;
  }

  async function handleFilter(optionsId) {
    const filterSet = new Set(deleteOptionsId);

    // Check if the new filter already exists in the list
    if (filterSet?.has(optionsId)) {
      // If it exists, remove it from the list
      filterSet?.delete(optionsId);
    } else {
      // If it doesn't exist, add it to the list
      filterSet?.add(optionsId);
    }
    deleteOptionsId = Array?.from(filterSet);
    numberOfChecked = deleteOptionsId?.length;
  }

  async function handleDelete() {
    if (numberOfChecked === 0) {
      toast.error(`You need to select symbols before you can delete them`, {
        style:
          "border-radius: 5px; background: #fff; color: #000; border-color: #4B5563; font-size: 15px;",
      });
    } else if (data?.getOptionsWatchlist?.id?.length === 0) {
      toast.error(`You need to select symbols before you can delete them`, {
        style:
          "border-radius: 5px; background: #fff; color: #000; border-color: #4B5563; font-size: 15px;",
      });
    } else {
      optionsWatchlist = optionsWatchlist?.filter(
        (item) => !deleteOptionsId?.includes(item?.id),
      );

      optionsWatchlist = [...optionsWatchlist];

      const postData = {
        itemIdList: deleteOptionsId,
        id: data?.getOptionsWatchlist?.id,
      };

      numberOfChecked = 0;
      editMode = !editMode;

      await fetch("/api/update-options-watchlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      deleteOptionsId = [];
    }
  }

  onMount(async () => {
    if (optionsWatchlist?.length !== 0) {
      optionsWatchlist?.forEach((item) => {
        item.dte = daysLeft(item?.date_expiration);
      });
    }
    isLoaded = true;
  });
</script>

<SEO
  title="Options Watchlist Tracker - Monitor Stocks & ETFs"
  description="Track options, stocks, and ETFs in real time with our options watchlist tool. Stay updated on price movements, trends, and market performance."
/>

<section
  class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden min-h-screen pt-5 pb-40 lg:px-3"
>
  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full">
          {#if isLoaded}
            {#if optionsWatchlist?.length !== 0}
              <div class="flex flex-row justify-end items-center pb-2">
                <h2 class="font-semibold text-white text-xl mr-auto">
                  {optionsWatchlist?.length} Options
                </h2>
                {#if editMode}
                  <label
                    on:click={handleDelete}
                    class="border text-sm border-gray-600 ml-3 cursor-pointer inline-flex items-center justify-center space-x-1 whitespace-nowrap rounded-md py-2 pl-3 pr-4 font-semibold text-white shadow-sm bg-default sm:hover:bg-default/60 ease-out"
                  >
                    <svg
                      class="inline-block w-5 h-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      ><path
                        fill="white"
                        d="M10 5h4a2 2 0 1 0-4 0M8.5 5a3.5 3.5 0 1 1 7 0h5.75a.75.75 0 0 1 0 1.5h-1.32l-1.17 12.111A3.75 3.75 0 0 1 15.026 22H8.974a3.75 3.75 0 0 1-3.733-3.389L4.07 6.5H2.75a.75.75 0 0 1 0-1.5zm2 4.75a.75.75 0 0 0-1.5 0v7.5a.75.75 0 0 0 1.5 0zM14.25 9a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-1.5 0v-7.5a.75.75 0 0 1 .75-.75m-7.516 9.467a2.25 2.25 0 0 0 2.24 2.033h6.052a2.25 2.25 0 0 0 2.24-2.033L18.424 6.5H5.576z"
                      /></svg
                    >
                    <span class="ml-1 text-white text-sm">
                      {numberOfChecked}
                    </span>
                  </label>
                {/if}

                <label
                  on:click={() => (editMode = !editMode)}
                  class="border text-sm border-gray-600 ml-3 cursor-pointer inline-flex items-center justify-center space-x-1 whitespace-nowrap rounded-md py-2 pl-3 pr-4 font-semibold text-white shadow-sm bg-default sm:hover:bg-default/60 ease-out"
                >
                  <svg
                    class="inline-block w-5 h-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1024 1024"
                    ><path
                      fill="white"
                      d="M832 512a32 32 0 1 1 64 0v352a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V160a32 32 0 0 1 32-32h352a32 32 0 0 1 0 64H192v640h640z"
                    /><path
                      fill="white"
                      d="m469.952 554.24l52.8-7.552L847.104 222.4a32 32 0 1 0-45.248-45.248L477.44 501.44l-7.552 52.8zm422.4-422.4a96 96 0 0 1 0 135.808l-331.84 331.84a32 32 0 0 1-18.112 9.088L436.8 623.68a32 32 0 0 1-36.224-36.224l15.104-105.6a32 32 0 0 1 9.024-18.112l331.904-331.84a96 96 0 0 1 135.744 0z"
                    /></svg
                  >
                  {#if !editMode}
                    <span class="ml-1 text-white text-sm"> Edit </span>
                  {:else}
                    <span class="ml-1 text-white text-sm"> Cancel </span>
                  {/if}
                </label>
              </div>

              <!--Start Table-->
              <div
                class="w-full rounded-md overflow-hidden overflow-x-scroll no-scrollbar"
              >
                <table
                  class="table table-pin-cols table-sm table-compact rounded-none sm:rounded-md w-full bg-table m-auto mt-4 overflow-x-auto"
                >
                  <thead class="bg-default">
                    <tr class="">
                      <td
                        class="text-slate-200 font-semibold text-sm text-start"
                        >Time</td
                      >
                      <th
                        class="text-slate-200 bg-default font-semibold text-sm text-start"
                        >Symbol</th
                      >
                      <td
                        class="text-slate-200 font-semibold text-sm text-start"
                        >Date</td
                      >
                      <td
                        class="text-slate-200 font-semibold text-sm text-start"
                        >Expiry</td
                      >
                      <td class="text-slate-200 font-semibold text-sm text-end"
                        >DTE</td
                      >
                      <td class="text-slate-200 font-semibold text-sm text-end"
                        >Strike</td
                      >
                      <td class="text-slate-200 font-semibold text-sm text-end"
                        >C/P</td
                      >
                      <td
                        class="text-slate-200 font-semibold text-sm text-start"
                        >Sent.</td
                      >
                      <td
                        class="text-slate-200 font-semibold text-sm text-start"
                        >Exec.</td
                      >
                      <td class="text-slate-200 font-semibold text-sm text-end"
                        >Spot</td
                      >
                      <td class="text-slate-200 font-semibold text-sm text-end"
                        >Price</td
                      >
                      <td class="text-slate-200 font-semibold text-sm text-end"
                        >Prem.</td
                      >
                      <td
                        class="text-slate-200 font-semibold text-sm text-start"
                        >Type</td
                      >
                      <td class="text-slate-200 font-semibold text-sm text-end"
                        >Vol.</td
                      >
                      <td class="text-slate-200 font-semibold text-sm text-end"
                        >OI</td
                      >
                    </tr>
                  </thead>
                  <tbody>
                    {#each optionsWatchlist as item, index}
                      <!-- row -->
                      <tr class="odd:bg-odd border-b border-gray-800">
                        <td
                          class="text-white text-sm text-start whitespace-nowrap"
                        >
                          {formatTime(item?.time)}
                        </td>

                        <th
                          on:click={() => handleFilter(item?.id)}
                          class="{index % 2
                            ? 'bg-table'
                            : 'bg-odd'} font-normal text-sm sm:text-[1rem] text-start"
                        >
                          <div class=" flex flex-row items-center">
                            <input
                              type="checkbox"
                              checked={deleteOptionsId?.includes(item?.id) ??
                                false}
                              class="{!editMode
                                ? 'hidden'
                                : ''} bg-[#2E3238] h-[18px] w-[18px] rounded-sm ring-offset-0 mr-3"
                            />
                            {#if !editMode}
                              <HoverStockChart
                                symbol={item?.ticker}
                                assetType={item?.underlying_type}
                              />
                            {:else}
                              <span class="text-blue-400 cursor-pointer"
                                >{item?.ticker}</span
                              >
                            {/if}
                          </div>
                        </th>
                        <td
                          class="text-white text-sm sm:text-[1rem] text-start"
                        >
                          {formatDate(item?.date)}
                        </td>
                        <td
                          class="text-white text-sm sm:text-[1rem] text-start"
                        >
                          {reformatDate(item?.date_expiration)}
                        </td>

                        <td class="text-white text-sm sm:text-[1rem] text-end">
                          {item?.dte < 0 ? "expired" : item?.dte + "d"}
                        </td>

                        <td class="text-sm sm:text-[1rem] text-end text-white">
                          {item?.strike_price}
                        </td>

                        <td
                          class="text-sm sm:text-[1rem] {item?.put_call ===
                          'Calls'
                            ? 'text-[#00FC50]'
                            : 'text-[#FF2F1F]'} text-start"
                        >
                          {item?.put_call}
                        </td>

                        <td
                          class="text-sm sm:text-[1rem] {item?.sentiment ===
                          'Bullish'
                            ? 'text-[#00FC50]'
                            : item?.sentiment === 'Bearish'
                              ? 'text-[#FF2F1F]'
                              : 'text-[#C6A755]'} text-start"
                        >
                          {item?.sentiment}
                        </td>
                        <td
                          class="text-sm sm:text-[1rem] text-white text-start whitespace-nowrap"
                        >
                          {item?.execution_estimate}
                        </td>

                        <td class="text-sm sm:text-[1rem] text-end text-white">
                          {item?.underlying_price}
                        </td>

                        <td class="text-sm sm:text-[1rem] text-end text-white">
                          {item?.price}
                        </td>

                        <td
                          class="text-sm sm:text-[1rem] text-end font-medium {item?.put_call ===
                          'Puts'
                            ? 'text-[#CB281C]'
                            : 'text-[#0FB307]'} "
                        >
                          {abbreviateNumber(item?.cost_basis)}
                        </td>

                        <td
                          class="text-sm sm:text-[1rem] text-start {item?.option_activity_type ===
                          'Sweep'
                            ? 'text-[#C6A755]'
                            : 'text-[#976DB7]'}"
                        >
                          {item?.option_activity_type}
                        </td>

                        <td
                          class="text-white text-end text-sm sm:text-[1rem] text-end font-medium"
                        >
                          {new Intl.NumberFormat("en", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(item?.volume)}
                        </td>

                        <td
                          class="text-white text-end text-sm sm:text-[1rem] text-end font-medium"
                        >
                          {new Intl.NumberFormat("en", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(item?.open_interest)}
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
              <!--End Table-->
              <div
                class="flex flex-col justify-center items-center m-auto pt-8"
              >
                <span
                  class="text-white text-[1rem] sm:text-lg font-medium m-auto p-4 text-center"
                >
                  Add your unusual options contracts and start tracking them
                  now!
                </span>
                <a
                  href="/options-flow"
                  class="py-3 sm:hover:bg-primary rounded-md w-64 flex mt-5 justify-center items-center m-auto text-white border border-gray-600 group"
                >
                  <span class="font-semibold text-[1rem]"
                    >Follow the Whales
                  </span>
                </a>
              </div>
            {:else}
              <div
                class="flex flex-col justify-center items-center m-auto pt-8"
              >
                <span
                  class="text-white font-bold text-white text-2xl sm:text-3xl"
                >
                  Empty Options List
                </span>

                <span
                  class="text-white text-sm sm:text-lg font-medium m-auto p-4 text-center"
                >
                  Add your unusual options contracts and start tracking them
                  now!
                </span>
                {#if !data?.user}
                  <a
                    class="w-64 flex mt-10 justify-center items-center m-auto btn text-black bg-[#fff] sm:hover:bg-gray-300 transition duration-150 ease-in-out group"
                    href="/register"
                  >
                    Get Started
                    <span
                      class="tracking-normal group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out"
                    >
                      <svg
                        class="w-4 h-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        ><g transform="rotate(90 12 12)"
                          ><g fill="none"
                            ><path
                              d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"
                            /><path
                              fill="black"
                              d="M13.06 3.283a1.5 1.5 0 0 0-2.12 0L5.281 8.939a1.5 1.5 0 0 0 2.122 2.122L10.5 7.965V19.5a1.5 1.5 0 0 0 3 0V7.965l3.096 3.096a1.5 1.5 0 1 0 2.122-2.122L13.06 3.283Z"
                            /></g
                          ></g
                        ></svg
                      >
                    </span>
                  </a>
                {:else}
                  <a
                    href="/options-flow"
                    class="w-64 flex mt-5 justify-center items-center m-auto btn text-white border border-gray-600 group"
                  >
                    <span class="font-semibold text-[1rem]"
                      >Follow the Whales
                      <svg
                        class="inline-block -mt-2 -ml-1 w-8 h-8"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 32 32"
                        ><g fill="none"
                          ><path
                            fill="#00a6ed"
                            d="M24.04 6.508C27.007 9.5 29 12.953 29 16.468c0 6.422-1.95 10.392-6.648 12.315a16 16 0 0 1-1.652-.318l-.012.582c-.105.563-.485 1.352-1.625.703c-.84-.478-2.112-1.55-2.33-4.281c-.511-1.271-.617-2.91-.733-4.969c-.164-2.91-3.078-3.89-5-4c-1.84-.105-8.316-.467-8.869-.498a15 15 0 0 1-.01-1.111c0-2.66 3.363-4.9 5.713-4.9h6.55c3.46 0 6.27 2.81 6.27 6.27c-.17 2.411 3.373 3.405 3.82.78c.492-2.896-.591-6.166-2.435-8.494c-.195-.047-.308-.047-.445.047c-1.258 1.258-2.16 1.312-3.852.914a1 1 0 0 0-.239-.103c-.228-.077-.435-.147-.331-.608c.14-.625 1.125-1.719 1.125-1.719c.773-.906 1.758-1.11 2.226-1.055c.402.047.515-.068.58-.135l.03-.029c.065-.051.133-.437.133-.437c-.164-.875.043-1.678.547-2.383c0 0 .882-1.266 1.687-1.344c.72-.07.803.37.879.768q.012.071.027.139c.334 1.535.17 1.902-.215 2.765c-.065.147-.137.308-.214.492c-.13.308-.058.434.038.605zM8.219 29.938c-1.735 0-3.64-2.438-3.11-5.922c.313.2 2.615 2.052 3.75 3.14c.329.844.11 2.782-.64 2.782"
                          /><path
                            fill="#1c1c1c"
                            d="M15.517 15a.61.61 0 0 1-.604-.604v-.758c0-.33.274-.604.604-.604s.604.274.604.604v.758a.604.604 0 0 1-.604.604"
                          /><path
                            fill="#aeddff"
                            d="M20.706 28.208q.745.278 1.692.556q-.84.348-1.8.608q.06-.166.09-.325zm-3.973-4.468c-.107-.771-.157-1.671-.217-2.74l-.016-.281c-.164-2.911-3.766-4.61-5.687-4.719c-1.839-.105-8.138-.01-8.682 0c.339 7.399 6.034 14.639 13.885 14.095a27 27 0 0 0 3.007-.367c-1-.583-2.564-2.007-2.29-5.988"
                          /></g
                        ></svg
                      >
                    </span>
                  </a>
                {/if}
              </div>
            {/if}
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
      </div>
    </div>
  </div>
</section>
