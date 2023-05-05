export default {
  theme: "./theme",
  extends: [["c12-npm-test", { userMeta: 123 }]],
  $test: {
    extends: ["./config.dev"],
    envConfig: true,
  },
  colors: {
    primary: "user_primary",
  },
  configFile: true,
  overriden: false,
  // foo: "bar",
  // x: "123",
  array: ["a"],
};
