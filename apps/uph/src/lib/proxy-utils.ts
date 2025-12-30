
const ALLOWED_DOMAINS = [
  'firebasestorage.googleapis.com',
  'raw.githubusercontent.com',
  'github.com',
  'images.unsplash.com',
  'avatars.githubusercontent.com'
];

export function isValidProxyUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    
    // Only allow https
    if (parsedUrl.protocol !== 'https:') {
      return false;
    }

    // Check if domain is allowed
    const hostname = parsedUrl.hostname;
    return ALLOWED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
}
