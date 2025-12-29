<script lang="ts">
  import { gte as semverGte } from "semver";

  import { configuration } from "$lib/state/configuration.svelte";

  import CheckOption from "$lib/components/CheckOption.svelte";
  import { deviceHasCapability, deviceForId } from "$lib/configuration";

  let device = $derived(
    configuration.current && deviceForId(configuration.current.deviceId),
  );
</script>

{#if configuration.current && configuration.editing && device}
  {#if deviceHasCapability(device, "led", configuration.current.firmwareVersion)}
    <CheckOption bind:checked={configuration.editing.ledOn}
      >LED permanently on when powered</CheckOption
    >

    <CheckOption bind:checked={configuration.editing.ledFlash}
      >LED flash on MIDI activity</CheckOption
    >
  {/if}

  <CheckOption bind:checked={configuration.editing.controllerFlip}
    >Rotate controller 180º</CheckOption
  >

  {#if semverGte(configuration.current.firmwareVersion, "2.1.0")}
    <CheckOption bind:checked={configuration.editing.midiThru}>
      Soft MIDI thru (echo MIDI clock/note data sent to USB out of the minijack)
    </CheckOption>
  {/if}

  {#if deviceHasCapability(device, "faderCalibration", configuration.current.firmwareVersion)}
    <hr />
    <h3>Fader Minimum/Maximum calibration</h3>
    <div>
      <label for="faderMin">Fader Minimum raw value</label>
      <input
        name="faderMin"
        type="number"
        bind:value={configuration.editing.faderMin}
        min="0"
        max={(1 << 13) - 1}
      />
    </div>
    <div>
      <label for="faderMax">Fader Maximum raw value</label>
      <input
        name="faderMax"
        type="number"
        bind:value={configuration.editing.faderMax}
        min="0"
        max={(1 << 13) - 1}
      />
    </div>

    <p class="note">
      You shouldn't touch this unless you are having issues with your faders
      either reaching <code>127</code>
      before the end of their travel, or not at all.<br /><br />
      "Raw" analog values are read from the faders between 0 and 8192. Bring the fader
      maximum down until all faders smoothly travel from 0 to 127 on the debug view
      (bearing in mind there is a small dead zone at either end of a fader).
    </p>
  {/if}

  {#if deviceHasCapability(device, "i2c", configuration.current.firmwareVersion)}
    <hr />
    <h3>I2C Leader/Follower</h3>
    <select bind:value={configuration.editing.i2cLeader}>
      <option value={false}>Follower</option>
      <option value={true}>Leader</option>
    </select>

    <p class="note"><strong>Follower</strong> mode is for use with Teletype.</p>
    <p class="note">
      <strong>Leader</strong> mode is for use with Ansible, TXo, ER-301. 16n will
      not respond to Teletype when in leader mode.
    </p>
    <p class="note">
      This will not take effect until you restart (disconnect/reconnect) your
      16n.
    </p>
    <p class="note small">
      ("Leader" is sometimes also referred to as 'master' mode)
    </p>
  {/if}
{/if}

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
