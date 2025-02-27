<script lang="ts">
  import highcharts from "$lib/highcharts.ts";
  import { abbreviateNumber } from "$lib/utils";

  export let data;
  export let displayStatement;
  export let filterRule = "annual";
  export let tableList = [];
  export let statementConfig;

  let config = null;

  function plotData() {
    let labelName = "-";
    let xList = [];
    let valueList = [];
    tableList = []; // Assuming tableList is a global variable

    const index = statementConfig?.findIndex(
      (item) => item?.propertyName === displayStatement,
    );

    // Loop through the income array in reverse order
    for (let i = data?.length - 1; i >= 0; i--) {
      const statement = data[i];
      const year = statement?.calendarYear?.slice(-2);
      const quarter = statement?.period;

      // Determine label based on filterRule
      if (filterRule === "annual") {
        xList.push("FY" + year);
      } else {
        xList.push("FY" + year + " " + quarter);
      }

      // Calculate the value, converting to a number
      const rawValue = Number(statement[statementConfig[index]?.propertyName]);
      const value = parseFloat(rawValue.toFixed(2));
      valueList.push(value);

      // Populate tableList
      tableList.push({
        date: statement?.date,
        value: value,
      });
    }

    // Sort tableList by date (newest first)
    tableList?.sort((a, b) => new Date(b?.date) - new Date(a?.date));

    labelName = statementConfig[index]?.label;

    const options = {
      chart: {
        type: "column",
        backgroundColor: "#09090B",
        plotBackgroundColor: "#09090B",
        height: 360, // Set the maximum height for the chart
        animation: false,
      },
      credits: { enabled: false },
      legend: { enabled: false },
      plotOptions: {
        series: {
          color: "white",
          animation: false,
          dataLabels: {
            enabled: false,
            color: "white",
            style: {
              fontSize: "13px",
              fontWeight: "bold",
            },
            formatter: function () {
              return abbreviateNumber(this?.y);
            },
          },
        },
      },
      title: {
        text: `<h3 class="mt-3 mb-1">${labelName}</h3>`,
        useHTML: true,
        style: { color: "white" },
      },
      xAxis: {
        categories: xList,
        labels: {
          style: { color: "#fff" },
        },
        lineColor: "#fff",
        tickColor: "#fff",
      },
      yAxis: {
        gridLineWidth: 1,
        gridLineColor: "#111827",
        labels: {
          style: { color: "white" },
          formatter: function () {
            return abbreviateNumber(this.value);
          },
        },
        title: { text: null },
        opposite: true,
      },
      tooltip: {
        shared: true,
        useHTML: true,
        backgroundColor: "rgba(0, 0, 0, 0.8)", // Semi-transparent black
        borderColor: "rgba(255, 255, 255, 0.2)", // Slightly visible white border
        borderWidth: 1,
        style: {
          color: "#fff",
          fontSize: "16px",
          padding: "10px",
        },
        borderRadius: 4,
        formatter: function () {
          // Format the x value to display time in hh:mm format
          let tooltipContent = `<span class="text-white m-auto text-black text-[1rem] font-[501]">${this?.x}</span><br>`;

          // Loop through each point in the shared tooltip
          this.points.forEach((point) => {
            tooltipContent += `<span class="text-white font-semibold text-sm">${point.series.name}:</span> 
          <span class="text-white font-normal text-sm" style="color:${point.color}">${abbreviateNumber(
            point.y,
          )}</span><br>`;
          });

          return tooltipContent;
        },
      },
      series: [
        {
          name: labelName,
          data: valueList,
          color: "#fff",
        },
      ],
    };

    return options;
  }

  $: {
    if (filterRule || displayStatement || data) {
      config = plotData() || null;
    }
  }
</script>

<div
  class="border border-gray-800 rounded w-full"
  use:highcharts={config}
></div>
