<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
  import type { Snippet } from "svelte";

  interface Props {
    icon?: string;
    disabled?: boolean;
    onclick: () => void;
    children: Snippet;
  }

  let { children, icon = "", disabled = false, onclick }: Props = $props();
</script>

<div class="button-wrapper">
  <button {disabled} {onclick}>
    {#if icon && icon.trim() !== ""}
      <Icon i={icon} />
    {/if}
    {@render children()}
  </button>
</div>

<style>
  div {
    margin: 0;
    display: inline-block;
  }
  button {
    text-align: left;
    border-radius: 5px;
    display: inline-block;
    cursor: pointer;
  }

  button:disabled {
    cursor: not-allowed;
  }
</style>
