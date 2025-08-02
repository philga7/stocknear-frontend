<script lang="ts">
    import { page } from "$app/stores";
    import Table from "$lib/components/Table/Table.svelte";
    import { displayTitle, displayDate } from "$lib/store";

    export let data;

    let rawData = [];
    // Define mapping of slug to internal key
    const timePeriodMap = {
        week: "1W",
        month: "1M",
        year: "1Y",
        "3Y": "3Y",
        "5Y": "5Y",
    };

    // Table display options
    let excludedRules = new Set([
        "volume",
        "price",
        "changesPercentage",
        "eps",
        "marketCap",
    ]);

    let defaultList = [
        { name: "Market Cap", rule: "marketCap" },
        { name: "Price", rule: "price" },
        { name: "% Change", rule: "changesPercentage" },
        { name: "Volume", rule: "volume" },
    ];
    $: {
        if ($page?.url?.pathname) {
            // Extract last part of the URL path
            const path = $page?.url?.pathname;
            const lastSegment = path.split("/").filter(Boolean).pop(); // e.g., "1M"
            // Resolve the time key
            const timeKey = timePeriodMap[lastSegment]; // fallback to "week"
            rawData = data?.getMarketMover[timeKey];
        }
    }
</script>

{#key $page?.url?.pathname}
    <Table
        {data}
        {rawData}
        {excludedRules}
        {defaultList}
        title={$displayTitle}
        date={$displayDate}
    />
{/key}
