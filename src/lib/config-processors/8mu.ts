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
  let offset = 6 + 4 - 1;

  // TODO: these need to be dynamic
  const ledFlash = data[offset + 0] == 1;
  const ledFlashAccel = data[offset + 1] == 1;
  const controllerFlip = data[offset + 2] == 1;

  // const faderMin = combine14Bit(data[5 + offset], data[6 + offset]);
  // const faderMax = combine14Bit(data[7 + offset], data[8 + offset]);
  const faderMin = 0;
  const faderMax = 16383;

  const midiThru = data[offset + 7] == 1;
  const trsMode = data[offset + 8];

  const currentBank = data[offset + 15];
  console.log("Current bank:", currentBank);

  const usbControls: Partial<Control>[] = [];
  const trsControls: Partial<Control>[] = [];

  offset = 6 + 4 + 16 - 1; // skid Sysex header + device header

  data.slice(0 + offset, 16 + offset).forEach((chan, i) => {
    if (chan != 0x7f) {
      usbControls[i] = {
        channel: chan,
        val: 0,
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

  const usbButtonOffset = 64 + offset;
  const trsButtonOffset = 80 + offset;
  const usbButtonControls = [];
  const trsButtonControls = [];
  const buttonCount = device?.buttonCount || 0;

  for (let i = 0; i < buttonCount; i++) {
    const index = i * 4 + usbButtonOffset;
    const channel = data[index];
    const mode = data[index + 1];
    const paramA = data[index + 2];
    const paramB = data[index + 3];
    if (channel != 0x7f) {
      usbButtonControls.push({
        channel,
        mode,
        paramA,
        paramB,
        pressed: false,
      });
    }
  }

  for (let i = 0; i < buttonCount; i++) {
    const index = i * 4 + trsButtonOffset;
    const channel = data[index];
    const mode = data[index + 1];
    const paramA = data[index + 2];
    const paramB = data[index + 3];
    if (channel != 0x7f) {
      trsButtonControls.push({
        channel,
        mode,
        paramA,
        paramB,
      });
    }
  }

  return {
    ledFlash,
    ledFlashAccel,
    trsMode,
    controllerFlip,
    midiThru,
    usbControls,
    trsControls,
    faderMax,
    faderMin,
    usbButtonControls,
    trsButtonControls,
    deviceId,
    device,
    firmwareVersion,
    currentBank,
  } as ControllerConfiguration;
};

export const toSysexArray = (
  config: ControllerConfiguration,
  // device: Device,
): number[] => {
  const array = Array.from({ length: 4 + 16 + 96 }, () => 0);
  const versionArray = parseFirmwareVersion(config.firmwareVersion);

  array[0] = config.deviceId;
  array[1] = versionArray[0];
  array[2] = versionArray[1];
  array[3] = versionArray[2];

  const dataStart = 4;

  array[dataStart + 0] = config.ledFlash ? 1 : 0;
  // array[5] = config.ledFlash ? 1 : 0;
  array[dataStart + 1] = 0; // accel flash disable for now
  array[dataStart + 2] = config.controllerFlip ? 1 : 0;
  array[dataStart + 7] = config.midiThru ? 1 : 0;
  array[dataStart + 8] = config.trsMode ? 1 : 0;

  // const [faderMinLSB, faderMinMSB] = split14Bit(config.faderMin);
  // array[8] = faderMinLSB;
  // array[9] = faderMinMSB;

  // const [faderMaxLSB, faderMaxMSB] = split14Bit(config.faderMax);
  // array[10] = faderMaxLSB;
  // array[11] = faderMaxMSB;

  // index 15 is for currentBank. That's not inside `config`
  // however: it _should_ be both the currentbank on device and in editor _anyway_
  // so we don't need to transmit it back to the 8mu
  // array[dataStart+15] = config.currentBank

  const usbChannelOffset = dataStart + 16;
  const trsChannelOffset = dataStart + 32;
  const usbControlOffset = dataStart + 48;
  const trsControlOffset = dataStart + 64;

  config.usbControls.forEach((control, index) => {
    array[index + usbChannelOffset] = control.channel;
    array[index + usbControlOffset] = control.cc;
  });
  config.trsControls.forEach((control, index) => {
    array[index + trsChannelOffset] = control.channel;
    array[index + trsControlOffset] = control.cc;
  });

  const usbButtonOffset = dataStart + 80;
  const trsButtonOffset = dataStart + 96;

  config.usbButtonControls?.forEach((control, index) => {
    array[index * 4 + usbButtonOffset] = control.channel;
    array[index * 4 + usbButtonOffset + 1] = control.mode;
    array[index * 4 + usbButtonOffset + 2] = control.paramA;
    array[index * 4 + usbButtonOffset + 3] = control.paramB;
  });

  config.trsButtonControls?.forEach((control, index) => {
    array[index * 4 + trsButtonOffset] = control.channel;
    array[index * 4 + trsButtonOffset + 1] = control.mode;
    array[index * 4 + trsButtonOffset + 2] = control.paramA;
    array[index * 4 + trsButtonOffset + 3] = control.paramB;
  });

  return array;
};

export const currentBankFromSysexArray = (data: number[]) => data[24];
