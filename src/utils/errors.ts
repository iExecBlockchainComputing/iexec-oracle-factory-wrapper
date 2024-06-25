import { ApiCallError } from 'iexec/errors';
import { ValidationError } from 'yup';
import { SafeObserver } from './reactive.js';

export const updateErrorMessage = 'Failed to update oracle';

export class WorkflowError extends Error {
  isProtocolError: boolean;

  constructor({
    message,
    cause,
    isProtocolError = false,
  }: {
    message: string;
    cause: Error;
    isProtocolError?: boolean;
  }) {
    super(message, { cause: cause });
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
        cause: error,
        isProtocolError: true,
      })
    );
  }
}

export class NoValueError extends Error {}

export { ValidationError };
