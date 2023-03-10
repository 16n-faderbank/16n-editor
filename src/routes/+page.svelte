<script lang="ts">
  /* global BUILD_VERSION */
  import { browser } from "$app/environment";
  import { gte as semverGte } from "semver";
  import { onMount } from "svelte";
  import { WebMidi } from "webmidi";

  import { onMIDISuccess } from "$lib/midi/midi";

  import {
    configuration,
    controllerMightNeedFactoryReset,
    editMode,
    selectedMidiOutput,
    webMidiEnabled,
  } from "$lib/stores";

  import Button from "$lib/components/Button.svelte";
  // import DebugConsole from "./components/DebugConsole.svelte";
  import DeviceDetails from "$lib/components/DeviceDetails.svelte";
  import Editing from "./Editing.svelte";
  // import MidiSelector from "./components/MidiSelector.svelte";
  import Viewing from "./Viewing.svelte";
  import { sendFactoryResetRequest } from "$lib/midi/sysex";

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

  {#if $webMidiEnabled}
    {#if $configuration}
      {#if $controllerMightNeedFactoryReset && semverGte($configuration.firmwareVersion, "2.1.0")}
        <p>
          It looks like a 16n is trying to connect, but may have a corrupt
          memory.
        </p>
        <Button
          label="Click to reset your 16n's EEPROM to factory defaults"
          click={transmitFactoryReset}
        />
      {:else}
        {#if $editMode}
          <Editing />
        {:else}
          <Viewing />
        {/if}
        <p />
      {/if}
    {:else}
      <p>Connect a controller via USB.</p>
    {/if}
  {:else}
    <p>
      WebMIDI could not be enabled. Please use a web browser that supports
      WebMIDI, such as Google Chrome.
    </p>
  {/if}

  <div id="foot">
    <div class="foot-left">
      16n Editor v{BUILD_VERSION}
    </div>
  </div>
</main>

<style>
  #head {
    margin-bottom: 1rem;
    border-bottom: 1px solid #ccc;
    display: flex;
  }

  #head h1 {
    flex: 1 0;
    margin: 0 0 2rem;
  }

  main {
    width: 75%;
    margin: 0 auto;
    min-width: calc(16 * 75px);
    /* background: #fff; */
  }

  #foot {
    font-size: 80%;
    border-top: 1px solid #ccc;
    padding-top: 5px;
    display: flex;
  }

  .foot-left {
    flex: 1;
  }
</style>
