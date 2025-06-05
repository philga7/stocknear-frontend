<script lang="ts">
  import { screenWidth, getCache, setCache } from "$lib/store";
  import InfoModal from "$lib/components/InfoModal.svelte";

  export let parameter = "";
  export let label;
  export let value;

  let hoverTimeout;
  let leaveTimeout;
  let content = { text: "n/a" };
  let show = false;

  let popupEl: HTMLDivElement;
  let labelEl: HTMLLabelElement;

  let popupX = 0;
  let popupY = 0;
  let isPositioned = false;

  async function getInfoText() {
    const cachedData = getCache(parameter, "getInfoText");
    if (cachedData) {
      content = cachedData;
    } else {
      const postData = { parameter };
      const response = await fetch("/api/info-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      content = (await response.json()) ?? { text: "n/a" };
      setCache(parameter, content, "getInfoText");
    }
  }

  async function handleMouseEnter() {
    await getInfoText();
    clearTimeout(leaveTimeout);
    hoverTimeout = setTimeout(() => {
      show = true;
      isPositioned = false;

      // Let the popup mount in the DOM before measuring
      setTimeout(() => {
        updatePopupPosition();
      }, 0);
    }, 250);
  }

  function handleMouseLeave() {
    clearTimeout(hoverTimeout);
    leaveTimeout = setTimeout(() => {
      show = false;
    }, 200);
  }

  function updatePopupPosition() {
    const labelRect = labelEl?.getBoundingClientRect();
    const popupRect = popupEl?.getBoundingClientRect();

    if (!labelRect || !popupRect) return;

    const spacing = 8;
    let top = labelRect.top - popupRect.height - spacing;
    let left = labelRect.left + labelRect.width / 2 - popupRect.width / 2;

    // Prevent left overflow
    if (left < 8) left = 8;

    // Prevent right overflow
    if (left + popupRect.width > window.innerWidth) {
      left = window.innerWidth - popupRect.width - 8;
    }

    // If above overflows, place below
    if (top < 0) {
      top = labelRect.bottom + spacing;
    }

    popupX = left;
    popupY = top;
    isPositioned = true;
  }
</script>

<tr
  class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd relative"
>
  <td
    on:click={() => {
      if ($screenWidth < 640) {
        getInfoText();
      }
    }}
    class="px-[5px] py-1.5 xs:px-2.5 xs:py-2 relative flex flex-row items-center"
  >
    <label
      bind:this={labelEl}
      on:mouseenter={handleMouseEnter}
      on:mouseleave={handleMouseLeave}
      for={$screenWidth < 640 ? parameter : ""}
      class="cursor-text"
    >
      {label}
    </label>

    <div class="sm:hidden">
      {#if content?.text}
        <InfoModal title={label} content={content?.text} id={parameter} />
      {/if}
    </div>

    {#if show}
      <div
        bind:this={popupEl}
        class="hidden sm:block fixed z-50 w-[400px] cursor-default rounded-md border border-gray-200 bg-white shadow-lg dark:border-dark-600 dark:bg-dark-700 dark:text-dark-100 popup-fade"
        style="
        opacity: {isPositioned ? 1 : 0};
        transform: translateY({isPositioned ? '0' : '10px'});
        top: {popupY}px;
        left: {popupX}px;
        pointer-events: {isPositioned ? 'auto' : 'none'};
      "
      >
        <div class="relative p-3">
          <!-- Close button -->
          <button
            class="absolute right-2 top-2 text-gray-500 cursor-pointer"
            on:click={() => (show = false)}
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 8.586L15.657 2.93a1 1 0 111.414 1.414L11.414 10l5.657 5.657a1 1 0 01-1.414 1.414L10 11.414l-5.657 5.657a1 1 0 01-1.414-1.414L8.586 10 2.93 4.343a1 1 0 111.414-1.414L10 8.586z"
                clip-rule="evenodd"
              />
            </svg>
          </button>

          <div class="whitespace-normal">
            <h4 class="mb-2 text-lg font-semibold text-default">{label}</h4>
            <p
              class="mb-2 wrap border-t border-sharp pt-2 text-sm font-normal text-default md:text-smaller"
            >
              {content?.text}
            </p>
            {#if content?.equation}
              <div
                class="mb-2 pt-1.5 border-t border-gray-300 text-sm text-muted"
              >
                {content?.equation}
              </div>
            {/if}
          </div>
        </div>
      </div>
    {/if}
  </td>

  <td class="px-[5px] py-1.5 text-right xs:px-2.5 xs:py-2">{value}</td>
</tr>

<style>
  .popup-fade {
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }
</style>
