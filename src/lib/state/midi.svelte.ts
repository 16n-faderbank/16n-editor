import type { Input, Output } from "webmidi";

export const midiState = $state({
  inputs: [] as Input[],
  outputs: [] as Output[],
  selectedInput: null as Input | null,
  selectedOutput: null as Output | null,
  webMidiEnabled: false,
});
