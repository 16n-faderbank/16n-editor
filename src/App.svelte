<script>
  import { setContext } from 'svelte'
  import cmp from 'semver-compare';
  import { ConfigurationObject } from "./Configuration.js";
  import { ImportExport } from "./ImportExport.js";
  import { logger } from "./logger.js";
  import { OxionMidi } from "./OxionMidi.js";

  import {
    configuration,
    editConfiguration,
    selectedMidiInput,
    selectedMidiOutput,
    webMidiEnabled
  } from "./stores.js";

  import Button from "./components/Button.svelte";
  import CheckOption from "./components/CheckOption.svelte";
  import Control from "./components/Control.svelte";
  import DebugConsole from "./components/DebugConsole.svelte";
  import DeviceOptions from "./components/DeviceOptions.svelte";
  import EditControl from "./components/EditControl.svelte";
  import Icon from "./components/Icon.svelte";
  import MidiContext from "./components/MidiContext.svelte";
  import MidiEnabled from "./components/MidiEnabled.svelte";
  import MidiSelector from "./components/MidiSelector.svelte";
  import Subhead from "./components/Subhead.svelte";
  import { Tabs, TabList, TabPanel, Tab } from './components/tabs';

  // window.debugMode = true;

  let editMode = false;
  let configDirty = false;
  let upgradeString = "";

  editConfiguration.subscribe(c => {
    if (c && $configuration) {
      configDirty = !c.isEquivalent($configuration);
    }
  });

  configuration.subscribe(c => {
    if (c && c.firmwareVersion && window.latestVersion && !window.versionCompared) {
      let delta = cmp(window.latestVersion,c.firmwareVersion);
      window.versionCompared = true;
      if(delta > 0) {
        upgradeString = `A new version of the 16n firmware (${window.latestVersion}) is available.`;
      } else {
        upgradeString = "";
      }
    }
  })

  function handleMessage(message) {
    switch (message.detail.name) {
      case "toggleEditMode":
        toggleEditMode();
        break;
      case "transmitConfig":
        transmitConfig();
        break;
      case "requestConfig":
        OxionMidi.requestConfig($selectedMidiOutput);
        break;
      case "importConfig":
        ImportExport.import($editConfiguration, $configuration, editConfiguration);
        break;
      case "exportConfig":
        ImportExport.export($configuration);
        break;
      default:
        break;
    }
  }

  function toggleEditMode() {
    editMode = !editMode;
    if (editMode) {
      let oldConfig = ConfigurationObject.clone($configuration);
      editConfiguration.update(c => oldConfig);
    }
  }

  function transmitConfig() {
    let sysexArray = $editConfiguration.toSysexArray();
    logger("Sending sysex:", sysexArray);

    OxionMidi.sendConfiguration($editConfiguration, $selectedMidiOutput);

    $configuration = $editConfiguration;

    editMode = !editMode;
  }

  fetch("https://api.github.com/repos/16n-faderbank/16n/releases")
    .then(r => r.json())
    .then(d => {
      window.latestVersion = d[0].tag_name.replace(/[a-zA-z]/g, "");
    });
</script>

<style>

  #controls {
    display: flex;
    min-width: calc(16 * 60px);
  }

  #head {
    margin-bottom: 1rem;
    border-bottom: 1px solid #ccc;
    display: flex;
  }

  #head h1 {
    flex: 1 0;
    margin: 0 0 2rem;
  }

  #head .details {
    flex: 1 0;
  }

  p.device {
    text-align: right;
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
  }

 span.upgrade {
   display: block;
   margin-top: 5px;
   color: #888;
 } 
</style>

<MidiContext>
  <main>
    <div id="head">
      <h1>16n configuration tool</h1>
      <MidiEnabled>
        <div class="details">
          <!-- <MidiSelector /> -->
          {#if $configuration}
            <p class='device'>
              Connected: <strong>{$configuration.device().name}</strong> running firmware <strong>{$configuration.firmwareVersion}</strong>
              {#if upgradeString.trim() != ""}
              <span class='upgrade'>
                {upgradeString}
                <a href="https://github.com/16n-faderbank/16n/releases">Download</a>
              </span>
              {/if}
            </p>
          {:else}
            <p class='device'>No device connected.</p>
          {/if}
        </div>
      </MidiEnabled>
    </div>
    <MidiEnabled fallback="WebMIDI could not be enabled. Please use a web browser that supports WebMIDI, such as Google Chrome.">
      {#if $configuration}
        {#if editMode}
          <Subhead title="Edit Configuration">
            <Button label="Cancel" icon="times" clickMessageName="toggleEditMode" on:message={handleMessage} />
            <Button label="Import config" icon="file-import" clickMessageName="importConfig" on:message={handleMessage}/>
            <Button label="Update controller" icon="download" clickMessageName="transmitConfig" disabled={!configDirty} on:message={handleMessage}  />
          </Subhead>
          <Tabs>
            <TabList>
              <Tab>USB</Tab> 
              <Tab>TRS Jack</Tab> 
              <Tab>Device Options</Tab> 
            </TabList>

            <TabPanel>
              <div id="controls">
                {#each $editConfiguration.usbControls as editControl, index}
                  {#if index < $configuration.device().controlCount}
                    <EditControl {editControl} {index} />
                  {/if}
                {/each}
              </div>
            </TabPanel>
          
            <TabPanel>
              <div id="controls">
                {#each $editConfiguration.trsControls as editControl, index}
                  {#if index < $configuration.device().controlCount}
                    <EditControl {editControl} {index} />
                  {/if}
                {/each}
              </div>
            </TabPanel>

            <TabPanel>
              <DeviceOptions />
            </TabPanel>
          </Tabs>

        {:else}
          <Subhead title="Current Configuration">
            <Button label="Export current config" icon="file-export" clickMessageName="exportConfig" on:message={handleMessage}/>
            <Button label="Edit Config" icon="pencil-alt" clickMessageName="toggleEditMode" on:message={handleMessage} />
            <!-- <Button label="Reload config from controller" icon="sync" clickMessageName="requestConfig" on:message={handleMessage}/> -->
          </Subhead>
          <Tabs>
            <TabList>
              <Tab>USB</Tab> 
              <Tab>TRS Jack</Tab> 
            </TabList>
            <TabPanel>
              <div id="controls">
                {#each $configuration.usbControls as control, index}
                  {#if index < $configuration.device().controlCount}
                    <Control {control} {index} />
                  {/if}
                {/each}
              </div>
            </TabPanel>

            <TabPanel>
              <div id="controls">
                {#each $configuration.trsControls as control, index}
                  {#if index < $configuration.device().controlCount}
                    <Control {control} {index} disableValue={true} />
                  {/if}
                {/each}
              </div>
              <p>There is no realtime preview of the TRS outputs.</p>
            </TabPanel>
          </Tabs>
        {/if}
        <p />
      {:else}
        <p>Connect a controller via USB.</p>
      {/if}
    </MidiEnabled>
    <div id="foot">16n Editor v{"__buildversion__"}</div>
  </main>

</MidiContext>
