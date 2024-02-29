import * as exportedModule from '../src/index.js';
import { IExecOracleFactory } from '../src/index.js';
import * as errors from '../src/utils/errors.js';
import * as utils from '../src/utils/utils.js';

test('exports { IExecOracleFactory, utils, errors }', () => {
  expect(Object.entries(exportedModule).length).toBe(5);
  expect(exportedModule.IExecOracleFactory).toBe(IExecOracleFactory);
  expect(exportedModule.utils).toBe(utils);
  expect(exportedModule.errors).toBe(errors);
});
