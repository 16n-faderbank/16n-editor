<script lang="ts">
  import { deviceForId } from "$lib/configuration";
  import { configuration } from "$lib/state/configuration.svelte";

  let device = $derived(
    configuration.current ? deviceForId(configuration.current.deviceId) : null,
  );

  let deviceBanks = $derived(
    device?.capabilities.banks && device.capabilities.banks > 0
      ? Array.from({ length: device.capabilities.banks }, (_, i) => i)
      : [],
  );

  const changeBank = (bankNo: number) => {
    configuration.currentBank = bankNo;
    if (midiState.selectedOutput) {
      console.log(`Changing bank to ${bankNo}`);
      sendProgChange(bankNo, midiState.selectedOutput);
    }
  };
</script>

{#if deviceBanks.length > 0}
  <div id="bank-selector">
    <h3>Bank:</h3>
    {#each deviceBanks as bank, i}
      <button
        class:selected={i == configuration.currentBank}
        onclick={() => (configuration.currentBank = bank)}
      >
        {bank + 1}
      </button>
    {/each}
  </div>
{/if}

<style>
  #bank-selector {
    display: inline-block;
    margin-right: 1em;

    h3 {
      display: inline-block;
      font-size: 1rem;
    }

    > button {
      display: inline-block;
      border: 1px solid #222;
      border-radius: 50%;
      width: 16px;
      height: 16px;
      text-align: center;
      font-size: 0.8rem;
      margin: 0 0.1rem;
      padding: 0;
      &:hover {
        cursor: pointer;
      }

      &.selected {
        color: white;
        background: #222;
      }
    }
  }
</style>
