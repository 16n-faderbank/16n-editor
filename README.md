# 16n editor

The 16n editor allows you to edit the configuration of your 16n from within a web browser. It supports 16ns running firmware **2.0.0** and up.

The 16n editor is a Javascript app based around [SvelteKit](sk).

Here's a video walkthrough:

[![You can view a video overview of the editor functionality here.](https://img.youtube.com/vi/3n2_3b55qWY/0.jpg)](https://youtu.be/3n2_3b55qWY)

Version 2.0.0 of the editor is a large overhaul, with a few goals:

- bring the codebase up-to-date with SvelteKit 1.x
- replace Javascript with Typescript throughout
- replace unpleasant attempts at object-orientation with a more ECMAScript-like code style, focused on modules exporting functions and POJOs.
- replace confusing (an understatement) message-passing, and focus on a more SvelteKit like way of doing things: put functions into the modules or components calling them, directly manipulate stores, and assume stores are a global store of truth.

The result is a little more readable by most JS developers, and we gain a lot of convenience as well as belt/braces security from the move to Typescript.

## Build Requirements

- Node.js v22+ (LTS)
- pnpm (preferred for performance, storage reasons.)

## Usage Requirements

- As a WebMIDI app, you need a client that can support it. That basically means Chrome right now.
- A 16n running firmware v2.0.0 or higher, or a 16nx running firmware v3.0.0 or higher

## Installation

    pnpm install

## Configuration

Note that `package.json` contains a `config` object that lets us specify the latest version of the firmware, thus triggering a prompt to update. This should be set to the latest version of the firmware.

## Running the development environment

    pnpm run dev

This will run a development environment at `localhost:5173`, with live reloading enabled.

By default, the server will only respond to requests from localhost.

## Building and running in production mode

To create an optimised version of the app:

    pnpm run build

This will emit a production build, as a purely static site, to `build/`. You can run this version of the code with `pnpm run preview`.

## Deployment

The built site (in `/build`) is copied over to the 16n repository and deployed from there.

## Code formatting

We use `prettier` for code formatting. From your local directory:

    pnpm run format

will prettify the `src/` directory. Code that fails Prettier's formatting standards will block merge at Github.

We're using a similar approach to [the one Simon Willison describes here](https://til.simonwillison.net/github-actions/prettier-github-actions).

Code linting is handled with ESLint, and code must meet the Prettier formatting standards in order to lint:

    pnpm run lint

## Project Structure

- the main page of the site is `src/routes/+page.svelte`. This performs basic WebMidi setup and hosts the two main "modes" of the site, represented as components `src/routes/Viewing.svelte` and `src/routes/Editing.svelte`. (These are stored within the 'route' directory as they're more like pages - supercomponents - than traditional Svelte components)
- `src/lib/components` contains all components; these are all UI elements. In general, they will reach out directly to any stores they need to address.
- `src/lib/configuration.ts` is a module exporting a set of functions for parsing and processing configuration data - generating a configuration POJO from a sysex array, comparing two configuration POJOs to see if they are identical.
- `src/lib/import_export.ts` exports functions to request a user for a JSON file and load it as a config - and to take the current config and offer it as a downloadable file. (These functions are used by DOM element button components).
- `src/lib/logger.ts` is a convenience function to log items to the console in development mode.
- `src/lib/state` contains the various global reactive state objects that will be used throughout the application (see later)
- `src/lib/types.ts` exports custom types used within the application: notably, individual `Control` items, and an entire `ControllerConfiguration`
- `src/lib/midi/midi.ts` exports all the necessary functions to listen to MIDI ports as they connect/disconnect, request 16n configs from appropriate devices, and listen to individual events from the connected devices.
- `src/lib/midi/sysex.ts` exports all the necessary functions to send the various System Exclusive messages a 16n supports.

## State

We previously used Svelte Stores to store state and react to state change; as of Editor v2.1.0, we now use reactive state objects to do so.

`src/lib/state` contains two main `.svelte.ts` files for the two types of reactive data we want to know about: stuff to do with controller configuration, and stuff to do with MIDI I/O.

Inside the `configuration` stateful object, exported by `src/lib/state/configuration.svelte.ts`, there are a few key sub-objects:

- `configuration.current` describes the current Configuration being shown in Viewing mode.
- `configuration.controllerMightNeedFactoryReset` represents if the current 16n isn't quite configured right.
- `configuration.editing` is the current configuration being _edited_ in Editing mode.
- `configuration.editMode` is a boolean representing if the editor is in Editing mode or not.

Inside the `midiState` stateful object, exported by `src/lib/state/midi.svelte.ts`, are:

- `midiState.inputs` and `midiState.outputs` describes the currently connected MIDI input/output ports.
- `midiState.selectedInput` and `midiState.selectedOutput` represent the actual port that's used to talk to a 16n.
- `midiState.webMidiEnabled` is a boolean representing if the current browser supports WebMidi.

Reactive state can be used both in Svelte components and in `.svelte.ts` files.

## Icons

Icons are from [FontAwesome](https://fontawesome.com/license/free). FA Code is MIT licensed; font files are licensed under the SIL Open Font License.

## Licensing

Editor code, like the rest of 16n sourcecode, is released under the MIT License; see `LICENSE` for more details.

[sk]: https://kit.svelte.dev
