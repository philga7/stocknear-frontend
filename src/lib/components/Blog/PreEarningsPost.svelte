<script lang="ts">
  import Overview from "$lib/components/Blog/Overview.svelte";

  const overviewList = [
    { label: "Market Cap", value: "$3.26T" },
    { label: "Industry", value: "Technology" },
    { label: "EPS (TTM)", value: "$6.49" },
    { label: "P/E (TTM)", value: "32.46" },
    { label: "Div & Yield", value: "$1.00 (0.46%)" },
    { label: "P/S (TTM)", value: "8.54" },
    { label: "P/B", value: "43.92" },
    { label: "Shares Outstanding", value: "15.33B" },
    { label: "Short % Float", value: "1.23%" },
    { label: "Short % Outstanding", value: "1.11%" },
    { label: "Forward P/E", value: "31.27" },
    { label: "Next Earnings", value: "May 11, 2025" },
  ];
</script>

<Overview dataList={overviewList} />
