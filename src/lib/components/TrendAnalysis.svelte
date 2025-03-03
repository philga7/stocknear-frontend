<script lang 'ts'></script>

<section class="overflow-hidden text-white h-full pb-8 sm:pb-2">
  <main class="overflow-hidden">
    <div class="flex flex-row items-center">
      <label
        for="trendAnalysisInfo"
        class="mr-1 cursor-pointer flex flex-row items-center text-white text-xl sm:text-3xl font-bold"
      >
        AI Trend Analysis
      </label>
      <InfoModal
        title={"Trend Analysis"}
        content={`We trained our model using historical data of $${$assetType === "stock" ? $stockTicker : $assetType === "etf" ? $etfTicker : $cryptoTicker} and assessed its precision and accuracy with unseen company data to evaluate its performance. The model exhibits varying performance across different time periods.`}
        id={"trendAnalysisInfo"}
      />
    </div>

    {#if isLoaded}
      {#if trendList?.length !== 0}
        <div class="w-full flex flex-col items-start">
          <div class="text-white text-[1rem] mt-1 sm:mt-3 mb-1 w-full">
            Our model uses technical indicators to predict the next trend. Here
            are the stats of the model for {$displayCompanyName} to ensure transparency
            and reliability.
          </div>
        </div>

        <div class="w-full mt-5 mb-5 flex justify-start items-center">
          <div
            class="w-full grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-y-3 gap-x-3"
          >
            <!--Start Flow Sentiment-->
            <div
              class="flex flex-row items-center flex-wrap w-full px-3 sm:px-5 bg-primary shadow-lg rounded-md h-20"
            >
              <div class="flex flex-col items-start">
                <span class=" text-gray-200 text-sm"
                  >Trend Sentiment</span
                >
                <span
                  class="text-start text-[1rem] sm:text-lg font-semibold {flowSentiment ===
                  'Bullish'
                    ? 'text-[#00FC50]'
                    : 'text-[#FF2F1F]'}">{flowSentiment}</span
                >
              </div>
            </div>

            <!--End Flow Sentiment-->
            <!--Start Put/Call-->
            <div
              class="flex flex-row items-center flex-wrap w-full px-3 sm:px-5 bg-primary shadow-lg rounded-md h-20"
            >
              <div class="flex flex-col items-start">
                <span class=" text-gray-200 text-sm">Accuracy</span>
                <span
                  class="text-start text-sm sm:text-[1rem]  text-white"
                >
                  {accuracy >= 65
                    ? "Good"
                    : accuracy >= 50
                      ? "Moderate"
                      : "Bad"}
                </span>
              </div>
              <!-- Circular Progress -->
              <div class="relative size-14 ml-auto">
                <svg
                  class="size-full w-14 h-14"
                  viewBox="0 0 36 36"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <!-- Background Circle -->
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    class="stroke-current text-[#3E3E3E]"
                    stroke-width="3"
                  ></circle>
                  <!-- Progress Circle inside a group with rotation -->
                  <g class="origin-center -rotate-90 transform">
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      class="stroke-current {accuracy >= 65
                        ? 'text-[#00FC50]'
                        : accuracy >= 50
                          ? 'text-[#F8901E]'
                          : 'text-[#FF2F1F]'}"
                      stroke-width="3"
                      stroke-dasharray="100"
                      stroke-dashoffset={100 - accuracy}
                    ></circle>
                  </g>
                </svg>
                <!-- Percentage Text -->
                <div
                  class="absolute top-1/2 start-1/2 transform -translate-y-1/2 -translate-x-1/2"
                >
                  <span class="text-center text-white text-sm">{accuracy}%</span
                  >
                </div>
              </div>
              <!-- End Circular Progress -->
            </div>
            <!--End Put/Call-->

            <!--Start Precision-->
            <div
              class="flex flex-row items-center flex-wrap w-full px-3 sm:px-5 bg-primary shadow-lg rounded-md h-20"
            >
              <div class="flex flex-col items-start">
                <span class=" text-gray-200 text-sm">Precision</span>
                <span
                  class="text-start text-sm sm:text-[1rem]  text-white"
                >
                  {precision >= 65
                    ? "Good"
                    : precision >= 50
                      ? "Moderate"
                      : "Bad"}
                </span>
              </div>
              <!-- Circular Progress -->
              <div class="relative size-14 ml-auto">
                <svg
                  class="size-full w-14 h-14"
                  viewBox="0 0 36 36"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <!-- Background Circle -->
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    class="stroke-current text-[#3E3E3E]"
                    stroke-width="3"
                  ></circle>
                  <!-- Progress Circle inside a group with rotation -->
                  <g class="origin-center -rotate-90 transform">
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      class="stroke-current {precision >= 65
                        ? 'text-[#00FC50]'
                        : precision >= 50
                          ? 'text-[#F8901E]'
                          : 'text-[#FF2F1F]'}"
                      stroke-width="3"
                      stroke-dasharray="100"
                      stroke-dashoffset={100 - precision}
                    ></circle>
                  </g>
                </svg>
                <!-- Percentage Text -->
                <div
                  class="absolute top-1/2 start-1/2 transform -translate-y-1/2 -translate-x-1/2"
                >
                  <span class="text-center text-white text-sm"
                    >{precision}%</span
                  >
                </div>
              </div>
              <!-- End Circular Progress -->
            </div>
            <!--End Precision-->
          </div>
        </div>

        <select
          class="mt-1 sm:mt-3 ml-1 w-36 select select-bordered select-sm p-0 pl-5 overflow-y-auto bg-secondary"
          on:change={changeStatement}
        >
          <option disabled>Choose Time Period</option>
          <option disabled={deactivateContent} value="oneWeek">
            {!deactivateContent ? "Predict 1W" : "1W (Pro Only)"}
          </option>
          <option disabled={deactivateContent} value="oneMonth">
            {!deactivateContent ? "Predict 1M" : "1M (Pro Only)"}
          </option>
          <option value="threeMonth" selected>Predict 3M</option>
        </select>

        <div class="text-white text-[1rem] mt-4 sm:mt-7 ml-1">
          Over the next {displayData === "threeMonth"
            ? "3 months"
            : displayData === "oneMonth"
              ? "1 month"
              : "1 week"}, the model forecasts a
          <span
            class="font-semibold {flowSentiment === 'Bullish'
              ? 'text-[#00FC50]'
              : 'text-[#FF2F1F]'}">{flowSentiment}</span
          >
          trend, indicating that the future price is expected to {flowSentiment ===
          "Bullish"
            ? "exceed"
            : "to be less than"} the previous price of
          <span class="">${lastPrice ?? "n/a"}</span>.
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
</section>
