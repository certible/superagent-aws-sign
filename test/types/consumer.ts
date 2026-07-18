import AwsSignRequest from '@certible/superagent-aws-sign';

const signer = new AwsSignRequest();
signer.setCredentials({
  accessKeyId: 'access-key-id',
  secretAccessKey: 'secret-access-key',
});
