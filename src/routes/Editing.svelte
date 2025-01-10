<script lang="ts">
  import { logger } from "$lib/logger";
  import { gte as semverGte } from "semver";

  import Button from "$lib/components/Button.svelte";
  import DeviceOptions from "$lib/components/DeviceOptions.svelte";
  import EditControl from "$lib/components/EditControl.svelte";
  import FactoryReset from "$lib/components/FactoryReset.svelte";
  import Subhead from "$lib/components/Subhead.svelte";
  import { Tab, TabList, TabPanel, Tabs } from "$lib/components/tabs";

  import {
    deviceForId,
    deviceHasCapability,
    isEquivalent,
    toSysexArray,
  } from "$lib/configuration";
  import { importConfig } from "$lib/import_export";
  import { requestConfig, sendConfiguration } from "$lib/midi/sysex";
  import { configuration } from "$lib/state/configuration.svelte";
  import { midiState } from "$lib/state/midi.svelte";
  import ExplainHiResMode from "$lib/components/ExplainHiResMode.svelte";

  let configDirty = $state(false);

  $effect(() => {
    if (configuration.editing && configuration.current) {
      configDirty = !isEquivalent(configuration.editing, configuration.current);
    }
  });

  const cancelEditMode = () => {
    configuration.editMode = false;
  };

  const doImportConfig = () => {
    if (configuration.editing && configuration.current) {
      importConfig(configuration.editing, configuration.current);
    }
  };

  const transmitConfig = () => {
    if (!configuration.editing) {
      console.error("No edit configuration found");
      return;
    }
    if (!midiState.selectedOutput) {
      console.error("No selected MIDI output found");
      return;
    }
    const sysexArray = toSysexArray(configuration.editing);
    logger("Sending sysex:", sysexArray);

    sendConfiguration(configuration.editing, midiState.selectedOutput);

    configuration.current = structuredClone(
      $state.snapshot(configuration.editing),
    );

    configuration.editMode = false;

    requestConfig(midiState.selectedOutput);
  };

  let device = $derived(
    configuration.current ? deviceForId(configuration.current.deviceId) : null,
  );

  let deviceSupportsHighResolution = $derived(
    configuration.editing &&
      device &&
      deviceHasCapability(
        device,
        "highResolution",
        configuration.editing.firmwareVersion,
      ),
  );
</script>

<Subhead title="Edit Configuration">
  <Button label="Cancel" icon="times" click={cancelEditMode} />
  <Button label="Import config" icon="file-import" click={doImportConfig} />
  <Button
    label="Update controller"
    icon="download"
    click={transmitConfig}
    disabled={!configDirty}
  />
</Subhead>

{#if configuration.editing}
  <Tabs>
    <TabList>
      <Tab>USB</Tab>
      <Tab>TRS Jack</Tab>
      <Tab>Device Options</Tab>
      {#if configuration.current && semverGte(configuration.current.firmwareVersion, "2.1.0")}
        <Tab>Factory Reset</Tab>
      {/if}
    </TabList>

    <TabPanel>
      <div id="controls">
        {#each configuration.editing.usbControls as editControl, index}
          {#if device && index < device.controlCount}
            <EditControl {editControl} {index} />
          {/if}
        {/each}
      </div>
      {#if deviceSupportsHighResolution}
        <ExplainHiResMode />
      {/if}
    </TabPanel>

    <TabPanel>
      <div id="controls">
        {#each configuration.editing.trsControls as editControl, index}
          {#if device && index < device.controlCount}
            <EditControl {editControl} {index} />
          {/if}
        {/each}
      </div>
      {#if deviceSupportsHighResolution}
        <ExplainHiResMode />
      {/if}
    </TabPanel>

    <TabPanel>
      <DeviceOptions />
    </TabPanel>

    {#if configuration.current && semverGte(configuration.current.firmwareVersion, "2.1.0")}
      <TabPanel>
        <FactoryReset on:message />
      </TabPanel>
    {/if}
  </Tabs>
{/if}

<style>
  #controls {
    display: flex;
    min-width: calc(16 * 60px);
  }
</style>
