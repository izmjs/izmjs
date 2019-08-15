const GenericField = require('./generic');

/**
 * Object field
 */
class NumberField extends GenericField {
  setValue(value) {
    this.value = Number.isNaN(value) ? null : +value;

    return this;
  }
}

module.exports = NumberField;
