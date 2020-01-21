const SCOPE = 'cabines';

module.exports = (config) => {
  const { env } = config.utils;

  return {
    cabines: {
      exampleVar: env.get('EXAMPLE_KEY', SCOPE),
    },
  };
};
