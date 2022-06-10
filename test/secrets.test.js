const AWS = require('aws-sdk')
const mockRegion = 'us-east-1'
const mockSecretName = 'SIBot-Tokens'
const mockSecrets = jest.fn()

jest.mock('aws-sdk', () => ({
  SecretsManager: jest.fn(() => ({
    getSecretValue: jest.fn(() => ({
      promise: mockSecrets
    }))
  }))
}))


describe('secrets', () => {
  
});
