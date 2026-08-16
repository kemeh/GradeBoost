import { ComponentType, lazy, LazyExoticComponent } from 'react';

/**
 * Wraps dynamic React.lazy imports with automated retry and cache-bust/reload logic
 * to smoothly recover from stale chunk hashes or temporary network hiccups.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): LazyExoticComponent<T> {
  return lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );

    try {
      const module = await factory();
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return module;
    } catch (error) {
      console.warn('Dynamic import failed, attempting reload recovery...', error);

      if (!pageHasAlreadyBeenForceRefreshed) {
        // Assume Vite chunk hash changed or stale cache, force refresh to load the latest module graph
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        window.location.reload();
        return new Promise<{ default: T }>(() => {});
      }

      // If already refreshed once, wait briefly and retry factory
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const retryModule = await factory();
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
        return retryModule;
      } catch (retryError) {
        console.error('Dynamic import failed after retry:', retryError);
        throw retryError;
      }
    }
  });
}
