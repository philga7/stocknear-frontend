<script lang="ts">
  export let title;
  export let content;
  export let id;
</script>

<div class="relative">
  <label
    for={id}
    class="absolute -bottom-1 left-0 cursor-pointer p-1 text-gray-800 sm:hover:text-white"
  >
    <svg
      class="h-[10.5px] w-[10.5px]"
      viewBox="0 0 4 16"
      fill="white"
      style="max-width:20px"
    >
      <path
        d="M0 6h4v10h-4v-10zm2-6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"
      ></path>
    </svg>
  </label>
</div>

<!-- Desktop modal using dialog component -->
<input type="checkbox" {id} class="modal-toggle" />

<dialog {id} class="modal p-3 sm:p-0">
  <label for={id} class="cursor-pointer modal-backdrop bg-[#000]/30"></label>

  <!-- Desktop modal content -->
  <div
    class="modal-box rounded-md border border-gray-600 w-full bg-secondary flex flex-col items-center"
  >
    <div class="mx-auto h-1.5 w-20 shrink-0 rounded-full" />
    <div class="text-white mb-5 text-center">
      <h3 class="font-bold text-xl sm:text-2xl mb-5">{title}</h3>
      <span class="text-white text-[1rem] font-normal">{@html content}</span>
    </div>

    <div class="border-t border-gray-600 mt-2 w-full">
      <label
        for={id}
        class="mt-4 font-semibold text-white text-xl m-auto flex justify-center cursor-pointer"
      >
        Close
      </label>
    </div>
  </div>
</dialog>
