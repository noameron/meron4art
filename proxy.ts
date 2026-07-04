import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Skip API routes, Next internals, static files, and the Sanity Studio
  matcher: ['/((?!api|studio|_next|_vercel|.*\\..*).*)'],
};
