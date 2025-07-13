<script lang="ts">
  import { mode } from "mode-watcher";
  import { onMount } from "svelte";
  import highcharts from "$lib/highcharts.ts";
  import { abbreviateNumber } from "$lib/utils";
  import OPRADisclaimer from "$lib/components/Options/OPRADisclaimer.svelte";

  export let data;
  export let ticker;

  let overview = data?.getOptionsChainStatistics?.overview;
  let ivData = data?.getOptionsChainStatistics?.impliedVolatility;
  let oiData = data?.getOptionsChainStatistics?.openInterest;
  let volData = data?.getOptionsChainStatistics?.volume;

  let rawData = data?.getOptionsChainStatistics?.table;
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
        tickPosition: "outside",
        tickLength: 0,
        tickWidth: 0,
        minorTickInterval: null,
        lineWidth: 0,
        tickPositions: [20, 50, 80],
        labels: {
          enabled: true,
          distance: 20,
          style: {
            color: $mode === "light" ? "#000" : "#fff",
            fontSize: "15px",
          },
          formatter: function () {
            return this.value;
          },
          y: 0,
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
          data: [ivData?.current],
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
    const currentOI = oiData?.total ?? 0;
    const avgOI = oiData?.avgDaily * 2;

    // Define band breakpoints as fractions of avgOI
    const band1 = avgOI * 0.2;
    const band2 = avgOI * 0.4;
    const band3 = avgOI * 0.6;
    const band4 = avgOI * 0.8;

    const optionsOI = {
      credits: { enabled: false },

      chart: {
        type: "gauge",
        backgroundColor: $mode === "light" ? "#fff" : "#09090B",
        plotBackgroundColor: $mode === "light" ? "#fff" : "#09090B",
        height: 280,
        animation: false,
      },

      title: {
        text: `<h3 class="">Open Interest</h3>`,
        style: {
          color: $mode === "light" ? "black" : "white",
        },
        useHTML: true,
      },

      pane: {
        startAngle: -90,
        endAngle: 90,
        background: [
          {
            outerRadius: "101%",
            innerRadius: "100%",
            backgroundColor: "#000",
            borderWidth: 0,
            shape: "arc",
          },
          null,
        ],
      },

      yAxis: {
        min: 0,
        max: avgOI,
        tickPosition: "outside",
        tickLength: 0,
        tickWidth: 0,
        minorTickInterval: null,
        lineWidth: 0,
        labels: {
          enabled: true,
          distance: 20,
          style: {
            color: $mode === "light" ? "#000" : "#fff",
            fontSize: "15px",
          },
          formatter: function () {
            return abbreviateNumber(this.value);
          },
          y: 0,
        },
        plotBands: [
          { from: 0, to: band1, color: "#55BF3B", thickness: 20 },
          { from: band1, to: band2, color: "#55BF3B", thickness: 20 },
          { from: band2, to: band3, color: "#DDDF0D", thickness: 20 },
          { from: band3, to: band4, color: "#DF5353", thickness: 20 },
          { from: band4, to: avgOI, color: "#DF5353", thickness: 20 },
        ],
      },

      series: [
        {
          name: "OI",
          data: [currentOI],
          animation: false,
          dataLabels: {
            useHTML: true,
            backgroundColor: "none",
            borderWidth: 0,
            shadow: false,
            formatter: function () {
              return `<span class="text-lg font-bold">${abbreviateNumber(this.y)}</span>`;
            },
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

    const actualValue = oiData?.putCallRatio ?? 0;

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
        max: 2,
        tickPosition: "outside",
        tickLength: 10,
        tickWidth: 0,
        tickPositions: [0, 1, 2],
        minorTickInterval: null,
        lineWidth: 0,
        labels: {
          enabled: true,
          distance: 20, // move closer to the center
          style: {
            color: $mode === "light" ? "#000" : "#fff",
            fontSize: "15px",
          },
          formatter: function () {
            return this.value;
          },
          y: -0, // adjust vertical position upward
        },
        plotBands: [
          {
            from: 0,
            to: 0.49,
            color: "#55BF3B",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 0.49,
            to: 0.5,
            color: "#fff",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 0.5,
            to: 0.99,
            color: "#DDDF0D",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 0.99,
            to: 1,
            color: "#fff",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 1,
            to: 2,
            color: "#DF5353",
            thickness: 20,
            borderRadius: "0px",
          },
        ],
      },

      series: [
        {
          name: "OI P/C",
          data: [Math.min(actualValue, 2)], // dial limited to 2
          animation: false,
          dataLabels: {
            useHTML: true,
            backgroundColor: "none",
            borderWidth: 0,
            shadow: false,
            formatter: function () {
              // Show actual value even if >2
              return `<span class="text-lg font-bold">${actualValue}</span>`;
            },
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
    const currentVol = volData?.total ?? 0;
    const avgVol = volData?.avgDaily * 2;

    const band1 = avgVol * 0.2;
    const band2 = avgVol * 0.4;
    const band3 = avgVol * 0.6;
    const band4 = avgVol * 0.8;

    const optionsVolume = {
      credits: { enabled: false },

      chart: {
        type: "gauge",
        backgroundColor: $mode === "light" ? "#fff" : "#09090B",
        plotBackgroundColor: $mode === "light" ? "#fff" : "#09090B",
        height: 280,
        animation: false,
      },

      title: {
        text: `<h3 class="">Volume</h3>`,
        style: {
          color: $mode === "light" ? "black" : "white",
        },
        useHTML: true,
      },

      pane: {
        startAngle: -90,
        endAngle: 90,
        background: [
          {
            outerRadius: "101%",
            innerRadius: "100%",
            backgroundColor: "#000",
            borderWidth: 0,
            shape: "arc",
          },
          null,
        ],
      },

      yAxis: {
        min: 0,
        max: avgVol,
        tickPosition: "outside",
        tickLength: 0,
        tickWidth: 0,
        minorTickInterval: null,
        lineWidth: 0,
        labels: {
          enabled: true,
          distance: 20,
          style: {
            color: $mode === "light" ? "#000" : "#fff",
            fontSize: "15px",
          },
          formatter: function () {
            return abbreviateNumber(this.value);
          },
          y: 0,
        },
        plotBands: [
          { from: 0, to: band1, color: "#55BF3B", thickness: 20 },
          { from: band1, to: band2, color: "#55BF3B", thickness: 20 },
          { from: band2, to: band3, color: "#DDDF0D", thickness: 20 },
          { from: band3, to: band4, color: "#DF5353", thickness: 20 },
          { from: band4, to: avgVol, color: "#DF5353", thickness: 20 },
        ],
      },

      series: [
        {
          name: "Vol",
          data: [currentVol],
          animation: false,
          dataLabels: {
            useHTML: true,
            backgroundColor: "none",
            borderWidth: 0,
            shadow: false,
            formatter: function () {
              return `<span class="text-lg font-bold">${abbreviateNumber(this.y)}</span>`;
            },
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

    const actualValue = volData?.putCallRatio ?? 0;

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
        max: 2,
        tickPosition: "outside",
        tickLength: 10,
        tickWidth: 0,
        tickPositions: [0, 1, 2],
        minorTickInterval: null,
        lineWidth: 0,
        labels: {
          enabled: true,
          distance: 20, // move closer to the center
          style: {
            color: $mode === "light" ? "#000" : "#fff",
            fontSize: "15px",
          },
          formatter: function () {
            return this.value;
          },
          y: -0, // adjust vertical position upward
        },
        plotBands: [
          {
            from: 0,
            to: 0.49,
            color: "#55BF3B",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 0.49,
            to: 0.5,
            color: "#fff",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 0.5,
            to: 0.99,
            color: "#DDDF0D",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 0.99,
            to: 1,
            color: "#fff",
            thickness: 20,
            borderRadius: "0px",
          },
          {
            from: 1,
            to: 2,
            color: "#DF5353",
            thickness: 20,
            borderRadius: "0px",
          },
        ],
      },

      series: [
        {
          name: "Vol P/C",
          data: [Math.min(actualValue, 2)], // dial limited to 2
          animation: false,
          dataLabels: {
            useHTML: true,
            backgroundColor: "none",
            borderWidth: 0,
            shadow: false,
            formatter: function () {
              // Show actual value even if >2
              return `<span class="text-lg font-bold">${actualValue}</span>`;
            },
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
          <h2 class="mb-2 text-xl sm:text-2xl font-bold w-fit">
            {ticker} Option Overview
          </h2>
          <OPRADisclaimer />
          <p>
            Overview for all option chains of <strong>{ticker}</strong>. As of
            <strong>{overview?.date}</strong>, <strong>{ticker}</strong>
            options have an IV of
            <strong
              >{overview?.currentIV ? overview?.currentIV + "%" : "n/a"}</strong
            >
            and an IV rank of
            <strong>{overview?.ivRank ? overview?.ivRank + "%" : "n/a"}</strong
            >. The volume is
            <strong>{overview?.totalVolume?.toLocaleString("en-US")}</strong>
            contracts, which is
            <strong
              >{overview?.volumePercentage
                ? overview?.volumePercentage + "%"
                : "n/a"}</strong
            >
            of average daily volume of
            <strong>{overview?.avgDailyVolume?.toLocaleString("en-US")}</strong>
            contracts. The volume put-call ratio is
            <strong>{overview?.putCallRatio}</strong>, indicating a
            <strong>{overview?.sentiment}</strong> sentiment in the market.
          </p>
        </div>

        <!-- Apply the blur class to the chart -->
        <h2 class="mb-6 text-xl sm:text-2xl font-bold w-fit">
          Implied Volatility
        </h2>
        <div
          class="flex flex-col -mt-2 mb-8 md:flex-row gap-4 justify-between items-center w-full m-auto"
        >
          <!-- Gauge -->
          <div
            class="invisible max-w-56 max-h-56 mx-auto md:mx-0 ml-auto"
          ></div>

          <div
            class="w-fit max-w-56 max-h-56 mx-auto md:mx-0 m-auto"
            use:highcharts={configIV}
          ></div>

          <!-- Stats -->
          <div
            class="grid grid-cols-2 gap-8 p-3 sm:p-0 text-[1rem] w-full sm:w-[50%]"
          >
            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-300"
                >Implied Volatility (30d)</span
              >
              <span class="font-semibold"
                >{ivData?.current ? ivData?.current + "%" : "n/a"}</span
              >
            </div>

            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-300">IV Rank</span>
              <span class="font-semibold"
                >{ivData?.ivRank ? ivData?.ivRank + "%" : "n/a"}</span
              >
            </div>

            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-300"
                >Historical Volatility</span
              >
              <span class="font-semibold"
                >{ivData?.historicalVolatility
                  ? ivData?.historicalVolatility + "%"
                  : "n/a"}</span
              >
            </div>

            <div class="flex flex-col whitespace-nowrap">
              <span class="text-gray-500 dark:text-gray-300">IV Low</span>
              <span class="font-semibold"
                >{ivData?.ivLow ? ivData?.ivLow + "%" : "n/a"} on {ivData?.ivLowDate}</span
              >
            </div>

            <div class="flex flex-col whitespace-nowrap">
              <span class="text-gray-500 dark:text-gray-300">IV High</span>
              <span class="font-semibold"
                >{ivData?.ivHigh ? ivData?.ivHigh + "%" : "n/a"} on {ivData?.ivHighDate}</span
              >
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
          <div
            class="grid grid-cols-2 gap-8 p-3 sm:p-0 text-[1rem] w-full sm:w-[50%]"
          >
            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-300"
                >Last Open Interest</span
              >
              <span class="font-semibold"
                >{oiData?.total?.toLocaleString("en-US")}</span
              >
            </div>

            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-300"
                >Put-Call Ratio</span
              >
              <span class="font-semibold">{oiData?.putCallRatio}</span>
            </div>

            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-300"
                >Put Open Interest</span
              >
              <span class="font-semibold"
                >{oiData?.puts?.toLocaleString("en-US")}</span
              >
            </div>

            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-300"
                >Call Open Interest</span
              >
              <span class="font-semibold"
                >{oiData?.calls?.toLocaleString("en-US")}</span
              >
            </div>

            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-300"
                >Open Interest Avg (30-day)
              </span>
              <span class="font-semibold"
                >{oiData?.avgDaily?.toLocaleString("en-US")}</span
              >
            </div>

            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-300"
                >Today vs Open Interest Avg (30-day)
              </span>
              <span class="font-semibold"
                >{oiData?.todayVsAvg ? oiData?.todayVsAvg + "%" : "n/a"}</span
              >
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
          <div
            class="grid grid-cols-2 gap-8 p-3 sm:p-0 text-[1rem] w-full sm:w-[50%]"
          >
            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-300">Last Volume</span>
              <span class="font-semibold"
                >{volData?.total?.toLocaleString("en-US")}</span
              >
            </div>

            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-300"
                >Put-Call Ratio</span
              >
              <span class="font-semibold">{volData?.putCallRatio}</span>
            </div>

            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-300"
                >Put Open Interest</span
              >
              <span class="font-semibold"
                >{volData?.puts?.toLocaleString("en-US")}</span
              >
            </div>

            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-300"
                >Call Open Interest</span
              >
              <span class="font-semibold"
                >{volData?.calls?.toLocaleString("en-US")}</span
              >
            </div>

            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-300"
                >Volume Avg (30-day)
              </span>
              <span class="font-semibold"
                >{volData?.avgDaily?.toLocaleString("en-US")}</span
              >
            </div>

            <div class="flex flex-col">
              <span class="text-gray-500 dark:text-gray-300"
                >Today vs Volume Avg (30-day)
              </span>
              <span class="font-semibold"
                >{volData?.todayVsAvg ? volData?.todayVsAvg + "%" : "n/a"}</span
              >
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
                >{ticker}</strong
              >
              options grouped by their expiration dates.
            </p>

            <div
              class="flex justify-start items-center m-auto overflow-x-auto mt-5"
            >
              <table
                class="table table-sm table-compact no-scrollbar rounded-none sm:rounded w-full border border-gray-300 dark:border-gray-800 m-auto mt-3"
              >
                <thead class="bg-default text-white">
                  <tr class="">
                    <td class=" font-semibold text-sm text-start">Expiration</td
                    >
                    <td class=" font-semibold text-sm text-end">Call Vol</td>
                    <td class=" font-semibold text-sm text-end">Put Vol</td>
                    <td class=" font-semibold text-sm text-end">P/C Vol</td>
                    <td class=" font-semibold text-sm text-end">Call OI</td>
                    <td class=" font-semibold text-sm text-end">Put OI</td>

                    <td class=" font-semibold text-sm text-end">P/C OI</td>
                    <td class=" font-semibold text-sm text-end"
                      >Implied Volatility</td
                    >
                    <td class=" font-semibold text-sm text-end">Max Pain</td>
                  </tr>
                </thead>
                <tbody>
                  {#each optionList as item}
                    <tr
                      class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
                    >
                      <td
                        class="text-sm sm:text-[1rem] text-start whitespace-nowrap"
                      >
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
