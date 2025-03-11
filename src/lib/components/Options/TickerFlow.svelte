<script lang="ts">
  import { abbreviateNumber } from "$lib/utils";
  import InfoModal from "$lib/components/InfoModal.svelte";

  export let tickerFlow = [];

  function findLastNonNull(dataArray, key) {
    for (let i = dataArray.length - 1; i >= 0; i--) {
      if (
        dataArray[i]?.net_call_premium !== null &&
        dataArray[i]?.net_call_premium !== undefined
      ) {
        return dataArray[i][key];
      }
    }
    return null; // Return null if no non-null value is found.
  }

  function formatDate(dateStr) {
    // Parse the input date string
    var date = new Date(dateStr);

    // Get month, day, and year
    var month = date.getMonth() + 1; // Month starts from 0
    var day = date.getDate();
    var year = date.getFullYear();

    // Get hours and minutes
    var hours = date.getHours();
    var minutes = date.getMinutes();

    // Determine AM/PM and adjust hours
    var ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours === 0 ? 12 : hours; // Convert 0 hours to 12 for AM/PM

    // Add leading zeros if necessary
    month = (month < 10 ? "0" : "") + month;
    day = (day < 10 ? "0" : "") + day;
    minutes = (minutes < 10 ? "0" : "") + minutes;

    // Format the date as MM/DD/YYYY HH:MM AM/PM
    var formattedDate = `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;

    return formattedDate;
  }
</script>

<section class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden">
  <div class="w-full overflow-hidden m-auto">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full">
          <div class="w-full m-auto">
            {#if tickerFlow?.length > 0}
              <label
                for="dailyNetPutCallPrem"
                class="mr-1 cursor-pointer flex flex-row items-center text-xl sm:text-2xl font-bold w-fit"
              >
                Daily Net Put / Call Premium
                <InfoModal
                  title={"Daily Net Put / Call Premium"}
                  content={`Daily Net Put / Call Premium works similar like the Market Flow, which evaluates the balance between advancing and
                declining  price movements, net call
                premiums and net put premiums, providing a real-time snapshot of
                market sentiment and momentum. <a
                  href="/learning-center/article/market-sentiment-through-options-activity-riding-the-tide"
                  class="text-blue-400 sm:hover:text-white sm:hover:underline sm:hover:underline-offset-4"
                  >Learn more here.</a
                >`}
                  id={"dailyNetPutCallPrem"}
                />
              </label>

              <div class=" text-xs sm:text-sm italic mt-5 mb-3">
                Last Updated: {formatDate(findLastNonNull(tickerFlow, "time"))}
              </div>
              <div
                class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
              >
                <div
                  class="shadow-md bg-gray-100 dark:bg-gray-800/30 rounded-lg p-4 transition-colors"
                >
                  <div class=" text-sm mb-2 flex items-center">
                    <span>Volume</span>
                  </div>
                  <div class="flex items-baseline">
                    <span class="text-xl font-bold">
                      {abbreviateNumber(
                        findLastNonNull(tickerFlow, "net_volume"),
                        false,
                        true,
                      )}</span
                    >
                  </div>
                </div>

                <div
                  class="shadow-md bg-gray-100 dark:bg-gray-800/30 rounded-lg p-4 transition-colors"
                >
                  <div class=" text-sm mb-2 flex items-center">
                    <span>Net Call Prem</span>
                  </div>
                  <div class="flex items-baseline">
                    <span class="text-xl font-bold"
                      >{abbreviateNumber(
                        findLastNonNull(tickerFlow, "net_call_premium"),
                        false,
                        true,
                      )}</span
                    >
                  </div>
                </div>

                <div
                  class="shadow-md bg-gray-100 dark:bg-gray-800/30 rounded-lg p-4 transition-colors"
                >
                  <div class=" text-sm mb-2 flex items-center">
                    <span>Net Put Prem</span>
                  </div>
                  <div class="flex items-baseline">
                    <span class="text-xl font-bold"
                      >{abbreviateNumber(
                        findLastNonNull(tickerFlow, "net_put_premium"),
                        false,
                        true,
                      )}</span
                    >
                  </div>
                </div>
              </div>
              <!--
              <div>
                <div
                  class="chart border border-gray-800 rounded"
                  use:highcharts={config}
                ></div>
              </div>
              -->
            {/if}
          </div>
        </main>
      </div>
    </div>
  </div>
</section>
