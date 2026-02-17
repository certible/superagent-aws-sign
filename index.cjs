var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.js
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);
var import_client_sts = require("@aws-sdk/client-sts");
var import_credential_providers = require("@aws-sdk/credential-providers");
var import_aws4 = __toESM(require("aws4"), 1);
var AwsSignRequest = class {
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
   * @default
   */
  constructor(defaultService = "execute-api") {
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
    const getShared = (0, import_credential_providers.fromIni)({ profile });
    this.#credentials = await getShared();
    return this.#credentials;
  }
  /**
   * @description Get and set aws credentials from environment variables
   * @returns {Promise<aws4.Credentials>} - The set AWS credentials.
   */
  async setCredentialsFromEnv() {
    const env = (0, import_credential_providers.fromEnv)();
    this.#credentials = await env();
    return this.#credentials;
  }
  /**
   * @description Create a session login.
   * @param {object} params - The parameters for assuming a role.
   * @returns {Promise<void>}
   */
  async assumeRole(params) {
    if (!this.#credentials)
      throw new Error("No credentials set");
    if (!this.region)
      throw new Error("No region set");
    const client = new import_client_sts.STSClient({
      credentials: this.#credentials,
      region: this.region
    });
    const command = new import_client_sts.AssumeRoleCommand(params);
    try {
      const data = await client.send(command);
      if (!data.Credentials)
        throw new Error("No credentials received");
      this.session = {
        accessKeyId: data.Credentials.AccessKeyId,
        secretAccessKey: data.Credentials.SecretAccessKey,
        sessionToken: data.Credentials.SessionToken
      };
    } catch (error) {
      console.error(error);
      throw new Error("Could not create session credentials");
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
  add(requestService = void 0) {
    const service = requestService ?? this.defaultService;
    const region = this.region;
    const sign = this.sign;
    const cred = this.session ?? this.#credentials;
    return function signRequest(req) {
      req._originalEnd = req.end;
      req.end = function(callback) {
        const headers = req.header;
        const body = req.header["Content-Type"] === "application/json" ? JSON.stringify(req._data) : req._formData;
        const parsedUrl = new URL(req.url);
        let path = parsedUrl.pathname;
        if (req.qs) {
          const query = new URLSearchParams(req.qs);
          path = path + (path.includes("?") ? "&" : "?") + query.toString();
        }
        const request = {
          host: parsedUrl.host,
          method: req.method,
          path,
          body,
          service,
          region,
          headers
        };
        const signedOptions = sign(request, cred);
        req.header = signedOptions.headers;
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
  sign(request, credentials = void 0) {
    const cred = credentials ?? this.session ?? this.#credentials;
    if (cred.sessionToken) {
      request.headers["X-Amz-Security-Token"] = cred.sessionToken;
    }
    return import_aws4.default.sign(request, cred);
  }
};
var index_default = AwsSignRequest;
module.exports = module.exports.default || module.exports;
