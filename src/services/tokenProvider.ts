/**
 * Token provider for Auth0 authentication
 * Maintains a reference to a function that retrieves the token
 */

// Using a more flexible signature that matches Auth0's getAccessTokenSilently
let tokenGetter: (() => Promise<string>) | null = null;

/**
 * Set the function that will be used to get the token
 * This should be called from a component with access to Auth0 context
 */
export function setTokenGetter(fn: () => Promise<string>) {
  tokenGetter = fn;
}

/**
 * Get the auth token using the stored getter function
 * Used by the axios interceptor
 */
export async function getToken(): Promise<string | undefined> {
  if (tokenGetter) {
    try {
      return await tokenGetter();
    } catch (error) {
      console.error('Error getting token:', error);
      return undefined;
    }
  }
  return undefined;
} 