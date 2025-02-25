import Highcharts from 'highcharts';
import { browser } from '$app/environment';

if (browser) {
  Highcharts.setOptions({
    lang: {
      numericSymbols: ['K', 'M', 'B', 'T', 'P', 'E']
    }
  });
}

export default (node, config) => {
  const redraw = true;
  const oneToOne = true;

  // Merge our watermark load event with any provided chart events
  const mergedChartOptions = {
    ...(config.chart || {}),
    events: {
      ...(config.chart && config.chart.events ? config.chart.events : {}),
     load: function () {
  const chart = this;
  const marginX = 10; // Adjust horizontal margin
  const marginY = 5; // Adjust vertical margin

  // Destroy existing watermark if it exists
  if (chart.watermark) {
    chart.watermark.destroy();
  }

  // Get the actual width and height of the plotting area
  const x = chart.chartWidth - marginX;
  const y = chart.chartHeight - marginY;

  // Add watermark
  chart.watermark = chart.renderer
    .text('stocknear.com', x, y)
    .attr({
      align: 'right'
    })
    .css({
      fontSize: '12px',
      color: 'rgba(255, 255, 255, 0.6)',
      fontWeight: 'medium',
      pointerEvents: 'none'
    })
    .add();

  // Adjust on redraw
  Highcharts.addEvent(chart, 'redraw', function () {
    const newX = chart.chartWidth - marginX;
    const newY = chart.chartHeight - marginY;
    chart.watermark.attr({ x: newX, y: newY });
  });
}

    }
  };

  const chart = Highcharts.chart(node, {
    ...config,
    chart: mergedChartOptions,
  });

  return {
    update(newConfig) {
      chart.update(newConfig, redraw, oneToOne);
    },
    destroy() {
      chart.destroy();
    },
    /*
    exportChart(options = {}, chartOptions = {}) {
      chart.exportChart(options, chartOptions);
    },
    */
  };
};
