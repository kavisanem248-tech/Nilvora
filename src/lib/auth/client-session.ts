export async function requireSignedInForAction(): Promise<boolean> {
  const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  try {
    const response = await fetch('/api/auth/me', { cache: 'no-store' });
    if (response.ok) {
      const result = await response.json() as { authenticated?: boolean };
      if (result.authenticated) return true;
    }
  } catch {
    // Treat an unverifiable session as signed out; the protected action must not continue.
  }

  window.location.assign(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  return false;
}
