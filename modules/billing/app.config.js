const SCOPE = 'billing';

module.exports = (config) => {
  const { env } = config.utils;

  return {
    billing: {
      exampleVar: env.get('EXAMPLE_KEY', SCOPE),
    },
  };
};
