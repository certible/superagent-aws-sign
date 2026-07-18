//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
//#endregion
let _aws_sdk_client_sts = require("@aws-sdk/client-sts");
let _aws_sdk_credential_providers = require("@aws-sdk/credential-providers");
let aws4 = require("aws4");
aws4 = __toESM(aws4, 1);
//#region src/index.js
/** @import { Credentials } from 'aws4' */
/**
* @typedef { import("superagent").Plugin } Plugin
*/
/**
* @description Helper utility to sign aws request, to invoke aws resources protected by IAM role.
*/
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
	* @param {Credentials} credentials - The AWS credentials to set.
	* @returns {Credentials} - The set AWS credentials.
	*/
	setCredentials(credentials) {
		this.#credentials = credentials;
		return this.#credentials;
	}
	/**
	* @description Get and set aws credentials from local ~.aws/credentials
	* @param {string} profile - The profile name in the credentials file.
	* @returns {Promise<Credentials>} - The set AWS credentials.
	*/
	async setCredentialsFromConfig(profile) {
		const getShared = (0, _aws_sdk_credential_providers.fromIni)({ profile });
		this.#credentials = await getShared();
		return this.#credentials;
	}
	/**
	* @description Get and set aws credentials from environment variables
	* @returns {Promise<Credentials>} - The set AWS credentials.
	*/
	async setCredentialsFromEnv() {
		const env = (0, _aws_sdk_credential_providers.fromEnv)();
		this.#credentials = await env();
		return this.#credentials;
	}
	/**
	* @description Create a session login.
	* @param {object} params - The parameters for assuming a role.
	* @returns {Promise<void>}
	*/
	async assumeRole(params) {
		if (!this.#credentials) throw new Error("No credentials set");
		if (!this.region) throw new Error("No region set");
		const client = new _aws_sdk_client_sts.STSClient({
			credentials: this.#credentials,
			region: this.region
		});
		const command = new _aws_sdk_client_sts.AssumeRoleCommand(params);
		try {
			const data = await client.send(command);
			if (!data.Credentials) throw new Error("No credentials received");
			this.session = {
				accessKeyId: data.Credentials.AccessKeyId,
				secretAccessKey: data.Credentials.SecretAccessKey,
				sessionToken: data.Credentials.SessionToken
			};
		} catch (error) {
			console.error(error);
			throw new Error("Could not create session credentials", { cause: error });
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
				req.header = sign({
					host: parsedUrl.host,
					method: req.method,
					path,
					body,
					service,
					region,
					headers
				}, cred).headers;
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
	* @param {Credentials} [credentials] - The AWS credentials to use for signing. (optional)
	* @returns {object} - The aws4 signed request object.
	*/
	sign(request, credentials = void 0) {
		const cred = credentials ?? this.session ?? this.#credentials;
		if (cred.sessionToken) request.headers["X-Amz-Security-Token"] = cred.sessionToken;
		return aws4.default.sign(request, cred);
	}
};
//#endregion
module.exports = AwsSignRequest;

module.exports.default = module.exports;