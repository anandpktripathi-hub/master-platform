import AWS from 'aws-sdk';

const route53 = new AWS.Route53({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

export async function createSubdomain(subdomain: string, rootDomain: string, hostedZoneId: string) {
  const params = {
    ChangeBatch: {
      Changes: [
        {
          Action: 'UPSERT',
          ResourceRecordSet: {
            Name: `${subdomain}.${rootDomain}`,
            Type: 'A',
            TTL: 300,
            ResourceRecords: [{ Value: process.env.SERVER_IP }],
          },
        },
      ],
      Comment: 'Auto subdomain creation',
    },
    HostedZoneId: hostedZoneId,
  };
  return route53.changeResourceRecordSets(params).promise();
}

if (require.main === module) {
  // CLI usage: node aws-route53.js subdomain rootdomain.com hostedZoneId
  const [,, sub, root, zone] = process.argv;
  createSubdomain(sub, root, zone).then(console.log).catch(console.error);
}
