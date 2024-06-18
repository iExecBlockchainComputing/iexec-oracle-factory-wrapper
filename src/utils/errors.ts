/* eslint-disable sonarjs/no-identical-functions */
import { ValidationError as YupValidationError } from 'yup';

/**
 * ValidationError is thrown when a method is called with missing or unexpected parameters.
 */
export class ValidationError extends YupValidationError {}

export class WorkflowError extends Error {
  originalError?: Error;

  constructor(message: string, originalError?: Error) {
    super(message);
    this.name = this.constructor.name;
    if (originalError) {
      this.originalError = originalError;
    }
  }
}

/**
 * Web3ProviderError encapsulate an error thrown by the web3 provider.
 */
export class Web3ProviderError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = this.constructor.name;
    this.cause = cause;
  }

  cause?: Error;
}

/**
 * Web3ProviderCallError encapsulate an error thrown by the web3 provider during a web3 call.
 */
export class Web3ProviderCallError extends Web3ProviderError {}

/**
 * Web3ProviderSendError encapsulate an error thrown by the web3 provider during a transaction.
 */
export class Web3ProviderSendError extends Web3ProviderError {}

/**
 * Web3ProviderSignMessageError encapsulate an error thrown by the web3 provider during a message signature.
 */
export class Web3ProviderSignMessageError extends Web3ProviderError {}

/**
 * ApiCallError encapsulate an error occurring during a call to an API such as a network error or a server internal error.
 */
export class ApiCallError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = this.constructor.name;
    this.cause = cause;
  }

  cause?: Error;
}

/**
 * SmsCallError encapsulate an error occurring during a call to the SMS API such as a network error or a server internal error.
 */
export class SmsCallError extends ApiCallError {}

/**
 * ResultProxyCallError encapsulate an error occurring during a call to the Result Proxy API such as a network error or a server internal error.
 */
export class ResultProxyCallError extends ApiCallError {}

/**
 * MarketCallError encapsulate an error occurring during a call to the Market API such as a network error or a server internal error.
 */
export class MarketCallError extends ApiCallError {}

/**
 * IpfsGatewayCallError encapsulate an error occurring during a call to the IPFS gateway API such as a network error or a server internal error.
 */
export class IpfsGatewayCallError extends ApiCallError {}

/**
 * WorkerpoolCallError encapsulate an error occurring during a call to a workerpool API such as a network error or a server internal error.
 */
export class WorkerpoolCallError extends ApiCallError {}

export class NoValueError extends Error {}
