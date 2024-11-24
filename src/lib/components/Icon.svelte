<script lang="ts">
  interface Props {
    i: string;
    classList?: string;
  }

  let { i, classList = "" }: Props = $props();
</script>

<span class="fas fa-{i} {classList}"></span>

<style>
  span.fas.mid {
    color: #888;
  }
  span.fas.light {
    color: #ccc;
  }
</style>
