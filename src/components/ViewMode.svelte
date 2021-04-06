<script>
  import Button from "./Button.svelte";
  import Control from "./Control.svelte";
  import Subhead from "./Subhead.svelte";
  import { Tabs, TabList, TabPanel, Tab } from './tabs';

   import {
    configuration,
  } from "../stores.js";
</script>

<style>
  #controls {
    display: flex;
    min-width: calc(16 * 60px);
  }
</style>

<Subhead title="Current Configuration">
  <Button label="Export current config" icon="file-export" clickMessageName="exportConfig" on:message/>
  <Button label="Edit Config" icon="pencil-alt" clickMessageName="toggleEditMode" on:message />
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
