import type { Kazuya, KazuyaOptions } from "kazuya";

import type { DotenvOptions } from "./dotenv";

export interface ConfigLayerMeta {
  name?: string;
  [key: string]: any;
}

export type UserInputConfig = Record<string, any>;

export interface C12InputConfig<
  T extends UserInputConfig = UserInputConfig,
  MT extends ConfigLayerMeta = ConfigLayerMeta,
> {
  $test?: T;
  $development?: T;
  $production?: T;
  $env?: Record<string, T>;
  $meta?: MT;
}

export type InputConfig<
  T extends UserInputConfig = UserInputConfig,
  MT extends ConfigLayerMeta = ConfigLayerMeta,
> = C12InputConfig<T, MT> & T;

export interface SourceOptions<
  T extends UserInputConfig = UserInputConfig,
  MT extends ConfigLayerMeta = ConfigLayerMeta,
> {
  meta?: MT;
  overrides?: T;
  [key: string]: any;
}

export interface ConfigLayer<
  T extends UserInputConfig = UserInputConfig,
  MT extends ConfigLayerMeta = ConfigLayerMeta,
> {
  config: T | null;
  source?: string;
  sourceOptions?: SourceOptions<T, MT>;
  meta?: MT;
  cwd?: string;
  configFile?: string;
}

export interface ResolvedConfig<
  T extends UserInputConfig = UserInputConfig,
  MT extends ConfigLayerMeta = ConfigLayerMeta,
> extends ConfigLayer<T, MT> {
  layers?: ConfigLayer<T, MT>[];
  cwd?: string;
}

export interface LoadConfigOptions<
  T extends UserInputConfig = UserInputConfig,
  MT extends ConfigLayerMeta = ConfigLayerMeta,
> {
  name?: string;
  cwd?: string;

  configFile?: string;

  rcFile?: false | string;
  globalRc?: boolean;

  dotenv?: boolean | DotenvOptions;

  envName?: string | false;

  packageJson?: boolean | string | string[];

  defaults?: T;
  defaultConfig?: T;
  overrides?: T;

  resolve?: (
    id: string,
    options: LoadConfigOptions<T, MT>,
  ) =>
    | null
    | undefined
    | ResolvedConfig<T, MT>
    | Promise<ResolvedConfig<T, MT> | undefined | null>;

  kazuya?: Kazuya;
  kazuyaOptions?: KazuyaOptions;

  extend?:
    | false
    | {
        extendKey?: string | string[];
      };
}

export type DefineConfig<
  T extends UserInputConfig = UserInputConfig,
  MT extends ConfigLayerMeta = ConfigLayerMeta,
> = (input: InputConfig<T, MT>) => InputConfig<T, MT>;

export const createDefineConfig =
  <
    T extends UserInputConfig = UserInputConfig,
    MT extends ConfigLayerMeta = ConfigLayerMeta,
  >(): DefineConfig<T, MT> =>
  (input: InputConfig<T, MT>) =>
    input;
