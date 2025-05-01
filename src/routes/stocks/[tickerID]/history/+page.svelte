<script lang="ts">
  import { stockTicker, displayCompanyName } from "$lib/store";
  import History from "$lib/components/History.svelte";
  import SEO from "$lib/components/SEO.svelte";

  export let data;
</script>

<SEO
  title={`${$displayCompanyName} (${$stockTicker}) Stock Price History`}
  description={`Get a complete stock price history for ${$displayCompanyName} (${$stockTicker}), starting from its first trading day. Includes open, high, low, close and volume.`}
/>

<History {data} ticker={$stockTicker} />
