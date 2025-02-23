import Highcharts from 'highcharts';
//import { browser } from '$app/environment';

/*
if (browser) {
  import('highcharts/modules/exporting').then(module => {
    module.default(Highcharts);
  });

  import('highcharts/modules/export-data').then(module => {
    module.default(Highcharts);
  });
}
  */

export default (node, config) => {
  const redraw = true;
  const oneToOne = true;
  const chart = Highcharts.chart(node, {
    ...config,
	/*
    exporting: {
		filename: 'event-id-metadata-graph',
		fetchOptions:{
		credentials: "omit", // omit, same-origin, include
		mode: "cors" // cors, no-cors, same-origin
	},
      buttons: {
        customButton: {
          menuItems: [
            'viewFullscreen',
            'printChart',
            'separator',
            'downloadPNG',
            'downloadJPEG',
            'downloadPDF',
            'downloadSVG',
          ],
          className: 'bg-gray-500',
          text: 'Custom button',
        },
      },
    },
	*/
  });

  return {
    update(newConfig) {
      chart.update(newConfig, redraw, oneToOne);
    },
    destroy() {
      chart.destroy();
    },
    exportChart(options = {}, chartOptions = {}) {
      chart.exportChart(options, chartOptions);
    },
  };
};
