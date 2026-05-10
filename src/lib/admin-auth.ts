export const ADMIN_AUTH_COOKIE = 'admin_auth_token';
export const ADMIN_AUTH_MAX_AGE = 60 * 60 * 24 * 7;

export async function createAdminAuthToken(password: string): Promise<string> {
  const payload = `kenny-dev-hub:${password}`;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function isValidAdminToken(token: string | undefined): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || !token) return false;

  const expected = await createAdminAuthToken(password);
  return token === expected;
}
