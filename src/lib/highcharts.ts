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
  let chart = null;

  const createChart = () => {
    chart = Highcharts.chart(node, {
      ...config,
      accessibility: {
        enabled: false,
      },
      chart: {
        ...(config.chart || {}),
        events: {
          ...(config.chart?.events || {}),
          load: function () {
            const chart = this;
            const marginX = 10;
            const marginY = 5;

            if (chart.watermark) {
              chart.watermark.destroy();
            }

            const x = chart.chartWidth - marginX;
            const y = chart.chartHeight - marginY;

            chart.watermark = chart.renderer
              .text('stocknear.com', x, y)
              .attr({ align: 'right' })
              .css({
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)',
                fontWeight: 'medium',
                pointerEvents: 'none'
              })
              .add();

            Highcharts.addEvent(chart, 'redraw', function () {
              chart.watermark.attr({ x: chart.chartWidth - marginX, y: chart.chartHeight - marginY });
            });
          }
        }
      }
    });
  };

  createChart();

  // Resize observer with optimized logic
  const resizeObserver = new ResizeObserver(() => {
    if (chart) {
      const newWidth = node.clientWidth;
      const newHeight = 360; // Let height be auto-adjusted

      // **Dynamically update size without recreating the chart**
      chart?.setSize(newWidth, newHeight, false);
    }
  });
  resizeObserver.observe(node);

  return {
    update(newConfig) {
      chart.update(newConfig, redraw, oneToOne);
    },
    destroy() {
      resizeObserver?.disconnect();
      if (chart) chart?.destroy();
    }
  };
};
