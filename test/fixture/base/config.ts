export default {
  $meta: {
    name: "base",
    version: "1.0.0",
  },
  baseConfig: true,
  colors: {
    primary: "base_primary",
    text: "base_text",
  },
  array: ["b"],
  $env: {
    test: { baseEnvConfig: true },
  },
};
