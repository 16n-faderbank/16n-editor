<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Control from "$lib/components/Control.svelte";
  import Subhead from "$lib/components/Subhead.svelte";
  import { Tab, TabList, TabPanel, Tabs } from "$lib/components/tabs";

  import { configuration, editMode, editConfiguration } from "$lib/stores";
  import { exportConfig } from "$lib/import_export";
  import { deviceForId } from "$lib/configuration";
  import { logger } from "$lib/logger";

  const doExportConfig = () => {
    if ($configuration) {
      exportConfig($configuration);
    }
  };

  const doEditMode = () => {
    logger("Do edit mode");
    $editMode = true;
    if ($configuration) {
      $editConfiguration = structuredClone($configuration);
    }
  };

  $: device = $configuration ? deviceForId($configuration.deviceId) : null;
</script>

<Subhead title="Current Configuration">
  <Button
    label="Export current config"
    icon="file-export"
    click={doExportConfig}
  />
  <Button label="Edit Config" icon="pencil-alt" click={doEditMode} />
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
        {#if device && index < device.controlCount}
          <Control {control} {index} />
        {/if}
      {/each}
    </div>
  </TabPanel>

  <TabPanel>
    <div id="controls">
      {#each $configuration.trsControls as control, index}
        {#if device && index < device.controlCount}
          <Control {control} {index} disableValue={true} />
        {/if}
      {/each}
    </div>
    <p>There is no realtime preview of the TRS outputs.</p>
  </TabPanel>
</Tabs>

<style>
  #controls {
    display: flex;
    min-width: calc(16 * 60px);
  }
</style>
