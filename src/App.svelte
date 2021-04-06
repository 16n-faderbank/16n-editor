<script>
  window.debugMode = true;

  import { handleMessage } from "./message_handling";

  import {
    configuration,
    editMode,
    controllerMightNeedFactoryReset
  } from "./stores.js";

  import Button from "./components/Button.svelte";
  // import DebugConsole from "./components/DebugConsole.svelte";
  import DeviceDetails from './components/DeviceDetails.svelte';
  import EditMode from './components/EditMode.svelte';
  import MidiContext from "./components/MidiContext.svelte";
  import MidiEnabled from "./components/MidiEnabled.svelte";
  // import MidiSelector from "./components/MidiSelector.svelte";
  import ViewMode from './components/ViewMode.svelte';
</script>

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
    min-width: calc(16*75px);
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

<MidiContext>
  <main>
    <div id="head">
      <h1>16n configuration tool</h1>
      <DeviceDetails></DeviceDetails>
    </div>

    <MidiEnabled fallback="WebMIDI could not be enabled. Please use a web browser that supports WebMIDI, such as Google Chrome.">
      {#if $configuration}
        {#if $editMode}
          <EditMode on:message={handleMessage}></EditMode>
        {:else}
          <ViewMode on:message={handleMessage}></ViewMode> 
        {/if}
        <p />
      {:else}
        {#if $controllerMightNeedFactoryReset}
          <p>It looks like a 16n is trying to connect, but may have a corrupt memory.</p>
          <Button label="Click to reset your 16n's EEPROM to factory defaults" clickMessageName="transmitFactoryReset" on:message={handleMessage}></Button>
        {:else}
          <p>Connect a controller via USB.</p>
        {/if}
      {/if}
    </MidiEnabled>

    <div id="foot">
      <div class='foot-left'>
        16n Editor v{"__buildversion__"}
      </div>
    </div>
  </main>
</MidiContext>
