module.exports = {
  rollup(config, options) {
    const { localDev, name } = options; // localDev can be whatever name you want
    if (localDev) {
      config.output.file = config.output.file.replace(
        'dist',
        `example/${name}`
      );
      return config;
    }
    return config;
  },
};
