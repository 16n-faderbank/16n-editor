
<script>
  import Button from "../components/Button.svelte";
</script>

<style></style>

<p>
  "Factory Reset" will reset the configuration of your 16n back to 'default' values; primarily, MIDI CCs 32-48, Channel 1, for both TRS and USB MIDI.
</p>

<p>
  Note that this will also reset any calibration data or other options you may have adjusted on the "Device Options" tab. You will need to repeat this configuration after performing a reset.
</p>


<Button label="Reset controller configuration to defaults"      
        icon="history" 
        on:message
        clickMessageName="transmitFactoryReset" 
        confirmMessage="Confirm that you wish to reset your controller configuration to the default values. You will lose any configuration stored on the controller."
      />
