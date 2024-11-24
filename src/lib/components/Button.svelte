<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";

  interface Props {
    label: string;
    icon?: string;
    disabled?: boolean;
    click: () => void;
  }

  let {
    label,
    icon = "",
    disabled = false,
    click
  }: Props = $props();
</script>

<div class="button-wrapper">
  <button {disabled} onclick={click}>
    {#if icon && icon.trim() !== ""}
      <Icon i={icon} />
    {/if}
    {label}
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
