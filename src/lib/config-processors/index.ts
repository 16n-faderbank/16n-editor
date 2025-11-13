import type { ControllerConfiguration, Device } from "$lib/types";
import * as processor16n from "./16n";
import * as processor8mu from "./8mu";

/**
 * Config processor interface
 */
export interface ConfigProcessor {
  configFromSysexArray: (
    data: number[],
    device: Device,
    deviceId: number,
    firmwareVersion: string,
  ) => ControllerConfiguration;

  toSysexArray: (
    config: ControllerConfiguration,
    device: Device,
  ) => number[];
}

/**
 * Maps device names to their config processors
 */
const processorRegistry: Record<string, ConfigProcessor> = {
  "16n": processor16n,
  "16n (LC)": processor16n,
  "16nx": processor16n,
  "16rx": processor16n,
  "8mu2040": processor8mu,
  "Oxion development board": processor16n, // Uses 16n-style protocol
};

/**
 * Gets the appropriate config processor for a device
 * Falls back to 16n processor as default
 */
export const getProcessorForDevice = (device: Device): ConfigProcessor => {
  return processorRegistry[device.name] || processor16n;
};
