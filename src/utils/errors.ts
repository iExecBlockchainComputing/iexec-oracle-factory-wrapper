import { ApiCallError } from 'iexec/errors';
import { ValidationError } from 'yup';

export class WorkflowError extends Error {
  constructor(message: string, cause: Error) {
    super(message, { cause: cause });
    this.name = this.constructor.name;
  }
}

export function handleProtocolError(error: Error): boolean {
  if (error instanceof ApiCallError) {
    throw new WorkflowError(
      "A service in the iExec protocol appears to be unavailable. You can retry later or contact iExec's technical support for help.",
      error
    );
  }
  return false;
}

export class NoValueError extends Error {}

export { ValidationError };
