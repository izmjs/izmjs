const {
  NumberField,
  ObjectField,
  GenericField,
  BooleanField,
  IntegerField,
} = require('./types');

/**
 * Represents a field
 * @class Field
 * @access private
 */
class Field {
  constructor() {
    throw new Error('You can instantiate this abstract class');
  }

  static create(config, schema = { type: 'string' }) {
    switch (schema.type) {
      case 'object':
        // eslint-disable-next-line no-use-before-define
        return new ObjectField(config, schema);
      case 'boolean':
        // eslint-disable-next-line no-use-before-define
        return new BooleanField(config, schema);
      case 'integer':
        // eslint-disable-next-line no-use-before-define
        return new IntegerField(config, schema);
      case 'number':
        // eslint-disable-next-line no-use-before-define
        return new NumberField(config, schema);
      default:
        return new GenericField(config, schema);
    }
  }
}

module.exports = Field;
