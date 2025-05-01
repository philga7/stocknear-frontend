<script lang="ts">
  import { displayCompanyName, etfTicker } from "$lib/store";
  import SEO from "$lib/components/SEO.svelte";
  import Dividends from "$lib/components/Dividends.svelte";

  export let data;
</script>

<SEO
  title={`${$displayCompanyName} (${$etfTicker}) Dividend History, Dates & Yield`}
  description={`Get the latest dividend data for ${$displayCompanyName} (${$etfTicker}) stock price quote with breaking news, financials, statistics, charts and more.`}
/>

<Dividends {data} ticker={$etfTicker} />
