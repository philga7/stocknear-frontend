<script lang="ts">
  export let text;
</script>

<div
  class="sm:mt-5 bg-inherit sm:mt-0 border-l-3 border-l-white border-r-0 border-t-0 border-b-0 border p-0 sm:p-4 text-white flex flex-row items-center"
>
  <svg
    class="h-6 w-6 hidden sm:block"
    viewBox="0 0 20 20"
    fill="currentColor"
    style="max-width:40px"
    aria-hidden="true"
    ><path
      fill-rule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
      clip-rule="evenodd"
    ></path></svg
  >
  <div class="ml-1 sm:ml-3 w-full">
    <div class="flex w-full flex-row justify-between">
      <div class="p-3 sm:p-0 text-sm sm:text-[1rem]">
        {@html text}
      </div>
    </div>
  </div>
</div>
