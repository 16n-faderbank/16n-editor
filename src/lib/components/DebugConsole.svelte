<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";

  const toggleConsole = () => {
    debugConsole.toggleAttribute("hidden");
  };

  let debugConsole: HTMLElement;
</script>

<div id="debugconsole">
  <button onclick={toggleConsole}>
    <Icon i="terminal" />
    Toggle debug console
  </button>
  <div hidden id="console" bind:this={debugConsole}>
    <textarea cols="40" rows="8" id="current_config"></textarea>
  </div>
</div>

<style>
  #debugconsole {
    margin-top: 4rem;
    opacity: 0.5;
  }

  #debugconsole textarea {
    font-family: monospace;
    color: #eee;
    background: #111;
    border: 1px solid #888;
    width: 50%;
  }
</style>
