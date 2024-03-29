<script lang="ts">
  /* global __BUILD_VERSION__ */

  import { browser } from "$app/environment";
  import { gte as semverGte } from "semver";
  import { onMount } from "svelte";
  import { WebMidi } from "webmidi";

  import { onMIDISuccess } from "$lib/midi/midi";
  import { sendFactoryResetRequest } from "$lib/midi/sysex";

  import {
    configuration,
    controllerMightNeedFactoryReset,
    editMode,
    selectedMidiOutput,
    webMidiEnabled,
  } from "$lib/stores";

  import Button from "$lib/components/Button.svelte";
  import DeviceDetails from "$lib/components/DeviceDetails.svelte";
  import Editing from "./Editing.svelte";
  import Viewing from "./Viewing.svelte";

  const buildVersion = __BUILD_VERSION__;

  const supportsWebMidi = browser ? !!navigator.requestMIDIAccess : true;

  onMount(() => {
    // Initialise all the MIDI things.
    if (supportsWebMidi) {
      WebMidi.enable({ sysex: true })
        .then(onMIDISuccess)
        .catch((err) => alert(err));
    }
  });

  const transmitFactoryReset = () => {
    if ($selectedMidiOutput) {
      sendFactoryResetRequest($selectedMidiOutput);
    }
  };
</script>

<main>
  <div id="head">
    <h1>16n configuration tool</h1>
    <DeviceDetails />
  </div>

  <div id="inner">
    {#if $webMidiEnabled}
      {#if $configuration}
        {#if $controllerMightNeedFactoryReset && semverGte($configuration.firmwareVersion, "2.1.0")}
          <!-- webmidi enabled, config not receiving, despite having a firmware that should work -->
          <div class="notice">
            <p>
              It looks like a 16n is trying to connect, but may have a corrupt
              memory.
            </p>
            <p>
              <Button
                label="Click to reset your 16n's EEPROM to factory defaults"
                click={transmitFactoryReset}
              />
            </p>
          </div>
        {:else}
          <!-- webmidi enabled, config setup, we're good to edit -->
          {#if $editMode}
            <Editing />
          {:else}
            <Viewing />
          {/if}
          <p />
        {/if}
      {:else}
        <!-- webmidi compatible browser, but no device -->
        <p class="notice">Connect a controller via USB.</p>
      {/if}
    {:else}
      <!-- webmidi incompatible device -->
      <p class="notice">
        WebMIDI could not be enabled. Please use a web browser that supports
        WebMIDI, such as Google Chrome.
      </p>
    {/if}
  </div>

  <div id="foot">
    <div class="foot-left">
      16n Editor v{buildVersion}
    </div>
  </div>
</main>

<style>
  #head {
    margin-bottom: 1rem;
    border-bottom: 1px solid #ccc;
    display: flex;
    flex: initial;
  }

  #head h1 {
    flex: 1 0;
    margin: 0 0 1rem;
  }

  main {
    width: 75%;
    margin: 0 auto;
    min-width: calc(16 * 75px);
    /* background: #fff; */
    display: flex;
    flex-direction: column;
    height: calc(100vh - 5rem);
  }

  #inner {
    flex: 1;
  }

  #foot {
    flex: initial;
    font-size: 80%;
    border-top: 1px solid #ccc;
    padding: 1rem 0;
    display: flex;
  }

  .foot-left {
    flex: 1;
  }

  .notice {
    text-align: center;
    margin-top: 6rem;
  }
</style>
