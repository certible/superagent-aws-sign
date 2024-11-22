const { describe, it, expect, beforeEach } = require('@jest/globals');
const superagent = require('superagent');
const AwsSignRequest = require('../index.js');

require('dotenv').config();

const ROLE_ARN = process.env.ROLE_ARN;
const GATEWAY_URL = process.env.GATEWAY_URL;
const PROFILE = process.env.PROFILE;
const REGION = process.env.REGION ?? 'eu-central-1';

describe('awsSignRequest', () => {
  const signer = new AwsSignRequest();

  beforeEach(() => {
    signer.setRegion(REGION);
  });

  it('should set and get credentials', () => {
    const credentials = {
      accessKeyId: 'ACCESS_KEY',
      secretAccessKey: 'SECRET_ACCESS_KEY',
      sessionToken: 'SESSION_TOKEN',
    };

    const response = signer.setCredentials(credentials);
    expect(response).toEqual(credentials);
  });

  it('should set and get credentials from config', async () => {
    const response = await signer.setCredentialsFromConfig(PROFILE);
    expect(response).toBeDefined();
  });

  it('should assume a role and set session credentials', async () => {
    const roleParams = {
      RoleArn: ROLE_ARN,
      RoleSessionName: 'TestSession',
    };

    await signer.assumeRole(roleParams);
    expect(signer.session).toBeDefined();
  });

  it('should remove the assumed role after assuming it', async () => {
    const roleParams = {
      RoleArn: ROLE_ARN,
      RoleSessionName: 'TestSession',
    };

    await signer.assumeRole(roleParams);
    expect(signer.session).toBeDefined();

    signer.removeRole();
    expect(signer.session).toBeNull();
  });

  it('should set and get the region', () => {
    const region = 'us-west-2';

    signer.setRegion(region);
    expect(signer.region).toEqual(region);
  });

  it('should create a custom end function and sign the request', async () => {
    const roleParams = {
      RoleArn: ROLE_ARN,
      RoleSessionName: 'TestSession',
    };

    await signer.assumeRole(roleParams);
    const response = await superagent.get(GATEWAY_URL).use(signer.add());

    expect(response.status).toEqual(200);
  });
});
