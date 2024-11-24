<script lang="ts">
  import { getContext, type Snippet } from "svelte";
  import { TABS } from "./Tabs.svelte";
  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();

  const tab = {};
  const { registerTab, selectTab, selectedTab } = getContext(TABS);

  registerTab(tab);
</script>

<button class:selected={$selectedTab === tab} onclick={() => selectTab(tab)}>
  {@render children?.()}
</button>

<style>
  button {
    background: none;
    border: none;
    border-bottom: 1px solid #888;
    border-radius: 0;
    margin: 0;
    color: #aaa;
    padding-left: 6px;
    padding-right: 6px;
  }

  .selected {
    /* border-bottom: 2px solid teal; */
    border-top: 1px solid #888;
    border-right: 1px solid #888;
    border-left: 1px solid #888;
    border-bottom: 1px solid #f0f0f0;
    border-radius: 2px;
    color: #333;
    padding-left: 5px;
    padding-right: 5px;
  }

  button:hover {
    cursor: pointer;
    border-top: 1px solid #888;
    border-right: 1px solid #888;
    border-left: 1px solid #888;
  }
</style>
