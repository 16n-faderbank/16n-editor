<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Control from "$lib/components/Control.svelte";
  import Subhead from "$lib/components/Subhead.svelte";
  import { Tab, TabList, TabPanel, Tabs } from "$lib/components/tabs";

  import { configuration } from "$lib/state/configuration.svelte";
  import { exportConfig } from "$lib/import_export";
  import { deviceForId } from "$lib/configuration";
  import { logger } from "$lib/logger";

  const doExportConfig = () => {
    if (configuration.current) {
      exportConfig(configuration.current);
    }
  };

  const doEditMode = () => {
    logger("Do edit mode");
    configuration.editMode = true;
    if (configuration.current) {
      configuration.editing = structuredClone(
        $state.snapshot(configuration.current),
      );
    }
  };

  let device = $derived(
    configuration.current ? deviceForId(configuration.current.deviceId) : null,
  );
</script>

{#if configuration.current}
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
        {#each configuration.current.usbControls as control, index}
          {#if device && index < device.controlCount}
            <Control {control} {index} />
          {/if}
        {/each}
      </div>
    </TabPanel>

    <TabPanel>
      <div id="controls">
        {#each configuration.current.trsControls as control, index}
          {#if device && index < device.controlCount}
            <Control {control} {index} disableValue={true} />
          {/if}
        {/each}
      </div>
      <p>There is no realtime preview of the TRS outputs.</p>
    </TabPanel>
  </Tabs>
{/if}

<style>
  #controls {
    display: flex;
    min-width: calc(16 * 60px);
  }
</style>
