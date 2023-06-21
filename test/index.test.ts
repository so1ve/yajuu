import { fileURLToPath } from "node:url";

import { normalize } from "pathe";
import { describe, expect, it } from "vitest";

import { loadConfig } from "../src";

const r = (path: string) =>
  normalize(fileURLToPath(new URL(path, import.meta.url)));
const transformPaths = (object: object) =>
  JSON.parse(JSON.stringify(object).replaceAll(r("."), "<path>/"));

describe("yajuu", () => {
  it("load fixture config", async () => {
    type UserConfig = Partial<{
      virtual: boolean;
      overriden: boolean;
      defaultConfig: boolean;
      extends: string[];
    }>;
    const { config, layers } = await loadConfig<UserConfig>({
      cwd: r("./fixture"),
      dotenv: true,
      packageJson: ["yajuu", "yajuu-alt"],
      globalRc: true,
      envName: "test",
      extend: {
        extendKey: ["theme", "extends"],
      },
      resolve: (id) => {
        if (id === "virtual") {
          return { config: { virtual: true } };
        }
      },
      overrides: {
        overriden: true,
      },
      defaults: {
        defaultConfig: true,
      },
      defaultConfig: {
        extends: ["virtual"],
      },
    });

    expect(transformPaths(config!)).toMatchInlineSnapshot(`
      {
        "$env": {
          "test": {
            "baseEnvConfig": true,
          },
        },
        "$test": {
          "envConfig": true,
          "extends": [
            "./config.dev",
          ],
        },
        "array": [
          "a",
          "b",
        ],
        "baseConfig": true,
        "baseEnvConfig": true,
        "colors": {
          "primary": "user_primary",
          "secondary": "theme_secondary",
          "text": "base_text",
        },
        "configFile": true,
        "defaultConfig": true,
        "devConfig": true,
        "envConfig": true,
        "npmConfig": true,
        "overriden": true,
        "packageJSON": true,
        "packageJSON2": true,
        "rcFile": true,
        "virtual": true,
      }
    `);

    expect(transformPaths(layers!)).toMatchInlineSnapshot(`
      [
        {
          "config": {
            "overriden": true,
          },
        },
        {
          "config": {
            "$test": {
              "envConfig": true,
              "extends": [
                "./config.dev",
              ],
            },
            "array": [
              "a",
            ],
            "colors": {
              "primary": "user_primary",
            },
            "configFile": true,
            "envConfig": true,
            "extends": [
              "./config.dev",
              [
                "yajuu-npm-test",
                {
                  "userMeta": 123,
                },
              ],
            ],
            "overriden": false,
            "theme": "./theme",
          },
          "configFile": "config",
          "cwd": "<path>/fixture",
        },
        {
          "config": {
            "rcFile": true,
          },
          "configFile": ".configrc",
        },
        {
          "config": {
            "packageJSON": true,
            "packageJSON2": true,
          },
          "configFile": "package.json",
        },
        {
          "config": {
            "colors": {
              "primary": "theme_primary",
              "secondary": "theme_secondary",
            },
          },
          "configFile": "<path>/fixture/theme/config.ts",
          "cwd": "<path>/fixture/theme",
          "meta": {},
          "source": "config",
          "sourceOptions": {},
        },
        {
          "config": {
            "$env": {
              "test": {
                "baseEnvConfig": true,
              },
            },
            "array": [
              "b",
            ],
            "baseConfig": true,
            "baseEnvConfig": true,
            "colors": {
              "primary": "base_primary",
              "text": "base_text",
            },
          },
          "configFile": "<path>/fixture/base/config.ts",
          "cwd": "<path>/fixture/base",
          "meta": {
            "name": "base",
            "version": "1.0.0",
          },
          "source": "config",
          "sourceOptions": {},
        },
        {
          "config": {
            "devConfig": true,
          },
          "configFile": "<path>/fixture/config.dev.ts",
          "cwd": "<path>/fixture",
          "meta": {},
          "source": "./config.dev",
          "sourceOptions": {},
        },
        {
          "config": {
            "npmConfig": true,
          },
          "configFile": "<path>/fixture/node_modules/yajuu-npm-test/config.ts",
          "cwd": "<path>/fixture/node_modules/yajuu-npm-test",
          "meta": {},
          "source": "<path>/fixture/node_modules/yajuu-npm-test/config.ts",
          "sourceOptions": {
            "userMeta": 123,
          },
        },
        {
          "config": {
            "virtual": true,
          },
        },
      ]
    `);
  });

  it("extend from git repo", async () => {
    const { config } = await loadConfig({
      cwd: r("./fixture/new_dir"),
      overrides: {
        extends: ["github:so1ve/yajuu/test/fixture"],
      },
    });

    expect(transformPaths(config!)).toMatchInlineSnapshot(`
      {
        "$test": {
          "envConfig": true,
          "extends": [
            "./config.dev",
          ],
        },
        "array": [
          "a",
        ],
        "colors": {
          "primary": "user_primary",
        },
        "configFile": true,
        "devConfig": true,
        "envConfig": true,
        "npmConfig": true,
        "overriden": false,
        "theme": "./theme",
      }
    `);
  }, 200_000);
});
