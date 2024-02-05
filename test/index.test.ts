import * as exportedModule from '../src/index.js';
import OracleFactory from '../src/OracleFactory.js';
import OracleReader from '../src/OracleReader.js';
import * as utils from '../src/utils.js';
import * as errors from '../src/errors.js';


test('exports { IExecOracleFactory, utils, errors }', () => {
  expect(Object.entries(exportedModule).length).toBe(4);
  expect(exportedModule.IExecOracleFactory).toBe(OracleFactory);
  expect(exportedModule.IExecOracleReader).toBe(OracleReader);
  expect(exportedModule.utils).toBe(utils);
  expect(exportedModule.errors).toBe(errors);
});
