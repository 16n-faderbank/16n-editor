<script lang="ts">
  import { gt as semverGt } from "semver";

  import { midiState } from "$lib/state/midi.svelte";

  import { deviceForId } from "$lib/configuration";
  import { configuration } from "$lib/state/configuration.svelte";

  let upgradeString = $state("");
  let upgradeUrl = $state("");
  let versionCompared = false;

  $effect(() => {
    if (
      configuration.current &&
      configuration.current.firmwareVersion &&
      configuration.current.deviceId &&
      !versionCompared
    ) {
      versionCompared = true;
      const device = deviceForId(configuration.current.deviceId);
      if (
        device.latestFirmwareVersion &&
        semverGt(
          device.latestFirmwareVersion,
          configuration.current.firmwareVersion,
        )
      ) {
        upgradeString = `A new version of the ${device.name} firmware (${device.latestFirmwareVersion}) is available.`;
        upgradeUrl = device.firmwareUrl || "";
      } else {
        upgradeString = "";
        upgradeUrl = "";
      }
    }
  });
</script>

{#if midiState.webMidiEnabled}
  <div class="details">
    <!-- <MidiSelector /> -->
    {#if configuration.current}
      <p class="device">
        Connected: <strong
          >{deviceForId(configuration.current.deviceId).name}</strong
        >
        running firmware
        <strong>{configuration.current.firmwareVersion}</strong>
        {#if upgradeString.trim() != ""}
          <span class="upgrade">
            {upgradeString}
            <a href={upgradeUrl}>Download</a>
          </span>
        {/if}
      </p>
    {:else}
      <p class="device">No device connected.</p>
    {/if}
  </div>
{/if}

<style>
  .details {
    flex: 1 0;
  }

  p.device {
    text-align: right;
  }
  span.upgrade {
    display: block;
    margin-top: 5px;
    color: #888;
  }
</style>
