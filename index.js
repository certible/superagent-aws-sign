const { fromIni, fromEnv } = require('@aws-sdk/credential-providers');
const { STSClient, AssumeRoleCommand } = require('@aws-sdk/client-sts');
const aws4 = require('aws4');
/**
 * @typedef { import("superagent").Plugin } Plugin
 */

/**
 * @description Helper utility to sign aws request, to invoke aws resources protected by IAM role.
 */
class AwsSignRequest {
  /**
   * @description Default service name for the request.
   */
  defaultService;
  /**
   * @description AWS region for the request.
   */
  region;
  /**
   * @description AWS credentials used for signing requests.
   */
  #credentials;
  /**
   * @description AWS session credentials used for signing requests.
   */
  session;
  /**
   * @param {string} defaultService - Default service name for the request. (optional)
   * @default 'execute-api'
   */
  constructor(defaultService = 'execute-api') {
    this.defaultService = defaultService;
  }
  /**
   * @description Set aws credentials manually, e.g., env
   * @param {aws4.Credentials} credentials - The AWS credentials to set.
   * @returns {aws4.Credentials} - The set AWS credentials.
   */
  setCredentials(credentials) {
    this.#credentials = credentials;
    return this.#credentials;
  }
  /**
   * @description Get and set aws credentials from local ~.aws/credentials
   * @param {string} profile - The profile name in the credentials file.
   * @returns {Promise<aws4.Credentials>} - The set AWS credentials.
   */
  async setCredentialsFromConfig(profile) {
    const getShared = fromIni({ profile });
    this.#credentials = await getShared();
    return this.#credentials;
  }
  /**
   * @description Get and set aws credentials from environment variables
   * @returns {Promise<aws4.Credentials>} - The set AWS credentials.
   */
  async setCredentialsFromEnv() {
    const env = fromEnv();
    this.#credentials = await env();
    return this.#credentials;
  }

  /**
   * @description Create a session login.
   * @param {object} params - The parameters for assuming a role.
   * @returns {Promise<void>}
   */
  async assumeRole(params) {
    if (!this.#credentials) throw Error('No credentials set');
    if (!this.region) throw Error('No region set');
    const client = new STSClient({
      credentials: this.#credentials,
      region: this.region,
    });
    const command = new AssumeRoleCommand(params);
    try {
      const data = await client.send(command);
      if (!data.Credentials) throw Error('No credentials received');
      this.session = {
        accessKeyId: data.Credentials.AccessKeyId,
        secretAccessKey: data.Credentials.SecretAccessKey,
        sessionToken: data.Credentials.SessionToken,
      };
    } catch (error) {
      console.error(error);
      throw Error('Could not create session credentials');
    }
  }
  /**
   * @description Remove possible previous set session.
   */
  removeRole() {
    this.session = null;
  }
  /**
   * @description Set aws region.
   * @param {string} region - The AWS region to set.
   * @returns {string} - The set AWS region.
   */
  setRegion(region) {
    this.region = region;
    return this.region;
  }
  /**
   * @description Create custom req.end which intercepts the request and signs it off with all the needed data, returns the original end function.
   * @param {string} [requestService] - The service name for the request. (optional)
   * @returns {Plugin} - The signRequest function.
   */
  add(requestService = undefined) {
    const service = requestService ?? this.defaultService;
    const region = this.region;
    const sign = this.sign;
    const cred = this.session ?? this.#credentials;
    return function signRequest(req) {
      req._originalEnd = req.end;
      // Replace end function, which is called after .send() to get all the headers before the actual call
      req.end = function (callback) {
        const headers = req.header;

        const body =
          req.header['Content-Type'] === 'application/json'
            ? JSON.stringify(req._data)
            : req._formData;

        const parsedUrl = new URL(req.url);
        let path = parsedUrl.pathname;
        if (req.qs) {
          const query = new URLSearchParams(req.qs);
          path = path + (path.includes('?') ? '&' : '?') + query.toString();
        }

        const request = {
          host: parsedUrl.host,
          method: req.method,
          path,
          body,
          service,
          region,
          headers,
        };

        const signedOptions = sign(request, cred);
        // Add signed header which actually does the IAM role check
        req.header = signedOptions.headers;
        // set the original end function back and end the call
        req.end = req._originalEnd;
        req.end(callback);

        return this;
      };

      return req;
    };
  }

  /**
   * @description Sign the request with the credentials.
   * @param {object} request - The request object.
   * @param {aws4.Credentials} [credentials] - The AWS credentials to use for signing. (optional)
   * @returns {object} - The aws4 signed request object.
   */
  sign(request, credentials = undefined) {
    const cred = credentials ?? this.session ?? this.#credentials;
    // If using assumeRole() the credentials will also hold a session token
    if (cred.sessionToken) {
      request.headers['X-Amz-Security-Token'] = cred.sessionToken;
    }
    return aws4.sign(request, cred);
  }
}

module.exports = AwsSignRequest;
