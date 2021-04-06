
<script>
  import { gte as semverGte } from 'semver';

  import {
    configuration,
    editConfiguration,
  } from "../stores.js";

  import CheckOption from "./CheckOption.svelte";

  function touchControl() {
    editConfiguration.update(old => $editConfiguration);
  }
</script>

<style>
  p.note {
    width: 600px;
    line-height: 1.2;
  }

  p.note.small {
    font-size: 85%;
  }
  label {
    font-weight: bold;
  }
</style>


{#if $configuration.device().capabilities.led}
<CheckOption bind:checked={$editConfiguration.ledOn}>
  LED permanently on when powered
</CheckOption>

<CheckOption bind:checked={$editConfiguration.ledFlash}>
  LED flash on MIDI activity
</CheckOption>
{/if}

<CheckOption bind:checked={$editConfiguration.controllerFlip}>
  Rotate controller 180º
</CheckOption>

{#if semverGte($configuration.firmwareVersion, "2.1.0")}
<CheckOption bind:checked={$editConfiguration.midiThru}>
  Soft MIDI thru (echo MIDI clock/note data sent to USB out of the minijack)
</CheckOption>
{/if}

<hr/>

<h3>Fader Minimum/Maximum calibration</h3>
<div>
  <label for="fadermin">Fader Minimum raw value</label>
  <input
    name="fadermin"
    type="number"
    bind:value={$editConfiguration.fadermin}
    on:blur={touchControl}
    min="0"
    max="{(1 << 13) - 1}" />
</div>
<div>
  <label for="fadermax">Fader Maximum raw value</label>
  <input
    name="fadermax"
    type="number"
    bind:value={$editConfiguration.fadermax}
    on:blur={touchControl}
    min="0"
    max="{(1 << 13) - 1}" />
</div>

<p class='note'>
  You shouldn't touch this unless you are having issues with your faders either reaching <code>127</code> before the end of their travel, or not at all.<br/><br/>
  "Raw" analog values are read from the faders between 0 and 8192. Bring the fader maximum down until all faders smoothly travel from 0 to 127 on the debug view (bearing in mind there is a small dead zone at either end of a fader).
</p>

{#if $configuration.device().capabilities.i2c}
<hr />
<h3>I2C Leader/Follower</h3>
<select bind:value={$editConfiguration.i2cMaster} on:change={touchControl}>
  <option value={false}>Follower</option>
  <option value={true}>Leader</option>
</select>

<p class='note'><strong>Follower</strong> mode is for use with Teletype.</p>
<p class='note'><strong>Leader</strong> mode is for use with Ansible, TXo, ER-301. 16n will not respond to Teletype when in leader mode.</p>
<p class='note'>This will not take effect until you restart (disconnect/reconnect) your 16n.</p>
<p class='note small'>("Leader" is sometimes also referred to as 'master' mode)</p>

{/if}
