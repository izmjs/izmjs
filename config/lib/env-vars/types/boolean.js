const GenericField = require('./generic');

/**
 * Boolean field
 */
class BooleanField extends GenericField {
  setValue(value) {
    this.value = value === 'true' || value === true;

    return this;
  }
}

module.exports = BooleanField;
