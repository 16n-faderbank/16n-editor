<script lang="ts">
  import { labelForButtonControl } from "$lib/configuration";
  import { buttonModeNames, fromMidiNote } from "$lib/buttons";
  import type { ButtonControl, Device } from "$lib/types";

  interface Props {
    control: ButtonControl;
    index: number;
    device: Device;
    disableValue?: boolean;
  }

  let { control, index, device, disableValue }: Props = $props();

  // let barHeight = $derived(
  // control.highResolution ? (control.val || 0) >> 7 : control.val,
  // );

  // let overUnderThreshold = $derived(control.highResolution ? 27 << 7 : 27);

  let modeName = $derived(buttonModeNames[control.mode]);
</script>

<div class="config-column">
  <dl>
    <dt class="index">{labelForButtonControl(device, index)}</dt>
    <dt>Channel</dt>
    <dd>{control.channel}</dd>
    <dt>Mode</dt>
    <dd>{modeName}</dd>

    {#if control.mode == 1}
      <dt>CC</dt>
      <dd>{control.paramA}</dd>
      <dt>On Value</dt>
      <dd>{control.paramB}</dd>
    {:else}
      <dt>Note Number</dt>
      <dd>{control.paramA} ({fromMidiNote(control.paramA)})</dd>
      <dt>Velocity</dt>
      <dd>{control.paramB}</dd>
    {/if}
  </dl>
  {#if !disableValue}
    {#if control.mode == 0}
      <div class="button-readout" class:pressed={control.pressed}></div>
    {/if}
  {/if}
</div>

<style>
  .button-readout {
    height: 30px;
    border: 1px solid black;
    margin: 0 0.5em;
    &.pressed {
      background: black;
    }
  }

  .config-column {
    flex: 1;
  }
  dl {
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
