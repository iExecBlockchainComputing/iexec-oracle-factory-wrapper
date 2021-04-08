const exportedModule = require('../src');
const OracleFactory = require('../src/OracleFactory');
const utils = require('../src/utils');

test('exports { IExecOracleFactory, utils }', () => {
  expect(Object.entries(exportedModule).length).toBe(2);
  expect(exportedModule.IExecOracleFactory).toBe(OracleFactory);
  expect(exportedModule.utils).toBe(utils);
});
