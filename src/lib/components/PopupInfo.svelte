<script lang="ts">
  import { getCache, setCache } from "$lib/store";

  import InfoModal from "$lib/components/InfoModal.svelte";
  export let parameter = "";
  export let label;
  export let value;

  let hoverTimeout;
  let leaveTimeout;
  let content = "";
  let show = false;

  async function getInfoText() {
    const cachedData = getCache(parameter, "getInfoText");
    if (cachedData) {
      content = cachedData;
    } else {
      const postData = { parameter: parameter };
      const response = await fetch("/api/info-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      content = (await response.json())?.text ?? "n/a";
      setCache(parameter, content, "getInfoText");
    }
  }

  async function handleMouseEnter() {
    await getInfoText();
    clearTimeout(leaveTimeout); // prevent premature hiding
    hoverTimeout = setTimeout(() => {
      show = true;
    }, 250); // smaller delay for showing, adjust if needed
  }

  function handleMouseLeave() {
    clearTimeout(hoverTimeout);
    leaveTimeout = setTimeout(() => {
      show = false;
    }, 200); // ensures popup stays for 500ms after leaving
  }
</script>

<tr
  class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd relative"
>
  <td
    class="px-[5px] py-1.5 xs:px-2.5 xs:py-2 relative flex flex-row items-center"
  >
    <label
      on:mouseenter={handleMouseEnter}
      on:mouseleave={handleMouseLeave}
      for={parameter}
      class="cursor-text"
    >
      {label}
    </label>
    <div class="sm:hidden">
      <InfoModal title={label} {content} id={parameter} />
    </div>

    {#if show}
      <div
        class="hidden sm:block absolute z-50 w-[400px] cursor-default rounded-md border border-gray-200 bg-white shadow-lg after:absolute after:left-[var(--arrow-position)] after:top-full after:-ml-[8px] after:border-[8px] after:border-solid after:border-transparent after:border-t-white after:content-[''] dark:border-dark-600 dark:bg-dark-700 dark:text-dark-100 dark:after:border-t-dark-700"
        style="
            bottom: calc(100% + 8px);  /* pushes it further above */
            left: 20%;
            transform: translateX(-50%);
            --arrow-position: 50%;
          "
      >
        <div class="relative p-3">
          <div class="whitespace-normal">
            <h4 class="mb-2 text-lg font-semibold text-default">{label}</h4>
            <p
              class="wrap border-t border-sharp pt-2 text-sm font-normal text-default md:text-smaller"
            >
              {content}
            </p>
          </div>
          <!--
            <button class="absolute right-1 top-1 hidden md:block">
              <svg
                class="h-5 w-5 text-gray-400 hover:text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style="max-width: 40px"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            -->
        </div>
      </div>
    {/if}
  </td>

  <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2">{value}</td>
</tr>
