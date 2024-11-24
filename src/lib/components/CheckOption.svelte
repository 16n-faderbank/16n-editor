<script lang="ts">
  import type { Snippet } from "svelte";
  interface Props {
    checked: boolean;
    children?: Snippet;
  }

  let { checked = $bindable(), children }: Props = $props();
</script>

<p>
  <label>
    <input type="checkbox" bind:checked />
    {#if children}
      {@render children()}
    {/if}
  </label>
</p>
