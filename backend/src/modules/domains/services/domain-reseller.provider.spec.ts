import {
  CloudflareDomainResellerProvider,
  StubDomainResellerProvider,
} from './domain-reseller.provider';

describe('StubDomainResellerProvider', () => {
  it('marks odd-length (without dots) domains as available and even-length as unavailable', async () => {
    const provider = new StubDomainResellerProvider();

    const oddDomain = 'abc.test'; // 'abctest' => length 7 (odd)
    const evenDomain = 'abcd.test'; // 'abcdtest' => length 8 (even)

    const oddResult = await provider.search(oddDomain);
    const evenResult = await provider.search(evenDomain);

    expect(oddResult.domain).toBe(oddDomain);
    expect(oddResult.available).toBe(true);

    expect(evenResult.domain).toBe(evenDomain);
    expect(evenResult.available).toBe(false);
  });

  it('simulates successful purchase with stub provider', async () => {
    const provider = new StubDomainResellerProvider();

    const result = await provider.purchase({
      domain: 'example.test',
      tenantId: 'tenant-1',
    });

    expect(result.success).toBe(true);
    expect(result.domain).toBe('example.test');
    expect(result.providerOrderId).toMatch(/^stub-/);
  });
});

describe('CloudflareDomainResellerProvider', () => {
  const originalZoneId = process.env.CLOUDFLARE_ZONE_ID;
  const originalToken = process.env.CLOUDFLARE_API_TOKEN;

  afterEach(() => {
    process.env.CLOUDFLARE_ZONE_ID = originalZoneId;
    process.env.CLOUDFLARE_API_TOKEN = originalToken;
  });

  it('returns a conservative available search result', async () => {
    const provider = new CloudflareDomainResellerProvider();

    const result = await provider.search('example.com');

    expect(result.domain).toBe('example.com');
    expect(result.available).toBe(true);
    expect(result.provider).toBe('cloudflare');
  });

  it('does not throw when DNS config is missing', async () => {
    delete process.env.CLOUDFLARE_ZONE_ID;
    delete process.env.CLOUDFLARE_API_TOKEN;

    const provider = new CloudflareDomainResellerProvider();

    await expect(
      provider.ensureDns('example.com', []),
    ).resolves.toBeUndefined();
  });
});
