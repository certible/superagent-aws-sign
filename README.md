# Superagent-AWS-Sign

[Superagent](https://github.com/ladjs/superagent) plugin to sign AWS requests and invoke AWS resources protected by IAM roles. It uses the [AWS Signature Version 4](https://docs.aws.amazon.com/general/latest/gr/signature-version-4.html) process to add authentication information to requests.

## Installation

Install the package from npm:

```shell
npm install @certible/superagent-aws-sign
```

## Usage

Import the AwsSignRequest class and create a new instance. After building your request use the `use()` method from [Superagent](https://github.com/ladjs/superagent#plugins) to your instance to the request:

```javascript
const AwsSignRequest = require('@certible/superagent-aws-sign');
const signer = new AwsSignRequest();
await signer.setCredentialsFromConfig('default');
const response = await superagent
  .get('api-gateway-url')
  .use(signer.add()); // 'execute-api' is the default service of the class
```

### TypeScript

Package is written with JSDoc comments. For TypeScript users you may need to allow JavaScript in your `tsconfig.json` file.

```json
{
  "compilerOptions": {
    "allowJs": true,
    "maxNodeModuleJsDepth": 1
  }
}
```

## Setting AWS Region

You can set the AWS region for the request using the setRegion method:

```javascript
const region = 'us-west-2';
signer.setRegion(region);
```

## Setting AWS Credentials

You can set AWS credentials manually or load them from the local `~/.aws/credentials` file.

### Manually setting credentials

```javascript
const credentials = {
  accessKeyId: 'YOUR_ACCESS_KEY',
  secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
  sessionToken: 'OPTIONAL_SESSION_TOKEN',
};

signer.setCredentials(credentials);
```

### Loading credentials from config

```javascript
const profile = 'YOUR_AWS_PROFILE_NAME';

signer.setCredentialsFromConfig(profile)
  .then((credentials) => {
    // Credentials loaded successfully
  })
  .catch((error) => {
    // Error loading credentials
    console.error(error);
  });
```

## Assuming a Role

To assume a role, use the assumeRole method:

```javascript
const params = {
  RoleArn: 'ARN_OF_THE_ROLE',
  RoleSessionName: 'SESSION_NAME',
};

signer.assumeRole(params)
  .then(() => {
    // Role assumed successfully
  })
  .catch((error) => {
    // Error assuming role
    console.error(error);
  });
```

### Removing Role

To remove a previously assumed role and revert to using the original credentials, use the removeRole method:

```javascript
signer.removeRole();
```

## Testing

To run the test you need to setup the SAM resources, see [template.yaml](template.yaml) for details. Add the generated cloudformation output to the `.env` file, see template [.env.template](.env.template) for details.

```shell
sam build
sam deploy --guided
```

## Honorable Mentions

This project is based on [npmjs.com/package/superagent-aws-signed-request](https://www.npmjs.com/package/superagent-aws-signed-request) and was updated to meet our needs.

## License

This project is licensed under the MIT License.
