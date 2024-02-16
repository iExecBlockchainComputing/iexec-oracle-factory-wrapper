import * as exportedModule from '../dist/index.js';
import { IExecOracleFactory } from '../dist/oracleFactory/OracleFactory.js';
import * as errors from '../dist/utils/errors.js';
import * as utils from '../dist/utils/utils.js';

test('exports { IExecOracleFactory, utils, errors }', () => {
  expect(Object.entries(exportedModule).length).toBe(5);
  expect(exportedModule.IExecOracleFactory).toBe(IExecOracleFactory);
  expect(exportedModule.utils).toBe(utils);
  expect(exportedModule.errors).toBe(errors);
});
