<script lang="ts">
  import { editConfiguration } from "$lib/stores";
  import { deviceForId, deviceHasCapability } from "$lib/configuration";

  import type { Control } from "$lib/types";

  interface Props {
    index: number;
    editControl: Control;
  }

  let { index, editControl = $bindable() }: Props = $props();

  let device = $derived(
    $editConfiguration ? deviceForId($editConfiguration.deviceId) : null,
  );

  let maxCC = $derived(editControl.highResolution ? 127 - 32 : 127);

  const possibleChannels = Array.from({ length: 16 }, (_, i) => i + 1);

  const touchChannel = () => {
    // trigger reactivity
    editConfiguration.set($editConfiguration);
  };

  const touchCC = (e: Event) => {
    const targ = e.target as HTMLInputElement;

    if (parseInt(targ.value) < 0) {
      editControl.cc = 0;
    }
    if (parseInt(targ.value) > maxCC) {
      editControl.cc = maxCC;
    }

    // trigger reactivity
    editConfiguration.set($editConfiguration);
  };

  const touchHires = () => {
    if (editControl.cc > maxCC) {
      editControl.cc = maxCC;
    }
  };

  const toggleHRMode = () => {
    editControl.highResolution = !editControl.highResolution;
  };
</script>

<dl class="config-column">
  <dt class="index">{index + 1}</dt>
  <dt class="no-top-border">Channel</dt>
  <dd>
    <select bind:value={editControl.channel} onchange={touchChannel}>
      {#each possibleChannels as channel}
        <option value={channel}>{channel}</option>
      {/each}
    </select>
  </dd>
  <dt>CC</dt>
  <dd>
    <input
      type="number"
      bind:value={editControl.cc}
      onchange={touchCC}
      onblur={touchCC}
      min="0"
      max={maxCC}
    />
  </dd>
  {#if $editConfiguration && deviceHasCapability($editConfiguration, "highResolution")}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <dt class="hr-title" onclick={toggleHRMode}>High Resolution?</dt>
    <dd>
      <input
        type="checkbox"
        bind:checked={editControl.highResolution}
        onchange={touchHires}
        onblur={touchHires}
      />
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
    margin-bottom: 5px;
  }

  dt.no-top-border {
    border-top: none;
  }

  dt.index {
    background: #666;
    color: #f0f0f0;
    padding: 0.5rem 0;
  }

  dt.hr-title {
    cursor: pointer;
  }

  dd {
    padding: 0 0 0.5rem 0;
    margin: 0;
    margin-right: 5px;
  }

  dl dd:last-child {
    border-bottom: 1px solid #aaa;
  }
  dd input:invalid {
    background: #f99;
  }

  select,
  input[type="number"] {
    width: 6ch;
  }
</style>
