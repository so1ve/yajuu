# yajuu

[![NPM version](https://img.shields.io/npm/v/yajuu?color=a1b858&label=)](https://www.npmjs.com/package/yajuu)

Yajuu Configuration Loader

## Features

- JSON, CJS, Typescript, and ESM config loader with [so1ve/kazuya](https://github.com/so1ve/kazuya)
- RC config support with [unjs/rc9](https://github.com/unjs/rc9)
- Multiple sources merged with [unjs/defu](https://github.com/unjs/defu)
- `.env` support with [dotenv](https://www.npmjs.com/package/dotenv)
- Reads config from the nearest `package.json` file
- [Extends configurations](https://github.com/so1ve/yajuu#extending-configuration) from multiple local or git sources
- Overwrite with [environment-specific configuration](#environment-specific-configuration)
- Config watcher with auto-reload and HMR support

## Usage

Install package:

```sh
# npm
npm install yajuu

# yarn
yarn add yajuu

# pnpm
pnpm install yajuu
```

Import:

```js
// ESM
import { loadConfig, watchConfig } from "yajuu";
```

Load configuration:

```js
// Get loaded config
const { config } = await loadConfig({});

// Get resolved config and extended layers
const { config, configFile, layers } = await loadConfig({});
```

## Loading priority

yajuu merged config sources with [unjs/defu](https://github.com/unjs/defu) by below order:

1. Config overrides passed by options
2. Config file in CWD
3. RC file in CWD
4. Global RC file in the user's home directory
5. Config from `package.json`
6. Default config passed by options
7. Extended config layers

## Options

### `cwd`

Resolve configuration from this working directory. The default is `process.cwd()`

### `name`

Configuration base name. The default is `config`.

### `configName`

Configuration file name without extension. Default is generated from `name` (name=foo => `foo.config`).

Set to `false` to avoid loading the config file.

### `rcFile`

RC Config file name. Default is generated from `name` (name=foo => `.foorc`).

Set to `false` to disable loading RC config.

### `globalRC`

Load RC config from the workspace directory and the user's home directory. Only enabled when `rcFile` is provided. Set to `false` to disable this functionality.

### `dotenv`

Loads `.env` file if enabled. It is disabled by default.

### `packageJson`

Loads config from nearest `package.json` file. It is disabled by default.

If `true` value is passed, yajuu uses `name` field from `package.json`.

You can also pass either a string or an array of strings as a value to use those fields.

### `defaults`

Specify default configuration. It has the **lowest** priority and is applied **after extending** config.

### `defaultConfig`

Specify default configuration. It is applied **before** extending config.

### `overrides`

Specify override configuration. It has the **highest** priority and is applied **before extending** config.

### `kazuya`

Custom [so1ve/kazuya](https://github.com/so1ve/kazuya) instance used to import configuration files.

### `kazuyaOptions`

Custom [so1ve/kazuya](https://github.com/so1ve/kazuya) options to import configuration files.

### `envName`

Environment name used for [environment specific configuration](#environment-specific-configuration).

The default is `process.env.NODE_ENV`. You can set `envName` to `false` or an empty string to disable the feature.

## Extending configuration

If resolved config contains a `extends` key, it will be used to extend the configuration.

Extending can be nested and each layer can extend from one base or more.

The final config is merged result of extended options and user options with [unjs/defu](https://github.com/unjs/defu).

Each item in extends is a string that can be either an absolute or relative path to the current config file pointing to a config file for extending or the directory containing the config file.
If it starts with either `github:`, `gitlab:`, `bitbucket:`, or `https:`, yajuu automatically clones it.

For custom merging strategies, you can directly access each layer with `layers` property.

**Example:**

```js
// config.ts
export default {
  colors: {
    primary: "user_primary",
  },
  extends: ["./theme"],
};
```

```js
// config.dev.ts
export default {
  dev: true,
};
```

```js
// theme/config.ts
export default {
  extends: "../base",
  colors: {
    primary: "theme_primary",
    secondary: "theme_secondary",
  },
};
```

```js
// base/config.ts
export default {
  colors: {
    primary: "base_primary",
    text: "base_text",
  },
};
```

The loaded configuration would look like this:

```ts
const config = {
  dev: true,
  colors: {
    primary: "user_primary",
    secondary: "theme_secondary",
    text: "base_text",
  },
};
```

Layers:

```js
```

## Environment-specific configuration

Users can define environment-specific configuration using these config keys:

- `$test: {...}`
- `$development: {...}`
- `$production: {...}`
- `$env: { [env]: {...} }`

yajuu tries to match [`envName`](#envname) and override environment config if specified.

**Note:** Environment will be applied when extending each configuration layer. This way layers can provide environment-specific configuration.

**Example:**

```
{
  // Default configuration
  logLevel: 'info',

  // Environment overrides
  $test: { logLevel: 'silent' },
  $development: { logLevel: 'warning' },
  $production: { logLevel: 'error' },
  $env: {
    staging: { logLevel: 'debug' }
  }
}
```

## Watching Configuration

you can use `watchConfig` instead of `loadConfig` to load config and watch for changes, add and removals in all expected configuration paths and auto reload with new config.

### Lifecycle hooks

- `onWatch`: This function is always called when config is updated, added, or removed before attempting to reload the config.
- `acceptHMR`: By implementing this function, you can compare old and new functions and return `true` if a full reload is not needed.
- `onUpdate`: This function is always called after the new config is updated. If `acceptHMR` returns true, it will be skipped.

```ts
import { watchConfig } from "yajuu";

const config = watchConfig({
  cwd: ".",
  // chokidarOptions: {}, // Default is { ignoreInitial: true }
  // debounce: 200 // Default is 100. You can set it to false to disable debounced watcher
  onWatch: (event) => {
    console.log("[watcher]", event.type, event.path);
  },
  acceptHMR({ oldConfig, newConfig, getDiff }) {
    const diff = getDiff();
    if (diff.length === 0) {
      console.log("No config changed detected!");
      return true; // No changes!
    }
  },
  onUpdate({ oldConfig, newConfig, getDiff }) {
    const diff = getDiff();
    console.log(`Config updated:\n${diff.map((i) => i.toJSON()).join("\n")}`);
  },
});

console.log("watching config files:", config.watchingFiles);
console.log("initial config", config.config);

// Stop watcher when not needed anymore
// await config.unwatch();
```

## 💻 Development

- Clone this repository
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable` (use `npm i -g corepack` for Node.js < 16.10)
- Install dependencies using `pnpm install`
- Run interactive tests using `pnpm dev`

## 📝 License

[MIT](./LICENSE). Made with ❤️ by [Ray](https://github.com/so1ve)
