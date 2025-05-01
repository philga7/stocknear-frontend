<script lang="ts">
  import { etfTicker, displayCompanyName } from "$lib/store";
  import History from "$lib/components/History.svelte";
  import SEO from "$lib/components/SEO.svelte";

  export let data;
</script>

<SEO
  title={`${$displayCompanyName} (${$etfTicker}) Stock Price History`}
  description={`Get a complete stock price history for ${$displayCompanyName} (${$etfTicker}), starting from its first trading day. Includes open, high, low, close and volume.`}
/>

<History {data} ticker={$etfTicker} />
