<script>
  import Button from "./Button.svelte";
  import DeviceOptions from "./DeviceOptions.svelte";
  import EditControl from './EditControl.svelte';
  import FactoryReset from './FactoryReset.svelte';
  import Subhead from "./Subhead.svelte";
  import { Tabs, TabList, TabPanel, Tab } from './tabs';

  import {
    configuration,
    editConfiguration,
  } from "../stores.js";

  let configDirty = false;

  editConfiguration.subscribe(c => {
    if (c && $configuration) {
      configDirty = !c.isEquivalent($configuration);
    }
  });
</script>

<style>

  #controls {
    display: flex;
    min-width: calc(16 * 60px);
  }

</style>

<Subhead title="Edit Configuration">
  <Button label="Cancel" icon="times" clickMessageName="toggleEditMode" on:message />
  <Button label="Import config" icon="file-import" clickMessageName="importConfig" on:message/>
  <Button label="Update controller" icon="download" clickMessageName="transmitConfig" disabled={!configDirty} on:message  />
</Subhead>

<Tabs>
  <TabList>
    <Tab>USB</Tab> 
    <Tab>TRS Jack</Tab> 
    <Tab>Device Options</Tab> 
    <Tab>Factory Reset</Tab> 
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

  <TabPanel>
    <FactoryReset on:message />
  </TabPanel>
</Tabs>
