const SCOPE = '{{{lowercase name}}}';

module.exports = (config) => {
  const { env } = config.utils;

  return {
    {{{get-key name }}}: {
      exampleVar: env.get('EXAMPLE_KEY', SCOPE),
    },
  };
};
