export = AwsSignRequest;
/**
 * @typedef { import("superagent").Plugin } Plugin
 */
/**
 * @description Helper utility to sign aws request, to invoke aws resources protected by IAM role.
 */
declare class AwsSignRequest {
    /**
     * @param {string} defaultService - Default service name for the request. (optional)
     * @default 'execute-api'
     */
    constructor(defaultService?: string);
    /**
     * @description Default service name for the request.
     */
    defaultService: string;
    /**
     * @description AWS region for the request.
     */
    region: any;
    /**
     * @description AWS session credentials used for signing requests.
     */
    session: any;
    /**
     * @description Set aws credentials manually, e.g., env
     * @param {aws4.Credentials} credentials - The AWS credentials to set.
     * @returns {aws4.Credentials} - The set AWS credentials.
     */
    setCredentials(credentials: aws4.Credentials): aws4.Credentials;
    /**
     * @description Get and set aws credentials from local ~.aws/credentials
     * @param {string} profile - The profile name in the credentials file.
     * @returns {Promise<aws4.Credentials>} - The set AWS credentials.
     */
    setCredentialsFromConfig(profile: string): Promise<aws4.Credentials>;
    /**
     * @description Get and set aws credentials from environment variables
     * @returns {Promise<aws4.Credentials>} - The set AWS credentials.
     */
    setCredentialsFromEnv(): Promise<aws4.Credentials>;
    /**
     * @description Create a session login.
     * @param {object} params - The parameters for assuming a role.
     * @returns {Promise<void>}
     */
    assumeRole(params: object): Promise<void>;
    /**
     * @description Remove possible previous set session.
     */
    removeRole(): void;
    /**
     * @description Set aws region.
     * @param {string} region - The AWS region to set.
     * @returns {string} - The set AWS region.
     */
    setRegion(region: string): string;
    /**
     * @description Create custom req.end which intercepts the request and signs it off with all the needed data, returns the original end function.
     * @param {string} [requestService] - The service name for the request. (optional)
     * @returns {Plugin} - The signRequest function.
     */
    add(requestService?: string): Plugin;
    /**
     * @description Sign the request with the credentials.
     * @param {object} request - The request object.
     * @param {aws4.Credentials} [credentials] - The AWS credentials to use for signing. (optional)
     * @returns {object} - The aws4 signed request object.
     */
    sign(request: object, credentials?: aws4.Credentials): object;
    #private;
}
declare namespace AwsSignRequest {
    export { Plugin };
}
type Plugin = any;
//# sourceMappingURL=index.d.ts.map