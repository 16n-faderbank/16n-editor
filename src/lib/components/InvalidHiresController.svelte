<script lang="ts">
  // import InvalidHighRes from "./content/invalid-high-resolution.md";
  export let type: "usb" | "trs";
</script>

<div>
  <p>
    <strong>Warning: </strong>
    You have an one or more out-of-spec {type.toLocaleUpperCase()} CC assignments.
  </p>
  <p>
    The MIDI spec only allows for high-resolution CCs for CCs 0-31.
    <strong>However</strong>, some hardware or software is absolutely fine with
    high-resolution CCs on any channel. Check the documentation for your
    hardware or software; your faderbank configuration may still function
    correctly.
  </p>
</div>

<style>
  div {
    border: 2px solid goldenrod;
    background: #daa52044;
    padding: 1rem;
    margin: 1rem 0;
  }
</style>
