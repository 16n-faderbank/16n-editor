import type { Output } from "webmidi";

export const sendProgChange = (prog: number, output: Output) => {
  output.sendProgramChange(prog, { channels: 1 });
};
