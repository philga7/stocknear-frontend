<script lang="ts">
  import { displayCompanyName, stockTicker } from "$lib/store";
  import SEO from "$lib/components/SEO.svelte";
  import Dividends from "$lib/components/Dividends.svelte";

  export let data;
</script>

<SEO
  title={`${$displayCompanyName} (${$stockTicker}) Dividend History, Dates & Yield`}
  description={`Get the latest dividend data for ${$displayCompanyName} (${$stockTicker}) stock price quote with breaking news, financials, statistics, charts and more.`}
/>

<Dividends {data} ticker={$stockTicker} />
