const test = require('node:test');
const assert = require('node:assert/strict');
const { getJwtConfig } = require('../src/config/jwt');

test('JWT configuration requires a non-empty environment secret', () => {
  const originalSecret = process.env.JWT_SECRET;

  try {
    delete process.env.JWT_SECRET;
    assert.throws(() => getJwtConfig(), /JWT_SECRET/i);
  } finally {
    if (originalSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalSecret;
    }
  }
});
