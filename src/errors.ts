import { ValidationError } from 'yup';

class WorkflowError extends Error {
  constructor(message, originalError) {
    super(message);
    this.name = this.constructor.name;
    this.originalError = originalError;
  }
}

class NoValueError extends Error {}

export  {
  ValidationError,
  WorkflowError,
  NoValueError,
};
