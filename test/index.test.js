const exportedModule = require('../src');
const OracleFactory = require('../src/OracleFactory');
const utils = require('../src/utils');
const errors = require('../src/errors');

test('exports { IExecOracleFactory, utils, errors }', () => {
  expect(Object.entries(exportedModule).length).toBe(3);
  expect(exportedModule.IExecOracleFactory).toBe(OracleFactory);
  expect(exportedModule.utils).toBe(utils);
  expect(exportedModule.errors).toBe(errors);
});
