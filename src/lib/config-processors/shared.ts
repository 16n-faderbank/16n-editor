import type { Control } from "$lib/types";

/**
 * Shared utilities for config processors
 */

/**
 * Unpacks high-resolution configuration from 3 bytes into 16 boolean flags
 * Used by 16n-family devices
 */
export const unpackHiresConfig = (hiresConfig: number[]): boolean[] => {
  let numericValue = 0;
  for (let i = 0; i < 3; i++) {
    const mask = i == 2 ? 0x03 : 0x7f;
    numericValue |= (hiresConfig[i] & mask) << (7 * i);
  }

  const booleanResult: boolean[] = [];
  for (let i = 0; i < 16; i++) {
    booleanResult.push((numericValue & (1 << i)) !== 0);
  }

  return booleanResult;
};

/**
 * Packs high-resolution flags from controls into 3 bytes
 * Used by 16n-family devices
 */
export const packHiresConfig = (controls: Control[]): number[] => {
  let value = 0;
  controls.forEach((control, i) => {
    if (control.highResolution) {
      value |= 1 << i;
    }
  });

  return [value & 0x7f, (value >> 7) & 0x7f, (value >> 14) & 0x03];
};

/**
 * Splits a 14-bit value into MSB and LSB (7-bit each)
 */
export const split14Bit = (value: number): [number, number] => {
  const msb = value >> 7;
  const lsb = value - (msb << 7);
  return [lsb, msb];
};

/**
 * Combines MSB and LSB into a 14-bit value
 */
export const combine14Bit = (lsb: number, msb: number): number => {
  return (msb << 7) + lsb;
};

/**
 * Parses firmware version string into array of numbers
 */
export const parseFirmwareVersion = (versionString: string): number[] => {
  return versionString
    .trim()
    .split(".")
    .map((n) => parseInt(n));
};
