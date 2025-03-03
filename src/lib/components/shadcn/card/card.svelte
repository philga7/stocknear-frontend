<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { cn } from "$lib/utils";

  type $$Props = HTMLAttributes<HTMLDivElement>;

  let className: $$Props["class"] = undefined;
  export { className as class };
</script>

<div
  class={cn(
    "rounded-md border border-gray-800 bg-default text-white shadow-xs",
    className,
  )}
  {...$$restProps}
>
  <slot />
</div>
