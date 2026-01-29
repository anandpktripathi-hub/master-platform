import { useLocation } from 'react-router-dom';

export function useTenantPath(): string | null {
  const { pathname } = useLocation();
  const match = pathname.match(/^\/tenant\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}
