import type { Request, Response, NextFunction } from 'express';

// Utility function to parse cookie header string
const parseCookieString = (cookieHeader: string | undefined): Record<string, string> => {
  if (!cookieHeader) return {};

  const cookies: Record<string, string> = {};

  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.split('=');
    if (name && rest.length > 0) {
      cookies[name.trim()] = rest.join('=').trim();
    }
  });

  return cookies;
}

// Middleware function to parse cookies from request headers
const parseCookies = (req: Request, res: Response, next: NextFunction): void => {
  const cookieHeader = req.headers.cookie;
  req.cookies = parseCookieString(cookieHeader);
  next();
}

export { parseCookieString };
export default parseCookies;