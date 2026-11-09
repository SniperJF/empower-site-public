import ip from 'ipaddr.js';

// Function to normalize IP addresses
const normalizeIpAddress = async (ipAddress: string) => {
  const addr = ip.parse(ipAddress);
  const format = addr.kind();

  if (format === 'ipv4') {
    const normalized = addr.toNormalizedString();
    return normalized;
  } else if (format === 'ipv6') {
    const normalized = addr.toNormalizedString();
    return normalized;
  } else {
    throw new Error('Invalid IP address format');
  }
}

export default normalizeIpAddress;
