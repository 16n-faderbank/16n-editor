import {
  configToJsonString,
  deviceForId,
  isConfigForDevice,
  isEquivalent,
  updateFromJson,
} from "$lib/configuration.js";
import { configuration } from "./state/configuration.svelte";
import type { ControllerConfiguration } from "$lib/types";

export const importConfig = (
  currentEditConfig: ControllerConfiguration,
  currentConfig: ControllerConfiguration,
) => {
  const fileInputNode = document.createElement("input");
  fileInputNode.type = "file";
  fileInputNode.id = "uploadedConfig";

  fileInputNode.addEventListener("change", (e: Event) => {
    const files = (e.target as HTMLInputElement).files;

    if (files && files.length > 0) {
      const newConfig = files[0];
      const reader = new FileReader();

      reader.addEventListener("load", () => {
        const newConfigData = JSON.parse(reader.result as string);
        const invalidConfig = isConfigForDevice(
          currentEditConfig,
          newConfigData,
        );

        if (invalidConfig) {
          alert(invalidConfig);
          return;
        } else {
          configuration.editing = updateFromJson(
            currentEditConfig,
            newConfigData,
          );
          if (isEquivalent(currentEditConfig, currentConfig)) {
            alert(
              "Imported configuration is identical to currently loaded configuration; no changes to upload.",
            );
          } else {
            alert(
              "New configuration imported. Choose 'update controller' to import, or 'Cancel' to abort",
            );
          }
        }
      });

      reader.readAsText(newConfig);
    }
  });

  fileInputNode.click();

  fileInputNode.remove();
};

export const exportConfig = (configObject: ControllerConfiguration) => {
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(configToJsonString(configObject));

  const downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.href = dataStr;
  downloadAnchorNode.download = `${
    deviceForId(configObject.deviceId).name
  }_controller_config.json`;
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};
