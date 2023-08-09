import * as exportedModule from '../src/index';
import OracleFactory from '../src/OracleFactory';
import OracleReader from '../src/OracleReader';
import * as utils from '../src/utils';
import * as errors from '../src/errors';


test('exports { IExecOracleFactory, utils, errors }', () => {
  expect(Object.entries(exportedModule).length).toBe(4);
  expect(exportedModule.IExecOracleFactory).toBe(OracleFactory);
  expect(exportedModule.IExecOracleReader).toBe(OracleReader);
  expect(exportedModule.utils).toBe(utils);
  expect(exportedModule.errors).toBe(errors);
});
