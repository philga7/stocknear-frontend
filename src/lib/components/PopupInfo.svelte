<script lang="ts">
  import { getCache, setCache } from "$lib/store";
  import { onMount } from "svelte";
  import tippy from "tippy.js";
  import "tippy.js/dist/tippy.css";

  export let parameter = "";
  export let label;
  export let value;

  let labelEl: HTMLLabelElement;

  let content = { text: "Loading…" };

  async function getInfoText() {
    const cachedData = getCache(parameter, "getInfoText");
    if (cachedData) {
      content = cachedData;
      return;
    }

    const postData = { parameter };
    const response = await fetch("/api/info-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData),
    });

    content = (await response.json()) ?? { text: "n/a" };
    setCache(parameter, content, "getInfoText");
  }

  onMount(() => {
    if (!labelEl) return;

    tippy(labelEl, {
      trigger: "mouseenter focus",
      placement: "bottom",
      theme: "light-border",
      allowHTML: true,
      interactive: true,
      delay: [200, 100],
      onShow: async (instance) => {
        instance.setContent("Loading…");
        await getInfoText();
        instance.setContent(`
          <div class=" text-white  w-full mb-3">
            <h4 class="font-bold mb-1 text-[1rem] w-full">${label}</h4>
            <p>${content?.text}</p>
            ${
              content?.equation
                ? `<div class="mt-4 pt-2 text-sm border-t border-gray-600 w-fit">${content?.equation}</div>`
                : ""
            }
          </div>
        `);
      },
    });
  });
</script>

<tr
  class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd relative"
>
  <td
    class="px-[5px] py-1.5 xs:px-2.5 xs:py-2 relative flex flex-row items-center"
  >
    <label bind:this={labelEl} for="" class="cursor-text">
      {label}
    </label>
  </td>

  <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2">
    {value}
  </td>
</tr>
