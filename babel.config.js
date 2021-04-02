module.exports = function (api) {
  api.cache(true);
  // const presets = ["@babel/preset-env",];
  const presets = [
    [
      '@babel/preset-env',
      {
        targets: {
          esmodules: true,
        },
      },
    ],
  ];
  const plugins = ["@babel/plugin-proposal-optional-chaining"];
  return { presets, plugins };
};