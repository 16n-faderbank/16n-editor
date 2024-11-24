<script lang="ts">
  interface Props {
    title: string;
    children?: () => any;
  }
  let { title, children }: Props = $props();
</script>

<div class="subhead">
  <h2>
    {title}
  </h2>
  <div class="details">
    {#if children}
      {@render children()}
    {/if}
  </div>
</div>

<style>
  .subhead {
    display: flex;
  }

  .subhead h2 {
    flex: 3;
    margin: 0;
  }

  .subhead :global(p) {
    margin: 0;
  }

  .subhead .details {
    flex: 2;
    text-align: right;
  }
</style>
