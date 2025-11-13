<script lang="ts">
  import { logger } from "$lib/logger";
  import { gte as semverGte } from "semver";

  import Button from "$lib/components/Button.svelte";
  import DeviceOptions from "$lib/components/DeviceOptions.svelte";
  import EditControl from "$lib/components/EditControl.svelte";
  import EditButtonControl from "$lib/components/EditButtonControl.svelte";
  import FactoryReset from "$lib/components/FactoryReset.svelte";
  import Subhead from "$lib/components/Subhead.svelte";
  import ExplainHiResMode from "$lib/components/ExplainHiResMode.svelte";
  import InvalidHiresController from "$lib/components/InvalidHiresController.svelte";
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

  let invalidUsbHires = $derived(
    configuration.editing &&
      configuration.editing.usbControls.some(
        (c) => c.highResolution && c.cc > 31,
      ),
  );

  let invalidTrsHires = $derived(
    configuration.editing &&
      configuration.editing.trsControls.some(
        (c) => c.highResolution && c.cc > 31,
      ),
  );

  const setAllHighResolution = (highRes: boolean, type: "usb" | "trs") => {
    if (type == "usb") {
      configuration.editing?.usbControls.forEach((c) => {
        c.highResolution = highRes;
      });
    }
    if (type == "trs") {
      configuration.editing?.trsControls.forEach((c) => {
        c.highResolution = highRes;
      });
    }
  };

  const setAllChannels = (type: "usb" | "trs") => {
    if (!configuration.editing) {
      console.error("No configuration to update");
      return;
    }

    if (type == "usb") {
      const chan = configuration.editing.usbControls[0].channel;
      for (let i = 1; i < configuration.editing.usbControls.length; i++) {
        configuration.editing.usbControls[i].channel = chan;
      }
    }
    if (type == "trs") {
      const chan = configuration.editing.trsControls[0].channel;
      for (let i = 1; i < configuration.editing.trsControls.length; i++) {
        configuration.editing.trsControls[i].channel = chan;
      }
    }
  };
  const setSequentialCCs = (type: "usb" | "trs") => {
    if (!configuration.editing) {
      console.error("No configuration to update");
      return;
    }

    if (type == "usb") {
      const cc = configuration.editing.usbControls[0].cc;
      for (let i = 1; i < configuration.editing.usbControls.length; i++) {
        let finalCC = cc + i;
        let maxCC = configuration.editing.usbControls[i].highResolution
          ? 95
          : 127;
        configuration.editing.usbControls[i].cc =
          finalCC > maxCC ? maxCC : finalCC;
      }
    }
    if (type == "trs") {
      const cc = configuration.editing.trsControls[0].cc;
      for (let i = 1; i < configuration.editing.trsControls.length; i++) {
        let finalCC = cc + i;
        let maxCC = configuration.editing.trsControls[i].highResolution
          ? 95
          : 127;
        configuration.editing.usbControls[i].cc =
          finalCC > maxCC ? maxCC : finalCC;
      }
    }
  };
</script>

<Subhead title="Edit Configuration">
  <Button icon="times" onclick={cancelEditMode}>Cancel</Button>
  <Button icon="file-import" onclick={doImportConfig}>Import config</Button>
  <Button icon="download" onclick={transmitConfig} disabled={!configDirty}>
    Update controller
  </Button>
</Subhead>

{#if configuration.editing}
  <Tabs>
    <TabList>
      <Tab>USB</Tab>
      <Tab>TRS Jack</Tab>
      {#if device?.buttonCount && device.buttonCount > 0}
        <Tab>USB Buttons</Tab>
        <Tab>TRS Buttons</Tab>
      {/if}
      <Tab>Device Options</Tab>
      {#if configuration.current && semverGte(configuration.current.firmwareVersion, "2.1.0")}
        <Tab>Factory Reset</Tab>
      {/if}
    </TabList>

    <TabPanel>
      <div id="controls">
        {#each configuration.editing.usbControls as editControl, index}
          {#if device && index < device.controlCount}
            <EditControl {device} {editControl} {index} />
          {/if}
        {/each}
      </div>
      <div id="extra-controls">
        <div class="left">
          <Button onclick={() => setAllChannels("usb")}
            >Set all channels to that of channel 1</Button
          ><br />
          <Button onclick={() => setSequentialCCs("usb")}
            >Set CCs sequentially, starting at channel 1</Button
          >
        </div>
        <div class="right">
          {#if deviceSupportsHighResolution}
            <Button onclick={() => setAllHighResolution(true, "usb")}
              >Set all USB channels to high-resolution (14 bit)</Button
            ><br />
            <Button onclick={() => setAllHighResolution(false, "usb")}
              >Set all USB channels to regular-resolution (7 bit)</Button
            >
          {/if}
        </div>
      </div>
      {#if deviceSupportsHighResolution}
        {#if invalidUsbHires}
          <InvalidHiresController type="usb" />
        {/if}
        <ExplainHiResMode />
      {/if}
    </TabPanel>

    <TabPanel>
      <div id="controls">
        {#each configuration.editing.trsControls as editControl, index}
          {#if device && index < device.controlCount}
            <EditControl {device} {editControl} {index} />
          {/if}
        {/each}
      </div>
      <div id="extra-controls">
        <div class="left">
          <Button onclick={() => setAllChannels("trs")}
            >Set all channels to that of channel 1</Button
          ><br />
          <Button onclick={() => setSequentialCCs("trs")}
            >Set CCs sequentially, starting at channel 1</Button
          >
        </div>
        <div class="right">
          {#if deviceSupportsHighResolution}
            <Button onclick={() => setAllHighResolution(true, "trs")}
              >Set all TRS channels to high-resolution (14 bit)</Button
            ><br />
            <Button onclick={() => setAllHighResolution(false, "trs")}
              >Set all TRS channels to regular-resolution (7 bit)</Button
            >
          {/if}
        </div>
      </div>
      {#if deviceSupportsHighResolution}
        {#if invalidTrsHires}
          <InvalidHiresController type="trs" />
        {/if}
        <ExplainHiResMode />
      {/if}
    </TabPanel>

    {#if device?.buttonCount && device.buttonCount > 0}
      <TabPanel>
        <div id="controls">
          {#each configuration.editing.usbButtonControls as editControl, index}
            {#if device && index < device.controlCount}
              <EditButtonControl {device} {editControl} {index} />
            {/if}
          {/each}
        </div>
      </TabPanel>
      <TabPanel>
        <div id="controls">
          {#each configuration.editing.trsButtonControls as editControl, index}
            {#if device && index < device.controlCount}
              <EditButtonControl {device} {editControl} {index} />
            {/if}
          {/each}
        </div>
      </TabPanel>
    {/if}

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

  #extra-controls {
    display: flex;
    justify-content: space-between;
  }

  #extra-controls .left {
    flex: 1;
  }
  #extra-controls .right {
    flex: 1;
    text-align: right;
  }
</style>
