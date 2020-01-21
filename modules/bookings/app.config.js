const SCOPE = 'bookings';

module.exports = (config) => {
  const { env } = config.utils;

  return {
    bookings: {
      exampleVar: env.get('EXAMPLE_KEY', SCOPE),
    },
  };
};
