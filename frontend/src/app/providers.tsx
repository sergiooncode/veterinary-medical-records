import React from 'react';

/**
 * Global providers wrapper
 * Placeholder for future providers (Query, Auth, Theme, etc.)
 */
export function Providers({ children }: { children: React.ReactNode }): JSX.Element {
  return <>{children}</>;
}

/**
 * App providers - alias for Providers
 * Can be extended with additional providers in the future
 */
export function AppProviders({ children }: { children: React.ReactNode }): JSX.Element {
  return <Providers>{children}</Providers>;
}

