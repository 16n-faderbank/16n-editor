export type Control = {
  channel: number;
  cc: number;
  val?: number;
  msb?: number;
  lsb: number;
  highResolution?: boolean;
};

export type ControllerConfiguration = {
  ledOn: boolean;
  ledFlash: boolean;
  controllerFlip: boolean;
  midiThru: boolean;
  deviceId: number;
  i2cLeader: boolean;
  faderMin: number;
  faderMax: number;
  firmwareVersion: string;
  usbControls: Control[];
  trsControls: Control[];
  usbHighResolution: boolean[];
  trsHighResolution: boolean[];
};

export type DeviceCapability =
  | "led"
  | "i2c"
  | "faderCalibration"
  | "highResolution";

export type Device = {
  name: string;
  controlCount: number;
  capabilities: Partial<Record<DeviceCapability, string | boolean>>;
  sendShortMessages?: boolean;
  latestFirmwareVersion?: string;
  firmwareUrl?: string;
};
