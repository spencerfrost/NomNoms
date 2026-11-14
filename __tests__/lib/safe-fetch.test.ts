/**
 * @jest-environment node
 */
import { assertSafeUrl, isBlockedAddress } from '@/lib/safe-fetch';
import { lookup } from 'node:dns/promises';

jest.mock('node:dns/promises', () => ({ lookup: jest.fn() }));
const mockLookup = lookup as unknown as jest.Mock;

describe('isBlockedAddress', () => {
  it.each([
    '127.0.0.1',
    '10.1.2.3',
    '172.16.0.1',
    '172.31.255.255',
    '192.168.1.1',
    '169.254.169.254',
    '100.64.0.1',
    '0.0.0.0',
    '::1',
    '::',
    'fd00::1',
    'fe80::1',
    '::ffff:127.0.0.1',
    '::ffff:169.254.169.254',
  ])('blocks %s', ip => {
    expect(isBlockedAddress(ip)).toBe(true);
  });

  it.each(['8.8.8.8', '172.32.0.1', '151.101.1.69', '2606:4700::6810:84e5'])('allows %s', ip => {
    expect(isBlockedAddress(ip)).toBe(false);
  });
});

describe('assertSafeUrl', () => {
  beforeEach(() => mockLookup.mockReset());

  it('rejects non-http protocols, credentials and odd ports', async () => {
    await expect(assertSafeUrl('file:///etc/passwd')).rejects.toThrow('Invalid URL format');
    await expect(assertSafeUrl('https://user:pw@example.com/')).rejects.toThrow();
    await expect(assertSafeUrl('http://example.com:6379/')).rejects.toThrow();
  });

  it('rejects literal private IPs without a DNS lookup', async () => {
    await expect(assertSafeUrl('http://169.254.169.254/latest/meta-data')).rejects.toThrow();
    await expect(assertSafeUrl('http://[::1]/')).rejects.toThrow();
    expect(mockLookup).not.toHaveBeenCalled();
  });

  it('rejects hostnames that resolve to private addresses', async () => {
    mockLookup.mockResolvedValue([{ address: '10.0.0.5', family: 4 }]);
    await expect(assertSafeUrl('http://10.0.0.5.nip.io/')).rejects.toThrow('Invalid URL format');
  });

  it('rejects when any resolved address is private', async () => {
    mockLookup.mockResolvedValue([
      { address: '93.184.216.34', family: 4 },
      { address: '127.0.0.1', family: 4 },
    ]);
    await expect(assertSafeUrl('https://example.com/')).rejects.toThrow();
  });

  it('allows public hosts', async () => {
    mockLookup.mockResolvedValue([{ address: '93.184.216.34', family: 4 }]);
    await expect(assertSafeUrl('https://www.allrecipes.com/recipe/1')).resolves.toBeInstanceOf(URL);
  });
});
