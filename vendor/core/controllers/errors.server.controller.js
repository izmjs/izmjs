/**
 * Get unique error field name
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */
const getUniqueErrorMessage = (err) => {
  let output;

  try {
    const fieldName = err.errmsg.substring(
      err.errmsg.lastIndexOf('.$') + 2,
      err.errmsg.lastIndexOf('_1'),
    );
    output = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} already exists`;
  } catch (ex) {
    output = 'Unique field already exists';
  }

  return output;
};

/**
 * Get the error message from error object
 * @param {import('express').Request} req The request
 * @param {import('express').Response} res The response
 * @param {Function} next Go to the next middleware
 */
exports.getErrorMessage = (err) => {
  console.error(err);
  let m = '';

  if (err.code) {
    switch (err.code) {
      case 11000:
      case 11001:
        m = getUniqueErrorMessage(err);
        break;
      default:
        m = 'Something went wrong';
    }
  } else {
    Object.keys(err.errors).forEach((errName) => {
      if (err.errors[errName].message) {
        m = err.errors[errName].message;
      }
    });
  }

  return m;
};
