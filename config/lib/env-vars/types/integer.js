const GenericField = require('./generic');

/**
 * Object field
 */
class IntegerField extends GenericField {
  setValue(value) {
    this.value = Number.isNaN(value) ? null : parseInt(value, 10);

    return this;
  }
}

module.exports = IntegerField;
