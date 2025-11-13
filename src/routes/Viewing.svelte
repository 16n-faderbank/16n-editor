<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import ButtonControl from "$lib/components/ButtonControl.svelte";
  import Control from "$lib/components/Control.svelte";
  import Subhead from "$lib/components/Subhead.svelte";
  import { Tab, TabList, TabPanel, Tabs } from "$lib/components/tabs";

  import { configuration } from "$lib/state/configuration.svelte";
  import { exportConfig } from "$lib/import_export";
  import { deviceForId } from "$lib/configuration";
  import { logger } from "$lib/logger";

  const doExportConfig = () => {
    if (configuration.current) {
      exportConfig($state.snapshot(configuration.current));
      console.log("Export complete");
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
    <Button icon="file-export" onclick={doExportConfig}>
      Export current config
    </Button>
    <Button icon="pencil-alt" onclick={doEditMode}>Edit config</Button>
    <!-- <Button label="Reload config from controller" icon="sync" clickMessageName="requestConfig" on:message={handleMessage}/> -->
  </Subhead>
  <Tabs>
    <TabList>
      <Tab>USB</Tab>
      <Tab>TRS Jack</Tab>
      {#if device?.buttonCount && device.buttonCount > 0}
        <Tab>USB Buttons</Tab>
        <Tab>TRS Buttons</Tab>
      {/if}
    </TabList>
    <TabPanel>
      <div id="controls">
        {#each configuration.current.usbControls as control, index}
          {#if device && index < device.controlCount}
            <Control {device} {control} {index} />
          {/if}
        {/each}
      </div>
    </TabPanel>

    <TabPanel>
      <div id="controls">
        {#each configuration.current.trsControls as control, index}
          {#if device && index < device.controlCount}
            <Control {device} {control} {index} disableValue={true} />
          {/if}
        {/each}
      </div>
      <p>There is no realtime preview of the TRS outputs.</p>
    </TabPanel>

    {#if device?.buttonCount && device.buttonCount > 0}
      <TabPanel>
        <div id="controls">
          {#each configuration.current.usbButtonControls as control, index}
            {#if device && index < device.controlCount}
              <ButtonControl {device} {control} {index} />
            {/if}
          {/each}
        </div>
      </TabPanel>
      <TabPanel>
        <div id="controls">
          {#each configuration.current.trsButtonControls as control, index}
            {#if device && index < device.controlCount}
              <ButtonControl {device} {control} {index} disableValue={true} />
            {/if}
          {/each}
        </div>
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
