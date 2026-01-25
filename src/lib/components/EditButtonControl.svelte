<script lang="ts">
  import { buttonModeNames, fromMidiNote } from "$lib/buttons";
  import { labelForButtonControl } from "$lib/configuration";

  import type { ButtonControl, Device } from "$lib/types";

  interface Props {
    index: number;
    editControl: ButtonControl;
    device: Device;
  }

  let { index, device, editControl = $bindable() }: Props = $props();

  const possibleChannels = Array.from({ length: 16 }, (_, i) => i + 1);
  const possibleCCs = Array.from(Array(128).keys());
</script>

<dl class="config-column">
  <dt class="index">{labelForButtonControl(device, index)}</dt>
  <dt>Channel</dt>
  <dd>
    <select bind:value={editControl.channel}>
      {#each possibleChannels as channel}
        <option value={channel}>{channel}</option>
      {/each}
    </select>
  </dd>

  <dt>Mode</dt>
  <dd>
    <select bind:value={editControl.mode}>
      {#each buttonModeNames as mode, index}
        <option value={index}>{mode}</option>
      {/each}
    </select>
  </dd>

  {#if editControl.mode == 0}
    <dt>Note number</dt>
    <dd>
      <select bind:value={editControl.paramA}>
        {#each possibleCCs as CC}
          <option value={CC}>{CC}</option>
        {/each}
      </select>
      ({fromMidiNote(editControl.paramA)})
    </dd>

    <dt>Velocity</dt>
    <dd>
      <select bind:value={editControl.paramB}>
        {#each possibleCCs as CC}
          <option value={CC}>{CC}</option>
        {/each}
      </select>
    </dd>
  {:else}
    <dt>Controller</dt>
    <dd>
      <select bind:value={editControl.paramA}>
        {#each possibleCCs as CC}
          <option value={CC}>{CC}</option>
        {/each}
      </select>
    </dd>

    <dt>On value</dt>
    <dd>
      <select bind:value={editControl.paramB}>
        {#each possibleCCs as CC}
          <option value={CC}>{CC}</option>
        {/each}
      </select>
    </dd>
  {/if}
</dl>

<style>
  dl {
    flex: 1;
    text-align: center;
  }
  dt {
    font-weight: bold;
    border-top: 1px solid #aaa;
    padding-top: 0.5rem;
    margin-right: 5px;
  }

  dt.index {
    background: #666;
    color: #f0f0f0;
    padding: 0.5rem 0;
  }

  dd {
    padding: 0 0 0.5rem 0;
    border-bottom: 1px solid #aaa;
    margin: 0;
    margin-right: 5px;
  }
</style>
