import type { ControllerConfiguration } from "$lib/types";

export const configuration = $state({
  current: null as ControllerConfiguration | null,
  controllerMightNeedFactoryReset: false,
  editing: null as ControllerConfiguration | null,
  editMode: false,
  currentBank: 0 as number,
});
