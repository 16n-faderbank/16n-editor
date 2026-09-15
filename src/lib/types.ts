export type Control = {
  channel: number;
  cc: number;
  val?: number;
  msb?: number;
  lsb: number;
  highResolution?: boolean;
};

export type ButtonControl = {
  channel: number;
  mode: number;
  paramA: number;
  paramB: number;
  pressed: boolean;
};

export type ControllerConfiguration = {
  ledOn?: boolean;
  ledFlash: boolean;
  ledFlashAccel?: boolean;
  controllerFlip: boolean;
  midiThru: boolean;
  deviceId: number;
  i2cLeader?: boolean;
  faderMin?: number;
  faderMax?: number;
  trsMode?: number;
  firmwareVersion: string;
  usbControls: Control[];
  trsControls: Control[];
  usbButtonControls?: ButtonControl[];
  trsButtonControls?: ButtonControl[];
  usbHighResolution?: boolean[];
  trsHighResolution?: boolean[];
};

export type DeviceCapability =
  | "led"
  | "8muLed"
  | "midiThru"
  | "softwareTrsToggle"
  | "i2c"
  | "faderCalibration"
  | "highResolution"
  | "banks";

export type Device = {
  name: string;
  controlCount: number;
  buttonCount?: number;
  capabilities: Partial<Record<DeviceCapability, string | boolean | number>>;
  sendShortMessages?: boolean;
  latestFirmwareVersion?: string;
  firmwareUrl?: string;
  controlLabels?: string[];
  buttonControlLabels?: string[];
};
