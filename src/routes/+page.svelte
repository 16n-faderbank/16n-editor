<script lang="ts">
  /* global __BUILD_VERSION__ */

  import { browser } from "$app/environment";
  import { gte as semverGte } from "semver";
  import { onMount } from "svelte";
  import { WebMidi } from "webmidi";

  import {
    onMIDISuccess,
    listenForSysex,
    listenForCC,
    doRequestConfig,
  } from "$lib/midi/midi.svelte";
  import { sendFactoryResetRequest } from "$lib/midi/sysex";

  import { configuration } from "$lib/state/configuration.svelte";
  import { midiState } from "$lib/state/midi.svelte";

  import Button from "$lib/components/Button.svelte";
  import DeviceDetails from "$lib/components/DeviceDetails.svelte";
  import Editing from "./Editing.svelte";
  import Viewing from "./Viewing.svelte";
  import { deviceForId } from "$lib/configuration";

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

  // subscribe to changing of midi state
  $effect(() => {
    if (midiState.selectedInput) {
      midiState.inputs.forEach((input) => {
        input.removeListener();
      });
      listenForCC(midiState.selectedInput);
      listenForSysex(midiState.selectedInput);
      configuration.current = null;
      doRequestConfig();
    }

    if (midiState.selectedOutput) {
      configuration.current = null;
      doRequestConfig();
    }
  });

  const transmitFactoryReset = () => {
    if (midiState.selectedOutput) {
      sendFactoryResetRequest(midiState.selectedOutput);
    }
  };

  let productName = $derived.by(() => {
    if (configuration.current) {
      const device = deviceForId(configuration.current.deviceId);
      return device.name.startsWith("8mu") ? "8mu" : "16n";
    }
    return "16n";
  });
</script>

<main>
  <div id="head">
    <h1>{productName} configuration tool</h1>
    <DeviceDetails />
  </div>

  <div id="inner">
    {#if midiState.webMidiEnabled}
      {#if configuration.current}
        {#if configuration.controllerMightNeedFactoryReset && semverGte(configuration.current.firmwareVersion, "2.1.0")}
          <!-- webmidi enabled, config not receiving, despite having a firmware that should work -->
          <div class="notice">
            <p>
              It looks like a 16n is trying to connect, but may have a corrupt
              memory.
            </p>
            <p>
              <Button onclick={transmitFactoryReset}>
                Click to reset your 16n's EEPROM to factory defaults
              </Button>
            </p>
          </div>
        {:else}
          <!-- webmidi enabled, config setup, we're good to edit -->
          {#if configuration.editMode}
            <Editing />
          {:else}
            <Viewing />
          {/if}
          <p></p>
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
