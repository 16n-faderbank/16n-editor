/*
 * Message Handling
 * This is basically how all events get handled: 
 * events should bubble up to App.svelte, which then calls 
 * handleMessage in this file, which works out what to do. I've 
 * extracted this from App.svelte because it was just 
 * getting a bit big...
 */

import { get } from 'svelte/store';

import { logger } from "./logger.js";
import { ConfigurationObject } from "./Configuration.js";
import { ImportExport } from "./ImportExport.js";
import { OxionMidi } from "./OxionMidi.js";

import {
  configuration,
  editConfiguration,
  editMode,
  selectedMidiOutput
} from "./stores.js";

function handleMessage(message) {
  switch (message.detail.name) {
    case "toggleEditMode":
      toggleEditMode();
      break;
    case "transmitConfig":
      transmitConfig();
      break;
    case "requestConfig":
      OxionMidi.requestConfig(get(selectedMidiOutput));
      break;
    case "importConfig":
      ImportExport.import(get(editConfiguration), get(configuration), editConfiguration);
      break;
    case "exportConfig":
      ImportExport.export(get(configuration));
      break;
    case "transmitFactoryReset":
      transmitFactoryReset();
      break;
    default:
      break;
  }
}

function toggleEditMode() {
  editMode.update(e => !get(editMode));
  if (get(editMode)) {
    let oldConfig = ConfigurationObject.clone(get(configuration));
    editConfiguration.update(c => oldConfig);
  }
}

function transmitConfig() {
  let sysexArray = get(editConfiguration).toSysexArray();
  logger("Sending sysex:", sysexArray);

  OxionMidi.sendConfiguration(get(editConfiguration), get(selectedMidiOutput));

  $configuration = $editConfiguration;

  editMode.update(e => !get(editMode));
}

function transmitFactoryReset() {
  logger("Sending factory reset request");

  editMode.update(e => false);
  OxionMidi.sendFactoryResetRequest(get(selectedMidiOutput));

  setTimeout(() => {
    OxionMidi.requestConfig(get(selectedMidiOutput));
  }, 50);
}

export { handleMessage };
