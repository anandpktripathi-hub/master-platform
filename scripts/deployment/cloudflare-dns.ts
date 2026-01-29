import axios from 'axios';

const CLOUDFLARE_API = 'https://api.cloudflare.com/client/v4';
const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

export async function createSubdomain(subdomain: string, rootDomain: string) {
  const name = `${subdomain}.${rootDomain}`;
  const data = {
    type: 'A',
    name,
    content: process.env.SERVER_IP,
    ttl: 3600,
    proxied: false,
  };
  const res = await axios.post(
    `${CLOUDFLARE_API}/zones/${ZONE_ID}/dns_records`,
    data,
    { headers: { Authorization: `Bearer ${API_TOKEN}` } }
  );
  return res.data;
}

if (require.main === module) {
  // CLI usage: node cloudflare-dns.js subdomain rootdomain.com
  const [,, sub, root] = process.argv;
  createSubdomain(sub, root).then(console.log).catch(console.error);
}
