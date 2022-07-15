import {
  TEST_PORT_VARIABLE,
  TEST_DB_ADDRESS_VARIABLE,
  TEST_ENCRYPTION_SALT_VARIABLE,
  TEST_TOKEN_SECRET_VARIABLE,
  TEST_TOKEN_VALIDITY_VARIABLE,
} from '../setEnvVariables';
import EnvVariablesSingleton from '../../src/setup/EnvVariablesSingleton';

test('The EnvVariablesSingleton should return the correct environment variables', () => {
  const singleton = EnvVariablesSingleton.instance;
  expect(singleton.port).toEqual(TEST_PORT_VARIABLE);
  expect(singleton.dbAddress).toEqual(TEST_DB_ADDRESS_VARIABLE);
  expect(singleton.encryptionSalt).toEqual(TEST_ENCRYPTION_SALT_VARIABLE);
  expect(singleton.tokenSecret).toEqual(TEST_TOKEN_SECRET_VARIABLE);
  expect(singleton.tokenValidity).toEqual(TEST_TOKEN_VALIDITY_VARIABLE);
});
