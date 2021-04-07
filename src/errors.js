const { ValidationError } = require('yup');

class WorkflowError extends Error {
  constructor(message, originalError) {
    super(message);
    this.name = this.constructor.name;
    this.originalError = originalError;
  }
}

module.exports = {
  ValidationError,
  WorkflowError,
};
