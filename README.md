# Superagent-AWS-Sign

[Superagent](https://github.com/ladjs/superagent) plugin to sign AWS requests and invoke AWS resources protected by IAM roles. It uses the [AWS Signature Version 4](https://docs.aws.amazon.com/general/latest/gr/signature-version-4.html) process to add authentication information to requests.

## Installation

Install the package from npm:

```shell
npm install aws-sign-request
```

## Usage

Import the AwsSignRequest class and create an instance:

```javascript
const AwsSignRequest = require('aws-sign-request');
const signer = new AwsSignRequest();
await signer.setCredentialsFromConfig('default')
const response = await superagent
  .get('api-gateway-url') // 'execute-api' is the default service of the class
  .use(signer.add())

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
  });
```

### Removing Role

To remove a previously assumed role and revert to using the original credentials, use the removeRole method:

```javascript
signer.removeRole();
```

## Signing Superagent Request

After building your request use the `use()` method from [Superagent](https://github.com/ladjs/superagent#plugins) to add the signer to the request:

```javascript
await superagent
  .get('api-gateway-url') // 'execute-api' is the default service of the class
  .use(signer.add())
```

By default, the service name for the request is set to 'execute-api'. You can override this by passing a service name to the add method:

```javascript
const customEnd = signer.add('custom-service-name');
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
