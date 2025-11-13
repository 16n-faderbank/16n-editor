import { gte } from "semver";

import { logger } from "$lib/logger";
import allKnownDevices from "./devices.json";
import { getProcessorForDevice } from "$lib/config-processors";

import type {
  Control,
  ControllerConfiguration,
  Device,
  DeviceCapability,
} from "$lib/types";

export const isEquivalent = (
  configA: ControllerConfiguration,
  configB: ControllerConfiguration,
) => {
  let optionEquivalents =
    configA.ledOn == configB.ledOn &&
    configA.ledFlash == configB.ledFlash &&
    configA.ledFlashAccel == configB.ledFlashAccel &&
    configA.controllerFlip == configB.controllerFlip &&
    configA.midiThru == configB.midiThru &&
    configA.trsMode == configB.trsMode;

  if ("i2cLeader" in configA || "i2cLeader" in configB) {
    optionEquivalents =
      optionEquivalents && configA.i2cLeader == configB.i2cLeader;
  }

  if ("faderMax" in configA || "faderMax" in configB) {
    optionEquivalents =
      optionEquivalents &&
      configA.faderMax == configB.faderMax &&
      configA.faderMin == configB.faderMin;
  }

  let usbEquivalent = true;
  let trsEquivalent = true;

  configA.usbControls.forEach((control: Control, i: number) => {
    const otherControl = configB.usbControls[i];
    if (
      control.channel != otherControl.channel ||
      control.cc != otherControl.cc ||
      control.highResolution != otherControl.highResolution
    ) {
      usbEquivalent = false;
    }
  });

  configA.trsControls.forEach((control: Control, i: number) => {
    const otherControl = configB.trsControls[i];
    if (
      control.channel != otherControl.channel ||
      control.cc != otherControl.cc ||
      control.highResolution != otherControl.highResolution
    ) {
      trsEquivalent = false;
    }
  });

  return optionEquivalents && usbEquivalent && trsEquivalent;
};

export const toSysexArray = (config: ControllerConfiguration) => {
  const device = deviceForId(config.deviceId);
  const processor = getProcessorForDevice(device);
  return processor.toSysexArray(config, device);
};

export const toDeviceOptionsSysexArray = (config: ControllerConfiguration) => {
  return toSysexArray(config).slice(4, 20);
};

export const toUSBOptionsSysexArray = (config: ControllerConfiguration) => {
  const fullArray = toSysexArray(config);
  const channels = fullArray.slice(20, 36);
  const ccs = fullArray.slice(52, 68);
  return channels.concat(ccs);
};

export const toTRSOptionsSysexArray = (config: ControllerConfiguration) => {
  const fullArray = toSysexArray(config);
  const channels = fullArray.slice(36, 52);
  const ccs = fullArray.slice(68, 84);
  return channels.concat(ccs);
};

export const configToJsonString = (config: ControllerConfiguration) => {
  const o = { ...config };
  // truncate all controllers to length $length;
  const controllerCount = deviceForId(config.deviceId).controlCount;

  o.usbControls = o.usbControls.splice(0, controllerCount);
  o.usbControls.forEach((c) => delete c.val);

  o.trsControls = o.trsControls.splice(0, controllerCount);

  return JSON.stringify(o, null, 2);
};

export const isConfigForDevice = (
  config: ControllerConfiguration,
  json: ControllerConfiguration,
) => {
  if (json.deviceId != config.deviceId) {
    return `Cannot update - this data file is for a ${
      deviceForId(json.deviceId).name
    }, but you are trying to install it on a ${
      deviceForId(config.deviceId).name
    } `;
  }

  // if(json.firmwareVersion != config.firmwareVersion) {
  //   return(`Cannot update - this data file is for firmware version ${json.firmwareVersion}, but you are trying to install it on a device running firmware version ${config.firmwareVersion}`);
  // }

  return false;
};

export const updateFromJson = (
  config: ControllerConfiguration,
  json: ControllerConfiguration,
) => {
  Object.keys(json).forEach((key) => {
    config[key] = json[key];
  });

  return config;
};

export const configFromSysexArray = (data: number[]) => {
  logger("Generating config from", data);

  const deviceId = data[5];
  const firmwareVersion = data[6] + "." + data[7] + "." + data[8];
  const device = deviceForId(deviceId);

  const processor = getProcessorForDevice(device);
  return processor.configFromSysexArray(
    data,
    device,
    deviceId,
    firmwareVersion,
  );
};

export const deviceForId = (id: number) => allKnownDevices[id];

export const deviceHasCapability = (
  device: Device,
  capability: DeviceCapability,
  firmwareVersion: string,
) => {
  if (!device) return;
  if (!device.capabilities[capability]) {
    return false;
  }

  if (device.capabilities[capability] === true) {
    return true;
  }

  return gte(firmwareVersion, device.capabilities[capability]);
};

export const labelForControl = (device: Device, controlIndex: number) => {
  if (!device.controlLabels) {
    return `Control ${controlIndex + 1}`;
  }

  return device.controlLabels[controlIndex] || `${controlIndex + 1}`;
};

export const labelForButtonControl = (device: Device, controlIndex: number) => {
  if (!device.buttonControlLabels) {
    return `Button ${controlIndex + 1}`;
  }

  return (
    device.buttonControlLabels[controlIndex] || `Button ${controlIndex + 1}`
  );
};
