const exportedModule = require('../src');
const OracleFactory = require('../src/OracleFactory');
const OracleReader = require('../src/OracleReader');
const utils = require('../src/utils');
const errors = require('../src/errors');

test('exports { IExecOracleFactory, utils, errors }', () => {
  expect(Object.entries(exportedModule).length).toBe(4);
  expect(exportedModule.IExecOracleFactory).toBe(OracleFactory);
  expect(exportedModule.IExecOracleReader).toBe(OracleReader);
  expect(exportedModule.utils).toBe(utils);
  expect(exportedModule.errors).toBe(errors);
});
