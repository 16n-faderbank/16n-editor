<script lang="ts">
  import { type Snippet } from "svelte";

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<div class="tab-list">
  {#if children}
    {@render children()}
  {/if}
</div>

<style>
  .tab-list {
    border-bottom: 1px solid #888;
    margin-bottom: 1rem;
    height: 32px;
  }
</style>
