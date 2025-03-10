<script lang="ts">
  import ArrowLogo from "lucide-svelte/icons/move-up-right";
  import { Chart } from "svelte-echarts";
  import Lazy from "$lib/components/Lazy.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  import SEO from "$lib/components/SEO.svelte";
  import { init, use } from "echarts/core";
  import { LineChart, BarChart } from "echarts/charts";
  import { GridComponent, TooltipComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  use([LineChart, BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

  export let data;

  let isLoaded = false;
  let rawData;
  let tableList = [];
  let optionsData;
  let optionsCPI;
  let optionsGDP;
  let optionsInflation;
  let optionsFedFundRate;

  let activeIdx = 0;

  const tabs = [
    {
      title: "Annual",
    },
    {
      title: "Quarterly",
    },
  ];

  let timePeriod = "threeYears";
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const treasuryLabel = {
    month1: "1-Month",
    month2: "2-Month",
    month3: "3-Month",
    month6: "6-Month",
    year1: "1-Year",
    year2: "2-Year",
    year3: "3-Year",
    year5: "5-Year",
    year7: "7-Year",
    year10: "10-Year",
    year20: "20-Year",
    year30: "30-Year",
  };

  function filterEndOfYearDates(data) {
    // Step 1: Group data by year
    const groupedByYear = data.reduce((acc, item) => {
      const year = new Date(item.date).getFullYear();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(item);
      return acc;
    }, {});

    // Step 2: For each year, find the entry with the latest date
    const annualData = Object.values(groupedByYear).map((yearData) => {
      return yearData.reduce((latest, current) => {
        return new Date(latest.date) > new Date(current.date)
          ? latest
          : current;
      });
    });

    return annualData;
  }

  function filterEndOfQuarterDates(data) {
    // Step 1: Group data by year and quarter
    const groupedByQuarter = data?.reduce((acc, item) => {
      const date = new Date(item?.date);
      const year = date.getFullYear();
      const quarter = Math?.floor(date?.getMonth() / 3) + 1; // Get the quarter (1-4)

      const key = `${year}-Q${quarter}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});

    // Step 2: For each year-quarter group, find the entry with the latest date
    const quarterlyData = Object?.values(groupedByQuarter)?.map(
      (quarterData) => {
        return quarterData?.reduce((latest, current) => {
          return new Date(latest?.date) > new Date(current?.date)
            ? latest
            : current;
        });
      },
    );

    return quarterlyData;
  }

  function changeTablePeriod(index) {
    activeIdx = index;
    if (activeIdx === 0) {
      tableList = filterEndOfYearDates(rawData);
    } else {
      if (["Pro", "Plus"]?.includes(data?.user?.tier)) {
        tableList = filterEndOfQuarterDates(rawData);
      } else {
        goto("/pricing");
      }
    }
    tableList?.sort((a, b) => new Date(b?.date) - new Date(a?.date));
  }

  async function changeStatement(event) {
    timePeriod = event.target.value;

    optionsData = await plotData();
  }

  // Function to filter data by a specified time period
  function filterDataByTimePeriod(rawData, timePeriod) {
    let dates = [];
    let seriesData = {};

    const now = new Date();

    // Calculate the date threshold based on the selected time period
    let thresholdDate;
    switch (timePeriod) {
      case "oneMonth":
        thresholdDate = new Date(now);
        thresholdDate.setMonth(now.getMonth() - 1);
        break;
      case "sixMonths":
        thresholdDate = new Date(now);
        thresholdDate.setMonth(now.getMonth() - 6);
        break;
      case "oneYear":
        thresholdDate = new Date(now);
        thresholdDate.setFullYear(now.getFullYear() - 1);
        break;
      case "threeYears":
        thresholdDate = new Date(now);
        thresholdDate.setFullYear(now.getFullYear() - 3);
        break;
      case "fiveYears":
        thresholdDate = new Date(now);
        thresholdDate.setFullYear(now.getFullYear() - 5);
        break;
      case "tenYears":
        thresholdDate = new Date(now);
        thresholdDate.setFullYear(now.getFullYear() - 10);
        break;
      case "max":
      default:
        thresholdDate = new Date(0); // Set to the earliest possible date
        break;
    }

    // Filter the data based on the threshold date
    rawData?.forEach((item) => {
      const itemDate = new Date(item?.date);
      if (itemDate >= thresholdDate) {
        dates.push(item?.date);

        // Iterate over each key in the item, except for 'date'
        Object.keys(item).forEach((key) => {
          if (key !== "date") {
            // Initialize the array if it doesn't exist
            if (!seriesData[key]) {
              seriesData[key] = [];
            }
            // Push the corresponding value into the appropriate array
            seriesData[key].push(item[key]);
          }
        });
      }
    });

    return { dates, seriesData };
  }

  // Function to plot data based on a specified time period
  async function plotData() {
    // Get the filtered data based on the selected time period
    const { dates, seriesData } = filterDataByTimePeriod(rawData, timePeriod);

    // Convert seriesData to the format required by the series property
    let series = Object?.keys(seriesData).map((key) => {
      return {
        name: treasuryLabel[key],
        data: seriesData[key],
        type: "line",
        smooth: true,
        showSymbol: false,
      };
    });

    const options = {
      animation: false,
      grid: {
        left: "2%",
        right: "2%",
        bottom: "2%",
        top: "10%",
        containLabel: true,
      },
      xAxis: {
        axisLabel: {
          color: "#fff",
          formatter: function (value) {
            // Assuming dates are in the format 'yyyy-mm-dd'
            // Extract the month and day from the date string and convert the month to its abbreviated name
            const dateParts = value.split("-");
            const year = dateParts[0].substring(2); // Extracting the last two digits of the year
            const monthIndex = parseInt(dateParts[1]) - 1; // Months are zero-indexed in JavaScript Date objects
            return `${monthNames[monthIndex]} '${year}`;
          },
        },
        data: dates,
        type: "category",
      },
      yAxis: [
        {
          type: "value",
          splitLine: {
            show: false, // Disable x-axis grid lines
          },
          axisLabel: {
            show: false,
          },
        },
        {
          type: "value",
          splitLine: {
            show: false, // Disable x-axis grid lines
          },
        },
      ],
      series: series, // Use the dynamically created series array
      tooltip: {
        trigger: "axis",
        hideDelay: 100,
      },
    };

    return options;
  }

  async function plotCPI() {
    // Get the filtered data based on the selected time period
    let dates = [];
    let valueList = [];
    // Iterate over the data and extract required information
    data?.getEconomicIndicator?.cpi?.forEach((item) => {
      dates?.push(item?.date);
      valueList?.push(item?.value);
    });

    const options = {
      animation: false,
      grid: {
        left: "2%",
        right: "2%",
        bottom: "2%",
        top: "10%",
        containLabel: true,
      },
      xAxis: {
        axisLabel: {
          color: "#fff",
          formatter: function (value) {
            // Assuming dates are in the format 'yyyy-mm-dd'
            // Extract the month and day from the date string and convert the month to its abbreviated name
            const dateParts = value.split("-");
            const year = dateParts[0].substring(2); // Extracting the last two digits of the year
            const monthIndex = parseInt(dateParts[1]) - 1; // Months are zero-indexed in JavaScript Date objects
            return `${monthNames[monthIndex]} '${year}`;
          },
        },
        data: dates,
        type: "category",
      },
      yAxis: [
        {
          type: "value",
          splitLine: {
            show: false, // Disable x-axis grid lines
          },
          axisLabel: {
            show: false,
          },
        },
        {
          type: "value",
          splitLine: {
            show: false, // Disable x-axis grid lines
          },
        },
      ],
      series: {
        name: "CPI",
        data: valueList,
        type: "line",
        areaStyle: { opacity: 0.02 },
        smooth: true,
        symbol: "none",
        itemStyle: {
          color: "#fff",
        },
      },
      tooltip: {
        trigger: "axis",
        hideDelay: 100,
      },
    };

    return options;
  }

  async function plotGDP() {
    // Get the filtered data based on the selected time period
    let dates = [];
    let gdpList = [];
    let realGDPList = [];
    let realGDPPerCapitaList = [];
    // Iterate over the data and extract required information
    data?.getEconomicIndicator?.gdp?.forEach((item) => {
      dates?.push(item?.date);
      gdpList?.push(item?.value);
    });

    data?.getEconomicIndicator?.realGDP?.forEach((item) => {
      realGDPList?.push(item?.value);
    });

    data?.getEconomicIndicator?.realGDPPerCapita?.forEach((item) => {
      realGDPPerCapitaList?.push(item?.value);
    });

    const options = {
      animation: false,
      grid: {
        left: "2%",
        right: "2%",
        bottom: "2%",
        top: "10%",
        containLabel: true,
      },
      xAxis: {
        axisLabel: {
          color: "#fff",
          formatter: function (value) {
            // Assuming dates are in the format 'yyyy-mm-dd'
            // Extract the month and day from the date string and convert the month to its abbreviated name
            const dateParts = value.split("-");
            const year = dateParts[0].substring(2); // Extracting the last two digits of the year
            const monthIndex = parseInt(dateParts[1]) - 1; // Months are zero-indexed in JavaScript Date objects
            return `${monthNames[monthIndex]} '${year}`;
          },
        },
        data: dates,
        type: "category",
      },
      yAxis: [
        {
          type: "value",
          splitLine: {
            show: false, // Disable x-axis grid lines
          },
          axisLabel: {
            show: false,
          },
        },
        {
          type: "value",
          splitLine: {
            show: false, // Disable x-axis grid lines
          },
          axisLabel: {
            show: false,
          },
        },
      ],
      series: [
        {
          name: "GDP",
          data: gdpList,
          type: "line",
          smooth: true,
          showSymbol: false,
        },
        {
          name: "Real GDP",
          data: realGDPList,
          type: "line",
          smooth: true,
          showSymbol: false,
        },
        {
          name: "Real GDP Per Capita",
          data: realGDPPerCapitaList,
          type: "line",
          yAxisIndex: 1,
          smooth: true,
          showSymbol: false,
        },
      ],
      tooltip: {
        trigger: "axis",
        hideDelay: 100,
      },
    };

    return options;
  }

  async function plotInflation() {
    // Get the filtered data based on the selected time period
    let dates = [];
    let inflationRateList = [];
    let recessionList = [];
    // Iterate over the data and extract required information
    data?.getEconomicIndicator?.inflationRate?.forEach((item) => {
      dates?.push(item?.date);
      inflationRateList?.push(item?.value);
    });

    data?.getEconomicIndicator?.unemploymentRate?.forEach((item) => {
      recessionList?.push(item?.value);
    });

    const options = {
      animation: false,
      grid: {
        left: "2%",
        right: "2%",
        bottom: "2%",
        top: "10%",
        containLabel: true,
      },
      xAxis: {
        axisLabel: {
          color: "#fff",
          formatter: function (value) {
            // Assuming dates are in the format 'yyyy-mm-dd'
            // Extract the month and day from the date string and convert the month to its abbreviated name
            const dateParts = value.split("-");
            const year = dateParts[0].substring(2); // Extracting the last two digits of the year
            const monthIndex = parseInt(dateParts[1]) - 1; // Months are zero-indexed in JavaScript Date objects
            return `${monthNames[monthIndex]} '${year}`;
          },
        },
        data: dates,
        type: "category",
      },
      yAxis: [
        {
          type: "value",
          splitLine: {
            show: false, // Disable x-axis grid lines
          },
          axisLabel: {
            show: false,
          },
        },
        {
          type: "value",
          splitLine: {
            show: false, // Disable x-axis grid lines
          },
          axisLabel: {
            show: false,
          },
        },
      ],
      series: [
        {
          name: "Inflation Rate",
          data: inflationRateList,
          type: "line",
          smooth: true,
          showSymbol: false,
        },
        {
          name: "Unemployment Rate",
          data: recessionList,
          yAxisIndex: 1,

          type: "line",
          smooth: true,
          showSymbol: false,
        },
      ],
      tooltip: {
        trigger: "axis",
        hideDelay: 100,
      },
    };

    return options;
  }

  async function plotFedFundRate() {
    // Get the filtered data based on the selected time period
    let dates = [];
    let valueList = [];
    // Iterate over the data and extract required information
    data?.getEconomicIndicator?.fedFundRate?.forEach((item) => {
      dates?.push(item?.date);
      valueList?.push(item?.value);
    });

    const options = {
      animation: false,
      grid: {
        left: "2%",
        right: "2%",
        bottom: "2%",
        top: "10%",
        containLabel: true,
      },
      xAxis: {
        axisLabel: {
          color: "#fff",
          formatter: function (value) {
            // Assuming dates are in the format 'yyyy-mm-dd'
            // Extract the month and day from the date string and convert the month to its abbreviated name
            const dateParts = value.split("-");
            const year = dateParts[0].substring(2); // Extracting the last two digits of the year
            const monthIndex = parseInt(dateParts[1]) - 1; // Months are zero-indexed in JavaScript Date objects
            return `${monthNames[monthIndex]} '${year}`;
          },
        },
        data: dates,
        type: "category",
      },
      yAxis: [
        {
          type: "value",
          splitLine: {
            show: false, // Disable x-axis grid lines
          },
          axisLabel: {
            show: false,
          },
        },
        {
          type: "value",
          splitLine: {
            show: false, // Disable x-axis grid lines
          },
        },
      ],
      series: {
        name: "Fed Fund Rate",
        data: valueList,
        type: "line",
        areaStyle: { opacity: 0.02 },
        smooth: true,
        symbol: "none",
        itemStyle: {
          color: "#fff",
        },
      },
      tooltip: {
        trigger: "axis",
        hideDelay: 100,
      },
    };

    return options;
  }

  onMount(async () => {
    rawData = data?.getEconomicIndicator?.treasury ?? {};

    // Run the async functions concurrently
    [
      optionsData,
      optionsCPI,
      optionsGDP,
      optionsInflation,
      optionsFedFundRate,
    ] = await Promise.all([
      plotData(),
      plotCPI(),
      plotGDP(),
      plotInflation(),
      plotFedFundRate(),
    ]);

    tableList = filterEndOfYearDates(rawData);
    tableList?.sort((a, b) => new Date(b?.date) - new Date(a?.date));

    isLoaded = true;
  });
</script>

<SEO
  title="US Economic Indicators - Track Key Growth Metrics"
  description="Monitor key US economic indicators to measure economic performance and identify growth trends. Stay informed with real-time data and analysis."
/>

<section
  class="w-full max-w-(--breakpoint-2xl) overflow-hidden min-h-screen pb-20 pt-5 px-4 lg:px-3"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li class="text-gray-300">US Economic Indicator</li>
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
              Economic Indicators
            </h1>
          </div>

          {#if isLoaded}
            <Infobox
              text="Real-time and historical data on key economic indicators like GDP,
              unemployment, and inflation, essential for tracking economic performance
              and growth trends."
            />

            <div class="w-full m-auto mt-10">
              <h2 class="text-xl sm:text-2xl text-gray-200 font-bold">
                Federal Fund Rate
              </h2>

              <div class="text-[1rem] text-white mt-2 mb-2">
                The federal funds rate is the interest rate at which banks lend
                to each other overnight to maintain reserve balances. It's a
                critical tool for U.S. monetary policy, influencing borrowing
                costs for consumers and businesses, economic growth, and
                inflation. Changes in the federal funds rate affect everything
                from loan interest rates to stock market performance, making it
                a key indicator of economic health.
              </div>

              <Lazy>
                <div class="app w-full">
                  <Chart {init} options={optionsFedFundRate} class="chart" />
                </div>
              </Lazy>

              <h2
                class="text-xl sm:text-2xl text-gray-200 font-bold mt-20 sm:mt-10"
              >
                Consumer Price Index (CPI)
              </h2>

              <div class="text-[1rem] text-white mt-2 mb-2">
                The CPI measures the average change in prices for a typical
                basket of goods. It's key for tracking inflation, affecting
                interest rates, wages, and business decisions. Rising CPI
                indicates inflation, impacting purchasing power and the overall
                economy.
              </div>

              <Lazy>
                <div class="app w-full">
                  <Chart {init} options={optionsCPI} class="chart" />
                </div>
              </Lazy>

              <h2
                class="text-xl sm:text-2xl text-gray-200 font-bold mt-20 sm:mt-10"
              >
                Gross Domestic Product (GDP)
              </h2>

              <div class="text-[1rem] text-white mt-2 mb-2">
                The GDP measures a country's economic performance, representing
                the total value of all goods and services produced within a
                specific period. It's a key indicator of economic health, used
                to compare the economic output of different nations and track
                growth or decline over time.
              </div>

              <Lazy>
                <div class="app w-full">
                  <Chart {init} options={optionsGDP} class="chart" />
                </div>
              </Lazy>

              <h2
                class="text-xl sm:text-2xl text-gray-200 font-bold mt-20 sm:mt-10"
              >
                Unemployment Rate vs Inflation Rate
              </h2>

              <div class="text-[1rem] text-white mt-2 mb-2">
                The unemployment rate measures the jobless percentage in the
                labor force, impacting spending and growth. Low unemployment
                boosts wages and activity, while high unemployment slows them.
                The inflation rate tracks price increases, with moderate
                inflation (~2%) being healthy. These rates are often inversely
                related and crucial for economic stability, influencing
                spending, savings, and investment.
              </div>

              <Lazy>
                <div class="app w-full">
                  <Chart {init} options={optionsInflation} class="chart" />
                </div>
              </Lazy>

              <h2
                class="text-xl sm:text-2xl text-gray-200 font-bold mt-20 sm:mt-10"
              >
                Treasury Rates
              </h2>

              <div class="text-[1rem] text-white mt-2 mb-2">
                Treasury rates are the interest rates that the US government
                pays on its debt obligations, and they are a key benchmark for
                interest rates across the economy.
              </div>

              <div class="w-full text-white">
                <div class="relative flex justify-end">
                  <select
                    class="w-24 select select-bordered select-sm p-0 pl-5 bg-secondary"
                    on:change={changeStatement}
                  >
                    <option disabled>Choose a Time Period</option>
                    <option value="oneMonth">1M</option>
                    <option value="sixMonths">6M</option>
                    <option value="oneYear">1Y</option>
                    <option value="threeYears" selected>3Y</option>
                    <option value="fiveYears">5Y</option>
                    <option value="max">Max</option>
                  </select>
                </div>
              </div>
              <Lazy>
                <div class="app w-full">
                  <Chart {init} options={optionsData} class="chart" />
                </div>
              </Lazy>

              <div
                class="mt-10 mb-4 bg-secondary w-fit relative flex flex-wrap items-center justify-center rounded-md p-1 flex justify-center sm:justify-end items-center ml-auto"
              >
                {#each tabs as item, i}
                  <button
                    on:click={() => changeTablePeriod(i)}
                    class="group relative z-1 rounded-full px-6 py-1 {activeIdx ===
                    i
                      ? 'z-0'
                      : ''} "
                  >
                    {#if activeIdx === i}
                      <div class="absolute inset-0 rounded-md bg-[#fff]"></div>
                    {/if}
                    <span
                      class="relative text-sm block font-semibold whitespace-nowrap {activeIdx ===
                      i
                        ? 'text-black'
                        : 'text-white'}"
                    >
                      {item.title}
                      <svg
                        class="{!['Pro', 'Plus']?.includes(data?.user?.tier) &&
                        i === 1
                          ? ''
                          : 'hidden'} inline-block ml-0.5 -mt-1 w-3.5 h-3.5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        ><path
                          fill="#fff"
                          d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                        /></svg
                      >
                    </span>
                  </button>
                {/each}
              </div>

              <div class="w-full overflow-x-auto">
                <table
                  class="table table-sm table-compact rounded-none sm:rounded-md w-full bg-table border border-gray-800 m-auto mt-4"
                >
                  <thead class="bg-default">
                    <tr class="">
                      <th
                        class="text-white font-semibold text-start text-sm sm:text-[1rem]"
                        >Date</th
                      >
                      <th
                        class="text-white font-semibold text-end text-sm sm:text-[1rem]"
                        >1-Month</th
                      >
                      <th
                        class="text-white font-semibold text-end text-sm sm:text-[1rem]"
                        >2-Month</th
                      >
                      <th
                        class="text-white font-semibold text-end text-sm sm:text-[1rem]"
                        >3-Month</th
                      >
                      <th
                        class="text-white font-semibold text-end text-sm sm:text-[1rem]"
                        >6-Month</th
                      >
                      <th
                        class="text-white font-semibold text-end text-sm sm:text-[1rem]"
                        >1-Year</th
                      >
                      <th
                        class="text-white font-semibold text-end text-sm sm:text-[1rem]"
                        >2-Year</th
                      >
                      <th
                        class="text-white font-semibold text-end text-sm sm:text-[1rem]"
                        >3-Year</th
                      >
                      <th
                        class="text-white font-semibold text-end text-sm sm:text-[1rem]"
                        >5-Year</th
                      >
                      <th
                        class="text-white font-semibold text-end text-sm sm:text-[1rem]"
                        >7-Year</th
                      >
                      <th
                        class="text-white font-semibold text-end text-sm sm:text-[1rem]"
                        >10-Year</th
                      >
                      <th
                        class="text-white font-semibold text-end text-sm sm:text-[1rem]"
                        >20-Year</th
                      >
                      <th
                        class="text-white font-semibold text-end text-sm sm:text-[1rem]"
                        >30-Year</th
                      >
                    </tr>
                  </thead>
                  <tbody>
                    {#each tableList as item}
                      <!-- row -->
                      <tr
                        class="sm:hover:bg-[#245073]/10 odd:bg-odd border border-gray-800"
                      >
                        <td
                          class="text-white text-sm sm:text-[1rem] whitespace-nowrap"
                        >
                          {item?.date}
                        </td>
                        <td
                          class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                        >
                          {item?.month1}
                        </td>
                        <td
                          class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                        >
                          {item?.month2 !== null ? item?.month2 : "-"}
                        </td>
                        <td
                          class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                        >
                          {item?.month3}
                        </td>
                        <td
                          class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                        >
                          {item?.month6}
                        </td>
                        <td
                          class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                        >
                          {item?.year1}
                        </td>
                        <td
                          class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                        >
                          {item?.year2}
                        </td>
                        <td
                          class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                        >
                          {item?.year3}
                        </td>
                        <td
                          class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                        >
                          {item?.year5}
                        </td>
                        <td
                          class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                        >
                          {item?.year7}
                        </td>
                        <td
                          class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                        >
                          {item?.year10}
                        </td>
                        <td
                          class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                        >
                          {item?.year20}
                        </td>
                        <td
                          class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
                        >
                          {item?.year30}
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
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
        </main>
        <aside class="hidden lg:block relative fixed w-1/4 ml-4">
          <div
            class="w-full border border-gray-300 dark:border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer sm:hover:shadow-lg dark:sm:hover:bg-secondary transition ease-out duration-100"
          >
            <a
              href="/economic-calendar"
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold ml-3">
                  Economic Events
                </h2>
                <ArrowLogo
                  class="w-8 h-8 mr-3 shrink-0 text-gray-400 dark:text-white"
                />
              </div>
              <span class="p-3 ml-3 mr-3">
                Stay updated on upcoming Economic Events worldwide.
              </span>
            </a>
          </div>

          <div
            class="w-full border border-gray-300 dark:border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer sm:hover:shadow-lg dark:sm:hover:bg-secondary transition ease-out duration-100"
          >
            <a
              href="/earnings-calendar"
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold ml-3">
                  Earnings Calendar
                </h2>
                <ArrowLogo
                  class="w-8 h-8 mr-3 shrink-0 text-gray-400 dark:text-white"
                />
              </div>
              <span class="p-3 ml-3 mr-3">
                Get the latest Earnings of companies.
              </span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  </div>
</section>

<style>
  .app {
    height: 400px;
    width: 100%;
  }

  @media (max-width: 560px) {
    .app {
      width: 100%;
      height: 300px;
    }
  }

  .chart {
    width: 100%;
  }
</style>
