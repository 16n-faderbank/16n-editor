import type { ControllerConfiguration } from "$lib/types";

export const configuration = $state({
  current: null as ControllerConfiguration | null,
  deviceName: null as string | null,
  unsupportedDevice: null as {
    name: "8mu v1";
    firmwareVersion: string;
  } | null,
  controllerMightNeedFactoryReset: false,
  editing: null as ControllerConfiguration | null,
  editMode: false,
  currentBank: 0 as number,
});
