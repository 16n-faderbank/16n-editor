# Config Processors

This directory contains device-specific configuration processors for parsing and serializing device configurations from/to sysex data.

## Architecture

The config processor system uses a **functional approach** with device-specific modules, rather than classes. Each device family has its own processor module that exports two main functions:

- `configFromSysexArray(data, device, deviceId, firmwareVersion)` - Parse sysex into a `ControllerConfiguration` object
- `toSysexArray(config, device)` - Serialize a `ControllerConfiguration` into a sysex array

## Files

### `index.ts`

- Exports the `ConfigProcessor` interface
- Contains the processor registry mapping device names to processors
- Provides `getProcessorForDevice()` to select the appropriate processor

### `shared.ts`

- Common utility functions used across multiple processors
- High-resolution config packing/unpacking
- 14-bit value splitting/combining
- Firmware version parsing

### `16n.ts`

- Config processor for 16n-family devices: 16n, 16n (LC), 16nx, 16rx
- Also used by Oxion development board
- Handles the standard 16n sysex protocol with optional high-resolution support

### `8mu.ts`

- Config processor stub for 8mu2040 devices
- Currently throws errors - needs implementation based on 8mu2040 sysex format

## Adding a New Device Processor

1. Create a new file `src/lib/config-processors/your-device.ts`
2. Export `configFromSysexArray()` and `toSysexArray()` functions matching the `ConfigProcessor` interface
3. Use shared utilities from `shared.ts` where applicable
4. Register your processor in `index.ts` by adding entries to the `processorRegistry` object

## Usage

The processor system is automatically used by `src/lib/configuration.ts`:

```typescript
import { getProcessorForDevice } from "$lib/config-processors";

// When parsing sysex
const device = deviceForId(deviceId);
const processor = getProcessorForDevice(device);
const config = processor.configFromSysexArray(
  data,
  device,
  deviceId,
  firmwareVersion,
);

// When serializing to sysex
const device = deviceForId(config.deviceId);
const processor = getProcessorForDevice(device);
const sysexArray = processor.toSysexArray(config, device);
```

You don't need to manually select processors elsewhere in the codebase - the existing `toSysexArray()` and `configFromSysexArray()` functions in `configuration.ts` handle this automatically.
