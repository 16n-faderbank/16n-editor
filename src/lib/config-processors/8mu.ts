import type { Control, ControllerConfiguration, Device } from "$lib/types";
import { parseFirmwareVersion } from "./shared";

//
// [
// 240, 125, 0, 0, 15, 6, 0, 3, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
// 1, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 1, 1, 1, 1,
// 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43,
// 44, 45, 46, 47, 48, 49, 1, 0, 36, 64, 1, 0, 48, 64, 1, 0, 60, 64, 1, 0, 72,
// 64, 1, 0, 36, 64, 1, 0, 48, 64, 1, 0, 60, 64, 1, 0, 72, 64, 247,
// ];

/**
 * Config processor for 8mu2040 devices
 *
 * TODO: Implement 8mu-specific data structure transforms
 * This is a placeholder that needs to be filled in based on
 * the 8mu2040's actual sysex format.
 */

export const configFromSysexArray = (
  data: number[],
  device: Device,
  deviceId: number,
  firmwareVersion: string,
): ControllerConfiguration => {
  // TODO: Implement 8mu-specific parsing
  // This is work in progress; currently, this is just parsing a _single bank_ of 8mu data.
  const offset = 9;

  // TODO: these need to be dynamic
  const ledOn = true;
  const ledFlash = false;
  const controllerFlip = false;
  const midiThru = false;

  const usbControls: Partial<Control>[] = [];
  const trsControls: Partial<Control>[] = [];

  data.slice(0 + offset, 16 + offset).forEach((chan, i) => {
    if (chan != 0x7f) {
      usbControls[i] = {
        channel: chan,
      };
    }
  });
  data.slice(16 + offset, 32 + offset).forEach((cc, i) => {
    if (cc != 0x7f) {
      usbControls[i].cc = cc;
    }
  });

  data.slice(32 + offset, 48 + offset).forEach((chan, i) => {
    if (chan != 0x7f) {
      trsControls[i] = {
        channel: chan,
      };
    }
  });

  data.slice(48 + offset, 64 + offset).forEach((cc, i) => {
    if (cc != 0x7f) {
      trsControls[i].cc = cc;
    }
  });

  return {
    ledOn,
    ledFlash,
    controllerFlip,
    midiThru,
    usbControls,
    trsControls,
    deviceId,
    firmwareVersion,
  } as ControllerConfiguration;
};

export const toSysexArray = (
  config: ControllerConfiguration,
  device: Device,
): number[] => {
  // TODO: Implement 8mu-specific serialization
  // This is, again. WIP

  const array = Array.from({ length: 84 }, () => 0);
  const versionArray = parseFirmwareVersion(config.firmwareVersion);

  array[0] = config.deviceId;
  array[1] = versionArray[0];
  array[2] = versionArray[1];
  array[3] = versionArray[2];

  // array[4] = config.ledOn ? 1 : 0;
  // array[5] = config.ledFlash ? 1 : 0;
  // array[6] = config.controllerFlip ? 1 : 0;

  // array[7] = config.i2cLeader ? 1 : 0;

  // const [faderMinLSB, faderMinMSB] = split14Bit(config.faderMin);
  // array[8] = faderMinLSB;
  // array[9] = faderMinMSB;

  // const [faderMaxLSB, faderMaxMSB] = split14Bit(config.faderMax);
  // array[10] = faderMaxLSB;
  // array[11] = faderMaxMSB;

  // array[12] = config.midiThru ? 1 : 0;

  const usbChannelOffset = 4;
  const trsChannelOffset = 36;
  const usbControlOffset = 20;
  const trsControlOffset = 68;

  config.usbControls.forEach((control, index) => {
    array[index + usbChannelOffset] = control.channel;
    array[index + usbControlOffset] = control.cc;
  });
  config.trsControls.forEach((control, index) => {
    array[index + trsChannelOffset] = control.channel;
    array[index + trsControlOffset] = control.cc;
  });

  return array;
};
