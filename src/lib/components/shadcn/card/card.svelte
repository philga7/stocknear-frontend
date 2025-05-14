<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { cn } from "$lib/utils";

  type $$Props = HTMLAttributes<HTMLDivElement>;

  let className: $$Props["class"] = undefined;
  export { className as class };
</script>

<div
  class={cn(
    "rounded-md border border-gray-400 dark:border-gray-800 bg-white dark:bg-default text-muted dark:text-white shadow",
    className,
  )}
  {...$$restProps}
>
  <slot />
</div>
