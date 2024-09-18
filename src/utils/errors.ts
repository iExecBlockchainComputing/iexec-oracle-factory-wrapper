import { ApiCallError } from 'iexec/errors';
import { ValidationError } from 'yup';
import { SafeObserver } from './reactive.js';

export const updateErrorMessage = 'Failed to update oracle';

export class WorkflowError extends Error {
  isProtocolError: boolean;

  constructor({
    message,
    errorCause,
    isProtocolError = false,
  }: {
    message: string;
    errorCause: Error;
    isProtocolError?: boolean;
  }) {
    super(message, { cause: errorCause });
    this.name = this.constructor.name;
    this.isProtocolError = isProtocolError;
  }
}

export function handleIfProtocolError(
  error: Error,
  observer: SafeObserver<unknown>
) {
  if (error instanceof ApiCallError) {
    observer.error(
      new WorkflowError({
        message:
          "A service in the iExec protocol appears to be unavailable. You can retry later or contact iExec's technical support for help.",
        errorCause: error,
        isProtocolError: true,
      })
    );
  }
}

export class NoValueError extends Error {}

export { ValidationError };
