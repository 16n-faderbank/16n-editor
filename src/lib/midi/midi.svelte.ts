import type {
  ControlChangeMessageEvent,
  Input,
  MessageEvent,
  Output,
} from "webmidi";
import { WebMidi } from "webmidi";

import { configFromSysexArray } from "$lib/configuration";
import { logger } from "$lib/logger";
import { isOxionSysex, requestConfig } from "$lib/midi/sysex";
import { configuration } from "$lib/state/configuration.svelte";

import { midiState } from "$lib/state/midi.svelte";

import type { Control, ButtonControl } from "$lib/types";

type MidiInterface = Input | Output;

let configTimeout = -1;

export const allMidiInputs = () => {
  return WebMidi.inputs.sort(sortMidiInterfaces);
};

export const allMidiOutputs = () => {
  return WebMidi.outputs.sort(sortMidiInterfaces);
};

export const sortMidiInterfaces = (a: MidiInterface, b: MidiInterface) => {
  const aName = `${a.manufacturer} ${a.name}`;
  const bName = `${b.manufacturer} ${b.name}`;

  if (aName < bName) {
    return -1;
  } else if (aName > bName) {
    return 1;
  } else {
    return 0;
  }
};

export const onMIDISuccess = () => {
  logger("WebMidi enabled!");
  midiState.webMidiEnabled = true;
  setupMidiHeartBeat();
};

const setupMidiHeartBeat = () => {
  logger("Setting up heartbeat");

  midiState.inputs = [...allMidiInputs()];
  midiState.outputs = [...allMidiOutputs()];

  doMidiHeartBeat();

  WebMidi.addListener("connected", () => {
    // logger('connected event', e)

    midiState.inputs = [...allMidiInputs()];
    midiState.outputs = [...allMidiOutputs()];

    doMidiHeartBeat();
  });

  WebMidi.addListener("disconnected", () => {
    // logger('disconnected event', e)
    midiState.inputs = [...allMidiInputs()];
    midiState.outputs = [...allMidiOutputs()];

    // TODO: this disables MIDI on any disconnect, which is crap
    //       you should only do this if the disconnected input IS the one you were selected
    midiState.selectedInput = null;

    // TODO: this disables MIDI on any disconnect, which is crap
    //       you should only do this if the disconnected input IS the one you were selected
    midiState.selectedOutput = null;

    configuration.current = null;
    doMidiHeartBeat();
  });
  setInterval(() => {
    doMidiHeartBeat();
  }, 5000);
};

const doMidiHeartBeat = () => {
  if (!midiState.selectedInput && midiState.inputs.length > 0) {
    const inputPort = midiState.inputs.find(
      (input) => input.name.match(/.*16n.*/) || input.name.match(/.*8mu.*/),
    );
    if (inputPort) {
      midiState.selectedInput = inputPort;
    }
  }
  if (!midiState.selectedOutput && midiState.outputs.length > 0) {
    const outputPort = midiState.outputs.find(
      (output) => output.name.match(/.*16n.*/) || output.name.match(/.*8mu.*/),
    );
    if (outputPort) {
      midiState.selectedOutput = outputPort;
    }
  }

  if (
    !configuration.current &&
    midiState.selectedInput &&
    midiState.selectedOutput
  ) {
    listenForCC(midiState.selectedInput);
    listenForSysex(midiState.selectedInput);
    listenForNotes(midiState.selectedInput);
    logger("Hearbeat requesting config.");
    doRequestConfig();
  }
};

const controllerMoved = (event: ControlChangeMessageEvent) => {
  if (configuration.current) {
    configuration.current.usbControls.forEach((c: Control) => {
      // Handling high-res is a bit painful.
      // we need to catch if it's a channel OR if it's a high-res shadow channel
      // then, we should set msb/lsb
      // if the channel is high-res, we set val based on that.
      if (
        event.message.channel == c.channel &&
        event.controller.number == c.cc
      ) {
        c.msb = event.rawValue as number;
      }

      if (
        c.highResolution &&
        event.message.channel == c.channel &&
        event.controller.number == c.cc + 32
      ) {
        c.lsb = event.rawValue as number;
      }

      if (c.highResolution && c.msb) {
        c.val = (c.msb << 7) + c.lsb;
      } else {
        c.val = c.msb;
      }
    });
  }
};

export const listenForNotes = (input: Input) => {
  input.addListener("noteon", noteOn);
  input.addListener("noteoff", noteOff);
};

const noteOn = (event: MessageEvent) => {
  if (configuration.current && configuration.current.usbButtonControls) {
    configuration.current.usbButtonControls.forEach((c: ButtonControl) => {
      if (
        event.message.channel == c.channel &&
        event.message.data[1] == c.paramA &&
        c.mode === 0
      ) {
        c.pressed = true;
      }
    });
  }
};

const noteOff = (event: MessageEvent) => {
  if (configuration.current && configuration.current.usbButtonControls) {
    configuration.current.usbButtonControls.forEach((c: ButtonControl) => {
      if (
        event.message.channel == c.channel &&
        event.message.data[1] == c.paramA &&
        c.mode === 0
      ) {
        c.pressed = false;
      }
    });
  }
};

export const listenForCC = (input: Input) => {
  input.addListener("controlchange", controllerMoved);
};

export const listenForSysex = (input: Input) => {
  input.addListener("sysex", (e: MessageEvent) => {
    const data = e.message.data;
    if (!isOxionSysex(data)) {
      logger("Sysex not for us:", data);
      return;
    }
    if (data[4] == 0x0f) {
      // it's an c0nFig message!
      configuration.current = configFromSysexArray(data);
      logger("Received config", configuration.current);

      configTimeout = -1;
      configuration.controllerMightNeedFactoryReset = false;
    }
  });
  logger("Attached sysex listener to ", input.name);
};

export const doRequestConfig = () => {
  if (configTimeout < 0) {
    configTimeout = Date.now();
  }

  if (Date.now() - configTimeout > 8000) {
    if (!configuration.controllerMightNeedFactoryReset) {
      configuration.controllerMightNeedFactoryReset = true;
    }
  }

  const selectedInput = midiState.selectedInput;
  const selectedOutput = midiState.selectedOutput;

  if (selectedInput && selectedOutput) {
    logger("Requesting config over " + selectedOutput.name);
    logger("Hoping to receive on " + selectedInput.name);
    requestConfig(selectedOutput);
  }
};
