/**
 * Instructions:
 * 
 * - Open https://www.chromestatus.com/metrics/css/popularity
 * - Run this snippet in its console
 * - Data in JSON will be in your clipboard
 * - Paste that into `attributesRanking.json`
 */
const list = [];
document
	.querySelector('chromedash-metrics')
	.shadowRoot.querySelectorAll('ol > li:not(.header)')
	.forEach(e => {
		list.push(e.getAttribute('id'));
	});
copy(JSON.stringify(list, null, 2));
