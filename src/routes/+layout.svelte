<script lang="ts">
  import "../app.css";

  let { children } = $props();
</script>

<svelte:head>
  <title>16n Controller Editor</title>
</svelte:head>

{@render children()}
