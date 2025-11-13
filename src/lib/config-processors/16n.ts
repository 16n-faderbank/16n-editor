import type { Control, ControllerConfiguration, Device } from "$lib/types";
import { deviceHasCapability } from "$lib/configuration";
import {
  unpackHiresConfig,
  packHiresConfig,
  split14Bit,
  combine14Bit,
  parseFirmwareVersion,
} from "./shared";

/**
 * Config processor for 16n-family devices
 * (16n, 16n LC, 16nx, 16rx)
 */

export const configFromSysexArray = (
  data: number[],
  device: Device,
  deviceId: number,
  firmwareVersion: string,
): ControllerConfiguration => {
  const offset = 8;

  const ledOn = data[1 + offset] == 1;
  const ledFlash = data[2 + offset] == 1;
  const controllerFlip = data[3 + offset] == 1;

  const i2cLeader = data[4 + offset] == 1;

  const faderMin = combine14Bit(data[5 + offset], data[6 + offset]);
  const faderMax = combine14Bit(data[7 + offset], data[8 + offset]);

  const midiThru = data[9 + offset] == 1;

  const usbControls: Partial<Control>[] = [];
  const trsControls: Partial<Control>[] = [];

  data.slice(17 + offset, 33 + offset).forEach((chan, i) => {
    if (chan != 0x7f) {
      usbControls[i] = {
        channel: chan,
      };
    }
  });

  data.slice(33 + offset, 49 + offset).forEach((chan, i) => {
    if (chan != 0x7f) {
      trsControls[i] = {
        channel: chan,
      };
    }
  });

  data.slice(49 + offset, 65 + offset).forEach((cc, i) => {
    if (cc != 0x7f) {
      usbControls[i].cc = cc;
    }
  });

  data.slice(65 + offset, 81 + offset).forEach((cc, i) => {
    if (cc != 0x7f) {
      trsControls[i].cc = cc;
    }
  });

  usbControls.forEach((c) => (c.val = 0));

  let usbHighResolution = Array.from(Array(16)).map(() => false);
  let trsHighResolution = Array.from(Array(16)).map(() => false);

  if (
    device &&
    deviceHasCapability(device, "highResolution", firmwareVersion)
  ) {
    const usbHiresConfig = data.slice(81 + offset, 84 + offset);
    usbHighResolution = unpackHiresConfig(usbHiresConfig);

    usbControls.forEach((control, i) => {
      control.highResolution = usbHighResolution[i];
    });

    const trsHiresConfig = data.slice(84 + offset, 87 + offset);
    trsHighResolution = unpackHiresConfig(trsHiresConfig);

    trsControls.forEach((control, i) => {
      control.highResolution = trsHighResolution[i];
    });
  }

  return {
    ledOn,
    ledFlash,
    controllerFlip,
    midiThru,
    usbControls,
    trsControls,
    deviceId,
    firmwareVersion,
    i2cLeader,
    faderMin,
    faderMax,
    usbHighResolution,
    trsHighResolution,
  } as ControllerConfiguration;
};

export const toSysexArray = (
  config: ControllerConfiguration,
  device: Device,
): number[] => {
  const array = Array.from({ length: 84 }, () => 0);
  const versionArray = parseFirmwareVersion(config.firmwareVersion);

  array[0] = config.deviceId;
  array[1] = versionArray[0];
  array[2] = versionArray[1];
  array[3] = versionArray[2];

  array[4] = config.ledOn ? 1 : 0;
  array[5] = config.ledFlash ? 1 : 0;
  array[6] = config.controllerFlip ? 1 : 0;

  array[7] = config.i2cLeader ? 1 : 0;

  const [faderMinLSB, faderMinMSB] = split14Bit(config.faderMin);
  array[8] = faderMinLSB;
  array[9] = faderMinMSB;

  const [faderMaxLSB, faderMaxMSB] = split14Bit(config.faderMax);
  array[10] = faderMaxLSB;
  array[11] = faderMaxMSB;

  array[12] = config.midiThru ? 1 : 0;

  const usbChannelOffset = 20;
  const trsChannelOffset = 36;
  const usbControlOffset = 52;
  const trsControlOffset = 68;

  config.usbControls.forEach((control, index) => {
    array[index + usbChannelOffset] = control.channel;
    array[index + usbControlOffset] = control.cc;
  });
  config.trsControls.forEach((control, index) => {
    array[index + trsChannelOffset] = control.channel;
    array[index + trsControlOffset] = control.cc;
  });

  // if you support high-res, we can actually append this to the end of an array;
  if (deviceHasCapability(device, "highResolution", versionArray.join("."))) {
    const usbHighResOffset = 84;
    const trsHighResOffset = 87;

    const usbHighresData = packHiresConfig(config.usbControls);
    const trsHighresData = packHiresConfig(config.trsControls);

    usbHighresData.forEach((d, index) => {
      array[usbHighResOffset + index] = usbHighresData[index];
    });

    trsHighresData.forEach((d, index) => {
      array[trsHighResOffset + index] = trsHighresData[index];
    });
  }

  return array;
};
