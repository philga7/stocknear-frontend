<script lang="ts">
  import { displayCompanyName, screenWidth, stockTicker } from "$lib/store";
  import { mode } from "mode-watcher";
  import { abbreviateNumber } from "$lib/utils";
  import { onMount } from "svelte";
  import highcharts from "$lib/highcharts.ts";

  import Infobox from "$lib/components/Infobox.svelte";
  import SEO from "$lib/components/SEO.svelte";

  export let data;

  let rawData = data?.getOptionsChainStatistics;
  let optionList = rawData?.slice(0, 100);

  let configIV;
  let configOI;
  let configOIPutCall;
  let configVolume;
  let configVolumePutCall;

  const formatDate = (dateString: string): string => {
    if (!dateString) return "n/a";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "n/a"
      : date.toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
          timeZone: "UTC",
        });
  };

  function plotIV() {
    const options = {
      credits: {
        enabled: false,
      },
      chart: {
        type: "gauge",
        backgroundColor: $mode === "light" ? "#fff" : "#09090B",
        plotBackgroundColor: $mode === "light" ? "#fff" : "#09090B",
        height: 280,
        animation: false, // Disable initial animation
      },

      title: {
        text: `<h3 class="">IV (30d)</h3>`,
        style: {
          color: $mode === "light" ? "black" : "white",
          // Using inline CSS for margin-top and margin-bottom
        },
        useHTML: true, // Enable HTML to apply custom class styling
      },

      pane: {
        startAngle: -90,
        endAngle: 90,
        background: [
          {
            // Outer circle (black line)
            outerRadius: "101%",
            innerRadius: "100%",
            backgroundColor: "#000",
            borderWidth: 0,
            shape: "arc",
          },
          null, // keep existing null if needed
        ],
      },

      // the value axis
      yAxis: {
        min: 0,
        max: 100,
        tickPosition: "inside",
        tickLength: 10,
        tickWidth: 0,
        minorTickInterval: null,
        lineWidth: 0,
        // Remove numeric tick labels
        labels: {
          enabled: false,
        },
        plotBands: [
          {
            from: 0,
            to: 19.5,
            color: "#55BF3B",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 19.5,
            to: 20,
            color: "#fff",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 20,
            to: 39.5,
            color: "#55BF3B",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 39.5,
            to: 40,
            color: "#fff",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 40,
            to: 59.5,
            color: "#DDDF0D",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 59.5,
            to: 60,
            color: "#fff",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 60,
            to: 79.5,
            color: "#DF5353",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 79.5,
            to: 80,
            color: "#fff",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 80,
            to: 100,
            color: "#DF5353",
            thickness: 20,
            borderRadius: "0px",
          },
        ],
      },

      series: [
        {
          name: "IV",
          data: [55.8],
          animation: false,
          dataLabels: {
            useHTML: true, // ensure HTML works if you keep custom markup
            backgroundColor: "none", // removes background
            borderWidth: 0, // removes border
            shadow: false, // removes shadow
            format: '<span class="text-lg font-bold">{y}% IV</span>',
          },
          dial: {
            radius: "80%",
            backgroundColor: $mode === "light" ? "#000" : "#808080",
            baseWidth: 12,
            baseLength: "0%",
            rearLength: "0%",
          },
        },
      ],
    };

    return options;
  }

  function plotOI() {
    const optionsOI = {
      credits: {
        enabled: false,
      },
      chart: {
        type: "gauge",
        backgroundColor: $mode === "light" ? "#fff" : "#09090B",
        plotBackgroundColor: $mode === "light" ? "#fff" : "#09090B",
        height: 280,
        animation: false, // Disable initial animation
      },

      title: {
        text: `<h3 class="">Open Interest</h3>`,
        style: {
          color: $mode === "light" ? "black" : "white",
          // Using inline CSS for margin-top and margin-bottom
        },
        useHTML: true, // Enable HTML to apply custom class styling
      },

      pane: {
        startAngle: -90,
        endAngle: 90,
        background: [
          {
            // Outer circle (black line)
            outerRadius: "101%",
            innerRadius: "100%",
            backgroundColor: "#000",
            borderWidth: 0,
            shape: "arc",
          },
          null, // keep existing null if needed
        ],
      },

      // the value axis
      yAxis: {
        min: 0,
        max: 100,
        tickPosition: "inside",
        tickLength: 10,
        tickWidth: 0,
        minorTickInterval: null,
        lineWidth: 0,
        // Remove numeric tick labels
        labels: {
          enabled: false,
        },
        plotBands: [
          {
            from: 0,
            to: 19.5,
            color: "#55BF3B",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 19.5,
            to: 20,
            color: "#fff",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 20,
            to: 39.5,
            color: "#55BF3B",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 39.5,
            to: 40,
            color: "#fff",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 40,
            to: 59.5,
            color: "#DDDF0D",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 59.5,
            to: 60,
            color: "#fff",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 60,
            to: 79.5,
            color: "#DF5353",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 79.5,
            to: 80,
            color: "#fff",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 80,
            to: 100,
            color: "#DF5353",
            thickness: 20,
            borderRadius: "0px",
          },
        ],
      },

      series: [
        {
          name: "IV",
          data: [55.8],
          animation: false,
          dataLabels: {
            useHTML: true, // ensure HTML works if you keep custom markup
            backgroundColor: "none", // removes background
            borderWidth: 0, // removes border
            shadow: false, // removes shadow
            format: '<span class="text-lg font-bold">{y}% IV</span>',
          },
          dial: {
            radius: "80%",
            backgroundColor: $mode === "light" ? "#000" : "#808080",
            baseWidth: 12,
            baseLength: "0%",
            rearLength: "0%",
          },
        },
      ],
    };
    const optionsOIPutCall = {
      credits: {
        enabled: false,
      },
      chart: {
        type: "gauge",
        backgroundColor: $mode === "light" ? "#fff" : "#09090B",
        plotBackgroundColor: $mode === "light" ? "#fff" : "#09090B",
        height: 280,
        animation: false, // Disable initial animation
      },

      title: {
        text: `<h3 class="">Put-Call Ratio</h3>`,
        style: {
          color: $mode === "light" ? "black" : "white",
          // Using inline CSS for margin-top and margin-bottom
        },
        useHTML: true, // Enable HTML to apply custom class styling
      },

      pane: {
        startAngle: -90,
        endAngle: 90,
        background: [
          {
            // Outer circle (black line)
            outerRadius: "101%",
            innerRadius: "100%",
            backgroundColor: "#000",
            borderWidth: 0,
            shape: "arc",
          },
          null, // keep existing null if needed
        ],
      },

      // the value axis
      yAxis: {
        min: 0,
        max: 100,
        tickPosition: "inside",
        tickLength: 10,
        tickWidth: 0,
        minorTickInterval: null,
        lineWidth: 0,
        // Remove numeric tick labels
        labels: {
          enabled: false,
        },
        plotBands: [
          {
            from: 0,
            to: 19.5,
            color: "#55BF3B",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 19.5,
            to: 20,
            color: "#fff",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 20,
            to: 39.5,
            color: "#55BF3B",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 39.5,
            to: 40,
            color: "#fff",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 40,
            to: 59.5,
            color: "#DDDF0D",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 59.5,
            to: 60,
            color: "#fff",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 60,
            to: 79.5,
            color: "#DF5353",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 79.5,
            to: 80,
            color: "#fff",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 80,
            to: 100,
            color: "#DF5353",
            thickness: 20,
            borderRadius: "0px",
          },
        ],
      },

      series: [
        {
          name: "IV",
          data: [55.8],
          animation: false,
          dataLabels: {
            useHTML: true, // ensure HTML works if you keep custom markup
            backgroundColor: "none", // removes background
            borderWidth: 0, // removes border
            shadow: false, // removes shadow
            format: '<span class="text-lg font-bold">{y}% IV</span>',
          },
          dial: {
            radius: "80%",
            backgroundColor: $mode === "light" ? "#000" : "#808080",
            baseWidth: 12,
            baseLength: "0%",
            rearLength: "0%",
          },
        },
      ],
    };

    return { optionsOI, optionsOIPutCall };
  }

  function plotVolume() {
    const optionsVolume = {
      credits: {
        enabled: false,
      },
      chart: {
        type: "gauge",
        backgroundColor: $mode === "light" ? "#fff" : "#09090B",
        plotBackgroundColor: $mode === "light" ? "#fff" : "#09090B",
        height: 280,
        animation: false, // Disable initial animation
      },

      title: {
        text: `<h3 class="">Volume</h3>`,
        style: {
          color: $mode === "light" ? "black" : "white",
          // Using inline CSS for margin-top and margin-bottom
        },
        useHTML: true, // Enable HTML to apply custom class styling
      },

      pane: {
        startAngle: -90,
        endAngle: 90,
        background: [
          {
            // Outer circle (black line)
            outerRadius: "101%",
            innerRadius: "100%",
            backgroundColor: "#000",
            borderWidth: 0,
            shape: "arc",
          },
          null, // keep existing null if needed
        ],
      },

      // the value axis
      yAxis: {
        min: 0,
        max: 100,
        tickPosition: "inside",
        tickLength: 10,
        tickWidth: 0,
        minorTickInterval: null,
        lineWidth: 0,
        // Remove numeric tick labels
        labels: {
          enabled: false,
        },
        plotBands: [
          {
            from: 0,
            to: 19.5,
            color: "#55BF3B",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 19.5,
            to: 20,
            color: "#fff",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 20,
            to: 39.5,
            color: "#55BF3B",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 39.5,
            to: 40,
            color: "#fff",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 40,
            to: 59.5,
            color: "#DDDF0D",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 59.5,
            to: 60,
            color: "#fff",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 60,
            to: 79.5,
            color: "#DF5353",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 79.5,
            to: 80,
            color: "#fff",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 80,
            to: 100,
            color: "#DF5353",
            thickness: 20,
            borderRadius: "0px",
          },
        ],
      },

      series: [
        {
          name: "IV",
          data: [55.8],
          animation: false,
          dataLabels: {
            useHTML: true, // ensure HTML works if you keep custom markup
            backgroundColor: "none", // removes background
            borderWidth: 0, // removes border
            shadow: false, // removes shadow
            format: '<span class="text-lg font-bold">{y}% IV</span>',
          },
          dial: {
            radius: "80%",
            backgroundColor: $mode === "light" ? "#000" : "#808080",
            baseWidth: 12,
            baseLength: "0%",
            rearLength: "0%",
          },
        },
      ],
    };
    const optionsVolumePutCall = {
      credits: {
        enabled: false,
      },
      chart: {
        type: "gauge",
        backgroundColor: $mode === "light" ? "#fff" : "#09090B",
        plotBackgroundColor: $mode === "light" ? "#fff" : "#09090B",
        height: 280,
        animation: false, // Disable initial animation
      },

      title: {
        text: `<h3 class="">Put-Call Ratio</h3>`,
        style: {
          color: $mode === "light" ? "black" : "white",
          // Using inline CSS for margin-top and margin-bottom
        },
        useHTML: true, // Enable HTML to apply custom class styling
      },

      pane: {
        startAngle: -90,
        endAngle: 90,
        background: [
          {
            // Outer circle (black line)
            outerRadius: "101%",
            innerRadius: "100%",
            backgroundColor: "#000",
            borderWidth: 0,
            shape: "arc",
          },
          null, // keep existing null if needed
        ],
      },

      // the value axis
      yAxis: {
        min: 0,
        max: 100,
        tickPosition: "inside",
        tickLength: 10,
        tickWidth: 0,
        minorTickInterval: null,
        lineWidth: 0,
        // Remove numeric tick labels
        labels: {
          enabled: false,
        },
        plotBands: [
          {
            from: 0,
            to: 19.5,
            color: "#55BF3B",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 19.5,
            to: 20,
            color: "#fff",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 20,
            to: 39.5,
            color: "#55BF3B",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 39.5,
            to: 40,
            color: "#fff",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 40,
            to: 59.5,
            color: "#DDDF0D",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 59.5,
            to: 60,
            color: "#fff",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 60,
            to: 79.5,
            color: "#DF5353",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 79.5,
            to: 80,
            color: "#fff",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 80,
            to: 100,
            color: "#DF5353",
            thickness: 20,
            borderRadius: "0px",
          },
        ],
      },

      series: [
        {
          name: "IV",
          data: [55.8],
          animation: false,
          dataLabels: {
            useHTML: true, // ensure HTML works if you keep custom markup
            backgroundColor: "none", // removes background
            borderWidth: 0, // removes border
            shadow: false, // removes shadow
            format: '<span class="text-lg font-bold">{y}% IV</span>',
          },
          dial: {
            radius: "80%",
            backgroundColor: $mode === "light" ? "#000" : "#808080",
            baseWidth: 12,
            baseLength: "0%",
            rearLength: "0%",
          },
        },
      ],
    };

    return { optionsVolume, optionsVolumePutCall };
  }

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;
    if (isBottom && optionList?.length !== rawData?.length) {
      const nextIndex = optionList?.length;
      const filteredNewResults = rawData?.slice(nextIndex, nextIndex + 25);
      optionList = [...optionList, ...filteredNewResults];
    }
  }

  onMount(async () => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  $: {
    if ($mode) {
      configIV = plotIV();
      const { optionsOI, optionsOIPutCall } = plotOI();
      const { optionsVolume, optionsVolumePutCall } = plotVolume();

      configOI = optionsOI;
      configOIPutCall = optionsOIPutCall;
      configVolume = optionsVolume;
      configVolumePutCall = optionsVolumePutCall;
    }
  }
</script>

<SEO
  title={`${$displayCompanyName} (${$stockTicker}) Options Overview`}
  description={`View comprehensive ${$displayCompanyName} (${$stockTicker}) options with our latest charts on volume, open interest, max pain, and implied volatility.`}
/>

<section class="w-full overflow-hidden min-h-screen">
  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <div class="sm:pl-7 sm:pb-7 sm:pt-7 w-full m-auto mt-2 sm:mt-0">
        <!--
        {#if Object?.keys(dailyStats)?.length === 0 && rawData?.length === 0}
          <Infobox text="No Options data available" />
        {/if}
        -->

        <div class="w-full mb-10">
          <h2 class="mb-4 text-xl sm:text-2xl font-bold w-fit">
            {$stockTicker} Option Overview
          </h2>
          <p>
            Overview for all option chains of <strong>{$stockTicker}</strong>.
            As of
            <strong>July 11, 2025</strong>, <strong>{$stockTicker}</strong>
            options have an IV of <strong>55.80%</strong> and an IV rank of
            <strong>17.27%</strong>. The volume is <strong>2,857,903</strong>
            contracts, which is <strong>113.63%</strong> of average daily volume
            of <strong>2,515,089</strong> contracts. The volume put-call ratio
            is <strong>0.84</strong>, indicating a
            <strong>neutral</strong> sentiment in the market.
          </p>
        </div>

        <!-- Apply the blur class to the chart -->
        <h2 class="mb-6 text-xl sm:text-2xl font-bold w-fit">
          Implied Volatility
        </h2>
        <div
          class="flex flex-col -mt-4 mb-8 md:flex-row gap-4 justify-between items-center max-w-4xl w-full m-auto"
        >
          <!-- Gauge -->
          <div
            class="w-fit max-w-56 max-h-56 mx-auto md:mx-0 ml-auto"
            use:highcharts={configIV}
          ></div>

          <!-- Stats -->
          <div
            class="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm sm:text-[1rem] w-[50%]"
          >
            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-300"
                >Implied Volatility (30d)</span
              >
              <span class="font-semibold">55.80%</span>
            </div>

            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-300">IV Rank</span>
              <span class="font-semibold">17.27%</span>
            </div>

            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-300">IV Percentile</span
              >
              <span class="font-semibold">24.4%</span>
            </div>

            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-300"
                >Historical Volatility</span
              >
              <span class="font-semibold">70.09%</span>
            </div>

            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-300">IV Low</span>
              <span class="font-semibold">45.36% on 08/30/24</span>
            </div>

            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-300">IV High</span>
              <span class="font-semibold">105.85% on 04/08/25</span>
            </div>
          </div>
        </div>

        <h2 class="mb-6 text-xl sm:text-2xl font-bold w-fit">
          Open Interest (OI)
        </h2>
        <div
          class="flex flex-col -mt-2 mb-8 md:flex-row gap-4 justify-between items-center w-full m-auto"
        >
          <!-- Gauge -->
          <div
            class="w-fit max-w-56 max-h-56 mx-auto md:mx-0 ml-auto flex-shrink-0"
            use:highcharts={configOI}
          ></div>

          <div
            class="w-fit max-w-56 max-h-56 mx-auto md:mx-0 ml-auto flex-shrink-0"
            use:highcharts={configOIPutCall}
          ></div>

          <!-- Stats -->
          <div class="grid grid-cols-2 gap-8 text-sm sm:text-[1rem] w-[50%]">
            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-300"
                >Last Open Interest</span
              >
              <span class="font-semibold">5.80%</span>
            </div>

            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-300"
                >Put-Call Ratio</span
              >
              <span class="font-semibold">17.27%</span>
            </div>

            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-300"
                >Put Open Interest</span
              >
              <span class="font-semibold">24.4%</span>
            </div>

            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-300"
                >Call Open Interest</span
              >
              <span class="font-semibold">70.09%</span>
            </div>

            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-300"
                >Open Interest Avg (30-day)
              </span>
              <span class="font-semibold">45.36% </span>
            </div>

            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-300"
                >Today vs Open Interest Avg (30-day)
              </span>
              <span class="font-semibold">105.85% </span>
            </div>
          </div>
        </div>

        <h2 class="mb-6 text-xl sm:text-2xl font-bold w-fit">Option Volume</h2>
        <div
          class="flex flex-col -mt-2 mb-8 md:flex-row gap-4 justify-between items-center w-full"
        >
          <!-- Gauge -->
          <div
            class="w-fit max-w-56 max-h-56 mx-auto md:mx-0 ml-auto flex-shrink-0"
            use:highcharts={configVolume}
          ></div>

          <div
            class="w-fit max-w-56 max-h-56 mx-auto md:mx-0 ml-auto flex-shrink-0"
            use:highcharts={configVolumePutCall}
          ></div>

          <!-- Stats -->
          <div class="grid grid-cols-2 gap-8 text-sm sm:text-[1rem] w-[50%]">
            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-300">Last Volume</span>
              <span class="font-semibold">5.80%</span>
            </div>

            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-300"
                >Put-Call Ratio</span
              >
              <span class="font-semibold">17.27%</span>
            </div>

            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-300"
                >Put Open Interest</span
              >
              <span class="font-semibold">24.4%</span>
            </div>

            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-300"
                >Call Open Interest</span
              >
              <span class="font-semibold">70.09%</span>
            </div>

            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-300"
                >Volume Avg (30-day)
              </span>
              <span class="font-semibold">45.36% </span>
            </div>

            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-300"
                >Today vs Volume Avg (30-day)
              </span>
              <span class="font-semibold">105.85% </span>
            </div>
          </div>
        </div>

        {#if rawData?.length > 0}
          {#if optionList?.length !== 0}
            <h3 class="mb-4 text-xl sm:text-2xl font-bold w-fit">
              Option Chain Statistics
            </h3>

            <p>
              This table provides a comprehensive overview of all <strong
                >{$stockTicker}</strong
              >
              options grouped by their expiration dates.
            </p>

            <div class="flex justify-start items-center m-auto overflow-x-auto">
              <table
                class="table table-sm table-compact no-scrollbar rounded-none sm:rounded w-full border border-gray-300 dark:border-gray-800 m-auto mt-3"
              >
                <thead class="bg-default text-white">
                  <tr class="">
                    <td
                      class=" font-semibold text-sm text-start border-r border-gray-800"
                      >Expiration</td
                    >
                    <td
                      class=" font-semibold text-sm text-end border-r border-gray-800"
                      >Call Vol</td
                    >
                    <td
                      class=" font-semibold text-sm text-end border-r border-gray-800"
                      >Put Vol</td
                    >
                    <td
                      class=" font-semibold text-sm text-end border-r border-gray-800"
                      >P/C Vol</td
                    >
                    <td
                      class=" font-semibold text-sm text-end border-r border-gray-800"
                      >Call OI</td
                    >
                    <td
                      class=" font-semibold text-sm text-end border-r border-gray-800"
                      >Put OI</td
                    >

                    <td
                      class=" font-semibold text-sm text-end border-r border-gray-800"
                      >P/C OI</td
                    >
                    <td
                      class=" font-semibold text-sm text-end border-r border-gray-800"
                      >Implied Volatility</td
                    >
                    <td
                      class=" font-semibold text-sm text-end border-r border-gray-800"
                      >Max Pain</td
                    >
                  </tr>
                </thead>
                <tbody>
                  {#each optionList as item}
                    <tr
                      class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    >
                      <td class=" text-sm sm:text-[1rem] text-start">
                        {formatDate(item?.expiration)}
                      </td>

                      <td class="text-sm sm:text-[1rem] text-end">
                        {item?.callVol?.toLocaleString("en-US")}
                      </td>

                      <td class="text-sm sm:text-[1rem] text-end">
                        {item?.putVol?.toLocaleString("en-US")}
                      </td>

                      <td class="text-sm sm:text-[1rem] text-end">
                        {item?.pcVol}
                      </td>

                      <td class="text-sm sm:text-[1rem] text-end">
                        {item?.callOI?.toLocaleString("en-US")}
                      </td>

                      <td class="text-sm sm:text-[1rem] text-end">
                        {item?.putOI?.toLocaleString("en-US")}
                      </td>

                      <td class="text-sm sm:text-[1rem] text-end">
                        {item?.pcOI}
                      </td>

                      <td class="text-sm sm:text-[1rem] text-end">
                        {item?.avgIV ? item?.avgIV + "%" : "n/a"}
                      </td>

                      <td class="text-sm sm:text-[1rem] text-end">
                        {item?.maxPain}
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}
        {/if}
      </div>
    </div>
  </div>
</section>

<!--Start Options Detail Desktop Modal-->
