# 16n editor

The 16n editor allows you to edit the configuration of your 16n from within a web browser. It supports 16ns running firmware **2.0.0** and up.

The 16n editor is a Javascript app based around [SvelteKit](sk).

Version 2.0.0 of the editor is a large overhaul, with a few goals:

* bring everything up to SvelteKit 1.x
* replace Javascript with Typescript throughout
* replace unpleasant attempts at object-orientation with a more ECMAScript-like code style, focused on modules exporting functions and POJOs.
* replace confusing (an understatement) message-passing, and focus on a more SvelteKit like way of doing things: put functions into the modules or components calling them, directly manipulate stores, and assume stores are a global store of truth.

The result is a little more readable by most JS developers, and we gain a lot of convenience as well as belt/braces security from the move to Typescript.

## Build Requirements

- Node.js v16+

## Usage Requirements

- As a WebMIDI app, you need a client that can support it. That basically means Chrome right now.
- A 16n running firmware v2.0.0 or higher.

## Installation

    npm install

## Configuration

Note that `package.json` contains a `config` object that lets us specify the latest version of the firmware, thus triggering a prompt to update. This should be set to the latest version of the firmware.

## Running the development environment

    npm run dev

This will run a development environment at `localhost:5173`, with live reloading enabled.

By default, the server will only respond to requests from localhost.

## Building and running in production mode

To create an optimised version of the app:

    npm run build

This will emit a production build, as a purely static site, to `build/`. You can run this version of the code with `npm run preview`.

## Code formatting

We use `prettier` for code formatting. From your local directory:

    npm run format

will prettify the `src/` directory. Code that fails Prettier's formatting standards will block merge at Github.

We're using a similar approach to [the one Simon Willison describes here](https://til.simonwillison.net/github-actions/prettier-github-actions).

Code linting is handled with ESLint, and code must meet the Prettier formatting standards in order to lint:

    npm run lint

## Project Structure

TODO: this is no longer true, please update it.

- `src/App.Svelte` is quite dense, but is the main entrypoint for the application and contains the app's structure.
- `src/components` contains all components. Primarily UI, but `MidiContext` serves to wrap WebMidi and keep the various stores that describe the available Midi interfaces up-to-date.
- `src/Configuration.js` describes a class `ConfigurationObject`, that represents a single instance of a 16n configuration. These are what are passed around, diffed to work out if config has changed, and converted to Sysex to send to the device.
- `src/ImportExport.js` handles converting a Configuration to JSON, and back again.
- `src/OxionMidi.js` is some convenience classes for MIDI.

## Deployment

The built site is copied over to the 16n repository and deployed from there.

## Icons

Icons are from [FontAwesome](https://fontawesome.com/license/free). FA Code is MIT licensed; font files are licensed under the SIL Open Font License.

## Licensing

Editor code, like the rest of 16n sourcecode, is released under the MIT License; see `LICENSE` for more details.

[sk]: https://kit.svelte.dev
