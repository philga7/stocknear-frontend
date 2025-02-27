<script lang="ts">
  import { stockTicker } from "$lib/store";
  import { page } from "$app/stores";

  let displaySubSection = "overview";

  function changeSubSection(state) {
    const subSectionMap = {
      employees: "/profile/employees",
    };

    if (state !== "overview" && subSectionMap[state]) {
      displaySubSection = state;
    } else {
      displaySubSection = state;
    }
  }

  $: {
    if ($page?.url?.pathname) {
      const parts = $page?.url?.pathname.split("/");
      const sectionMap = {
        employees: "employees",
      };

      const foundSection = parts?.find((part) =>
        Object?.values(sectionMap)?.includes(part),
      );

      displaySubSection =
        Object?.keys(sectionMap)?.find(
          (key) => sectionMap[key] === foundSection,
        ) || "overview";
    }
  }
</script>

<section class="w-auto bg-default overflow-hidden text-black h-full">
  <div class="m-auto h-full overflow-hidden">
    <main class="w-full">
      <div class="m-auto">
        <nav
          class="sm:ml-4 pt-1 overflow-x-auto text-sm sm:text-[1rem] whitespace-nowrap"
        >
          <ul class="flex flex-row items-center w-full text-white">
            <a
              href={`/stocks/${$stockTicker}/profile`}
              on:click={() => changeSubSection("overview")}
              class="p-2 px-5 cursor-pointer {displaySubSection === 'overview'
                ? 'text-white bg-primary sm:hover:bg-opacity-[0.95]'
                : 'text-gray-400 sm:hover:text-white sm:hover:bg-primary sm:hover:bg-opacity-[0.95]'}"
            >
              Overview
            </a>

            <a
              href={`/stocks/${$stockTicker}/profile/employees`}
              on:click={() => changeSubSection("employees")}
              class="p-2 px-5 cursor-pointer {displaySubSection === 'employees'
                ? 'text-white bg-primary sm:hover:bg-opacity-[0.95]'
                : 'text-gray-400 sm:hover:text-white sm:hover:bg-primary sm:hover:bg-opacity-[0.95]'}"
            >
              Employees
            </a>
          </ul>
        </nav>
      </div>
    </main>

    <slot />
  </div>
</section>

<style>
  .scrollbar {
    display: grid;
    grid-gap: 18px;
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    grid-auto-flow: column;
    overflow-x: auto;
    scrollbar-width: thin; /* Hide the default scrollbar in Firefox */
    scrollbar-color: transparent transparent; /* Hide the default scrollbar in Firefox */
  }

  /* Custom scrollbar for Webkit (Chrome, Safari) */
  .scrollbar::-webkit-scrollbar {
    width: 0; /* Hide the width of the scrollbar */
    height: 0; /* Hide the height of the scrollbar */
  }

  .scrollbar::-webkit-scrollbar-thumb {
    background: transparent; /* Make the thumb transparent */
  }
</style>
