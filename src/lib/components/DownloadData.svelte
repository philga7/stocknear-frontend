<script lang="ts">
  import { goto } from "$app/navigation";
  import { Button } from "$lib/components/shadcn/button/index.js";

  export let data;
  export let rawData;
  export let title;

  const exportData = (format = "csv") => {
    if (["Pro", "Plus"].includes(data?.user?.tier)) {
      const csvRows = [];

      if (rawData.length > 0) {
        // Sanitize "name" field by removing commas
        rawData.forEach((row) => {
          if (row["name"]) {
            row["name"] = row["name"].replace(/,/g, "");
          }
        });

        let headers = Object.keys(rawData[0]);

        if (headers.includes("rank")) {
          headers = ["rank", ...headers.filter((h) => h !== "rank")];
        }

        csvRows.push(headers.join(","));

        for (const row of rawData) {
          const csvRow = headers
            .map((header) => {
              let value = row[header] ?? "";
              // If value contains comma, quote, or newline, wrap in quotes & escape quotes
              if (typeof value === "string" && /[",\n]/.test(value)) {
                value = `"${value.replace(/"/g, '""')}"`;
              }
              return value;
            })
            .join(",");
          csvRows.push(csvRow);
        }
      }

      const csv = csvRows.join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("hidden", "");
      a.setAttribute("href", url);
      a.setAttribute("download", `${title}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      goto("/pricing");
    }
  };
</script>

<Button
  on:click={() => exportData("csv")}
  class="transition-all w-full bg-default text-white shadow-xs dark:border-gray-600 border sm:hover:bg-black dark:sm:hover:bg-primary ease-out flex flex-row justify-between items-center px-3 py-2 rounded truncate"
>
  <span class="truncate">Download</span>
  <svg
    class="{['Pro', 'Plus']?.includes(data?.user?.tier)
      ? 'hidden'
      : ''} ml-1 mt-0.5 w-3.5 h-3.5"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    ><path
      fill="currentColor"
      d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
    /></svg
  >
</Button>
