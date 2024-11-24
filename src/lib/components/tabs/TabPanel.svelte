<script lang="ts">
  import { getContext, type Snippet } from "svelte";
  import { TABS } from "./Tabs.svelte";
  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();

  const panel = {};
  const { registerPanel, selectedPanel } = getContext(TABS);

  registerPanel(panel);
</script>

{#if children && $selectedPanel === panel}
  {@render children()}
{/if}
