<script lang="ts">
  import type { Control } from "$lib/types";

  interface Props {
    control: Control;
    index: number;
    disableValue?: boolean;
  }

  let { control, index, disableValue = false }: Props = $props();

  let barHeight = $derived(
    control.highResolution ? (control.val || 0) >> 7 : control.val,
  );

  let overUnderThreshold = $derived(control.highResolution ? 27 << 7 : 27);
</script>

<dl class="config-column">
  <dt class="index">{index + 1}</dt>
  <dt>Channel</dt>
  <dd>{control.channel}</dd>
  <dt>CC</dt>
  <dd>
    {control.cc}
    {#if control.highResolution}
      <span
        class="hires"
        title="This channel is in high-resolution mode, meaning it also uses a 'shadow' CC, 32 above the main CC"
      >
        &amp; {control.cc + 32}
      </span>
    {/if}
  </dd>
  {#if !disableValue}
    <dt>Value</dt>
    <dd class="display">
      <div class="inner">
        {#if control.val !== undefined}
          <span
            class="controlval"
            class:highresolution={control.highResolution}
            class:lowvalue={control.val < overUnderThreshold}
          >
            {control.val}
          </span>
        {/if}
        <div class="bar" style="height: {barHeight}px"></div>
      </div>
    </dd>
  {/if}
</dl>

<style>
  dl {
    flex: 1;
    text-align: center;
  }
  dt {
    font-weight: bold;
    border-top: 1px solid #aaa;
    padding-top: 0.5rem;
    margin-right: 5px;
  }

  dt.index {
    background: #666;
    color: #f0f0f0;
    padding: 0.5rem 0;
  }

  dd {
    padding: 0 0 0.5rem 0;
    border-bottom: 1px solid #aaa;
    margin: 0;
    margin-right: 5px;
  }

  dd.display {
    height: 150px;
    position: relative;
    padding: 0 0 0.5rem 0;
  }
  .bar {
    background: black;
    display: block;
    width: 35px;
    margin: 0 auto;
  }

  .inner {
    bottom: 0.5rem;
    position: absolute;
    width: 100%;
  }

  span.controlval {
    display: block;
    position: absolute;
    color: white;
    padding: 0;
    top: 6px;
    left: 0;
    width: 100%;
  }

  span.highresolution {
    font-size: 0.75rem;
  }

  span.lowvalue {
    top: -20px;
    color: black;
  }
  span.hires {
    opacity: 0.5;
  }
</style>
